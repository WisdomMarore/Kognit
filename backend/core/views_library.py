from django.db import transaction
from django.db.models import Count
from rest_framework import permissions
from rest_framework.generics import get_object_or_404
from rest_framework.response import Response
from rest_framework.views import APIView
from core.models import Card, Deck, PremadeCopy, PremadeDeck
from core.permissions import HasActiveAccess
from core.permissions_paid import IsPaidSubscriber, is_paid


class PremadeListView(APIView):
    """GET /api/library/ -> published premade decks. Anyone with access can browse."""
    permission_classes = [permissions.IsAuthenticated, HasActiveAccess]

    def get(self, request):
        decks = PremadeDeck.objects.filter(is_published=True).annotate(card_count=Count("cards"))
        copies = {c.premade_id: c.deck_id for c in PremadeCopy.objects.filter(user=request.user)}
        data = [
            {
                "id": str(d.id),
                "title": d.title,
                "description": d.description,
                "category": d.category,
                "card_count": d.card_count,
                "added": d.id in copies,
                "my_deck": str(copies[d.id]) if d.id in copies else None,
            }
            for d in decks
        ]
        return Response({"can_add": is_paid(request.user), "decks": data})


class PremadeAddView(APIView):
    """POST /api/library/<id>/add/ -> copies the deck into the user's own decks. Subscribers only."""
    permission_classes = [permissions.IsAuthenticated, IsPaidSubscriber]

    def post(self, request, pk):
        premade = get_object_or_404(PremadeDeck, pk=pk, is_published=True)
        if PremadeCopy.objects.filter(user=request.user, premade=premade).exists():
            return Response({"detail": "You've already added this deck."}, status=400)

        with transaction.atomic():
            deck = Deck.objects.create(user=request.user, name=premade.title, description=premade.description)
            Card.objects.bulk_create(
                [Card(deck=deck, front=c.front, back=c.back) for c in premade.cards.all()]
            )
            PremadeCopy.objects.create(user=request.user, premade=premade, deck=deck)

        return Response({"deck": str(deck.id)}, status=201)
