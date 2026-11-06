from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from core.models import Deck, Card
from datetime import timedelta
from django.conf import settings
from django.utils import timezone
from core.models import Subscription
from core.models import SavedLink


User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])

    class Meta:
        model = User
        fields = ['email', 'password']

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
        )
        Subscription.objects.create(
            user=user,
            status=Subscription.Status.TRIALING,
            trial_ends_at=timezone.now() + timedelta(days=settings.TRIAL_DAYS),
        )
        return user

class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = User.USERNAME_FIELD  # 'email'



class DeckSerializer(serializers.ModelSerializer):
    card_count = serializers.IntegerField(source='cards.count', read_only=True)

    class Meta:
        model = Deck
        fields = ['id', 'name', 'description', 'card_count', 'created_at']
        read_only_fields = ['id', 'created_at']


class CardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Card
        fields = [
            'id', 'deck', 'front', 'back',
            'ease_factor', 'interval_days', 'repetitions',
            'next_review_date', 'last_reviewed_at', 'created_at',
        ]
        read_only_fields = [
            'id', 'deck', 'ease_factor', 'interval_days', 'repetitions',
            'next_review_date', 'last_reviewed_at', 'created_at',
        ]

class ReviewSerializer(serializers.Serializer):
    """Not tied to a model — just validates the incoming rating."""
    rating = serializers.ChoiceField(choices=[0, 1, 2, 3])  # Again/Hard/Good/Easy


class SavedLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavedLink
        fields = ['id', 'title', 'url', 'notes', 'created_at']
        read_only_fields = ['id', 'created_at']