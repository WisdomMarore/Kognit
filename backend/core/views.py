from rest_framework import generics, permissions
from core.models import Deck, Card, Subscription, SavedLink
from core.serializers import DeckSerializer, CardSerializer
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.generics import get_object_or_404
from datetime import timedelta
from core.sm2 import review_card, SM2State
from core.models import ReviewLog
from core.serializers import ReviewSerializer
from core.permissions import HasActiveAccess
import pypdf
from io import BytesIO
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from core.ai_generate import generate_flashcards_from_text
from core.ai_generate import generate_flashcards_from_text, generate_flashcards_from_image
from core.serializers import SavedLinkSerializer
import random
from core.ai_generate import generate_distractors




class DeckListCreateView(generics.ListCreateAPIView):
    """GET  /api/decks/        -> list the logged-in user's decks
       POST /api/decks/        -> create a new deck for them"""
    serializer_class = DeckSerializer
    permission_classes = [permissions.IsAuthenticated, HasActiveAccess]

    def get_queryset(self):
        return Deck.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class DeckDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET/PUT/PATCH/DELETE /api/decks/<id>/"""
    serializer_class = DeckSerializer
    permission_classes = [permissions.IsAuthenticated, HasActiveAccess]

    def get_queryset(self):
        return Deck.objects.filter(user=self.request.user)


class CardListCreateView(generics.ListCreateAPIView):
    """GET  /api/decks/<deck_id>/cards/   -> list cards in that deck
       POST /api/decks/<deck_id>/cards/   -> add a card to that deck"""
    serializer_class = CardSerializer
    permission_classes = [permissions.IsAuthenticated, HasActiveAccess]

    def get_queryset(self):
        return Card.objects.filter(
            deck_id=self.kwargs['deck_id'],
            deck__user=self.request.user,
        )

    def perform_create(self, serializer):
        deck = Deck.objects.get(id=self.kwargs['deck_id'], user=self.request.user)
        serializer.save(deck=deck)


class CardDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET/PUT/PATCH/DELETE /api/cards/<id>/"""
    serializer_class = CardSerializer
    permission_classes = [permissions.IsAuthenticated, HasActiveAccess]

    def get_queryset(self):
        return Card.objects.filter(deck__user=self.request.user)
    
class DueCardsView(generics.ListAPIView):
    """GET /api/decks/<deck_id>/due/ -> cards in this deck due today or earlier."""
    serializer_class = CardSerializer
    permission_classes = [permissions.IsAuthenticated, HasActiveAccess]

    def get_queryset(self):
        today = timezone.localdate()
        return Card.objects.filter(
            deck_id=self.kwargs['deck_id'],
            deck__user=self.request.user,
            next_review_date__lte=today,
        )


class ReviewCardView(APIView):
    """POST /api/cards/<id>/review/ {rating: 0-3} -> applies SM-2, returns updated card."""
    permission_classes = [permissions.IsAuthenticated, HasActiveAccess]

    def post(self, request, pk):
        card = get_object_or_404(Card, id=pk, deck__user=request.user)
        serializer = ReviewSerializer(data=request.data)
        
        serializer.is_valid(raise_exception=True)
        rating = serializer.validated_data['rating']

        # Run the pure SM-2 function
        old_state = SM2State(
            ease_factor=card.ease_factor,
            interval_days=card.interval_days,
            repetitions=card.repetitions,
        )
        new_state = review_card(rating, old_state)

        # Apply the result to the card
        card.ease_factor = new_state.ease_factor
        card.interval_days = new_state.interval_days
        card.repetitions = new_state.repetitions
        card.next_review_date = timezone.localdate() + timedelta(days=new_state.interval_days)
        card.last_reviewed_at = timezone.now()
        card.save()

        # Log this review permanently
        ReviewLog.objects.create(
            card=card,
            user=request.user,
            rating=rating,
            ease_factor=new_state.ease_factor,
            interval_days=new_state.interval_days,
            repetitions=new_state.repetitions,
        )

        return Response(CardSerializer(card).data)
    
class DashboardView(APIView):
    """GET /api/dashboard/ -> due counts, today's review count, streak."""
    permission_classes = [permissions.IsAuthenticated, HasActiveAccess]

    def get(self, request):
        today = timezone.localdate()
        user = request.user

        # Due counts, per deck and total
        decks = Deck.objects.filter(user=user)
        deck_breakdown = []
        total_due = 0
        for deck in decks:
            due_count = deck.cards.filter(next_review_date__lte=today).count()
            deck_breakdown.append({
                'deck_id': deck.id,
                'deck_name': deck.name,
                'due_count': due_count,
            })
            total_due += due_count

        # Reviewed today
        reviewed_today = ReviewLog.objects.filter(
            user=user,
            reviewed_at__date=today,
        ).count()

        # Streak: count consecutive days backward from today with at least one review
        streak = 0
        day = today
        while ReviewLog.objects.filter(user=user, reviewed_at__date=day).exists():
            streak += 1
            day -= timedelta(days=1)

        sub = user.subscription
        trial_days_left = None
        if sub.status == Subscription.Status.TRIALING and sub.trial_ends_at:
            trial_days_left = max(0, (sub.trial_ends_at.date() - today).days)

        return Response({
            'total_due': total_due,
            'decks': deck_breakdown,
            'reviewed_today': reviewed_today,
            'streak_days': streak,
            'subscription_status': sub.status,
            'trial_days_left': trial_days_left,
        })
    
class GenerateCardsView(APIView):
    """POST /api/decks/<deck_id>/generate/
       Accepts {"text": "..."} (pasted notes), or a multipart "file" that is
       either a PDF or an image (photo of notes/textbook/whiteboard).
       Returns the newly created cards."""
    permission_classes = [permissions.IsAuthenticated, HasActiveAccess]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def post(self, request, deck_id):
        deck = get_object_or_404(Deck, id=deck_id, user=request.user)

        text = request.data.get('text', '')
        uploaded_file = request.FILES.get('file')

        try:
            if uploaded_file and uploaded_file.content_type == 'application/pdf':
                reader = pypdf.PdfReader(BytesIO(uploaded_file.read()))
                text = "\n".join(page.extract_text() or '' for page in reader.pages)
                flashcards = generate_flashcards_from_text(text)
            elif uploaded_file and uploaded_file.content_type.startswith('image/'):
                flashcards = generate_flashcards_from_image(
                    uploaded_file.read(), uploaded_file.content_type
                )
            elif text.strip():
                flashcards = generate_flashcards_from_text(text)
            else:
                return Response({'detail': 'No text, PDF, or image provided.'}, status=400)
        except Exception:
            import traceback
            traceback.print_exc()
            return Response({'detail': 'Card generation failed. Please try again in a moment.'}, status=502)

        created_cards = [
            Card.objects.create(deck=deck, front=fc['front'], back=fc['back'])
            for fc in flashcards
            if fc.get('front') and fc.get('back')
        ]

        return Response(CardSerializer(created_cards, many=True).data, status=201)

from core.models import SavedLink
from core.serializers import SavedLinkSerializer

class SavedLinkListCreateView(generics.ListCreateAPIView):
    serializer_class = SavedLinkSerializer
    permission_classes = [permissions.IsAuthenticated, HasActiveAccess]

    def get_queryset(self):
        return SavedLink.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class SavedLinkDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = SavedLinkSerializer
    permission_classes = [permissions.IsAuthenticated, HasActiveAccess]

    def get_queryset(self):
        return SavedLink.objects.filter(user=self.request.user)
    



class MultipleChoiceQuizView(APIView):
    """GET /api/decks/<deck_id>/quiz-mc/ -> generates a multiple-choice quiz
    from the deck's existing cards (AI-generated distractors, not stored)."""
    permission_classes = [permissions.IsAuthenticated, HasActiveAccess]

    def get(self, request, deck_id):
        deck = get_object_or_404(Deck, id=deck_id, user=request.user)
        cards = list(deck.cards.all()[:20])  # cap for cost/time predictability

        if len(cards) < 4:
            return Response({'detail': 'Add at least 4 cards to this deck for a multiple-choice quiz.'}, status=400)

        card_payload = [{'index': i, 'front': c.front, 'back': c.back} for i, c in enumerate(cards)]
        try:
            distractors_by_index = generate_distractors(card_payload)
        except Exception:
            return Response({'detail': 'Could not generate the quiz. Please try again.'}, status=502)

        questions = []
        for i, card in enumerate(cards):
            distractors = distractors_by_index.get(i, [])
            options = [card.back] + distractors
            random.shuffle(options)
            questions.append({
                'id': str(card.id),
                'question': card.front,
                'options': options,
                'correct_answer': card.back,
            })

        return Response({'questions': questions})