from rest_framework import serializers
from core.models import Goal


class GoalSerializer(serializers.ModelSerializer):
    deck_name = serializers.SerializerMethodField()
    total_cards = serializers.SerializerMethodField()
    started_cards = serializers.SerializerMethodField()
    learned_cards = serializers.SerializerMethodField()

    class Meta:
        model = Goal
        fields = [
            "id", "title", "description", "target_date", "deck", "deck_name",
            "completed", "created_at", "total_cards", "started_cards", "learned_cards",
        ]
        read_only_fields = ["id", "created_at"]

    def get_deck_name(self, obj):
        return obj.deck.name if obj.deck else None

    def get_total_cards(self, obj):
        return obj.deck.cards.count() if obj.deck else 0

    def get_started_cards(self, obj):
        # reviewed: recalled correctly at least once
        return obj.deck.cards.filter(repetitions__gte=1).count() if obj.deck else 0

    def get_learned_cards(self, obj):
        # learned: recalled correctly at least twice in a row
        return obj.deck.cards.filter(repetitions__gte=2).count() if obj.deck else 0

    def validate_deck(self, deck):
        request = self.context["request"]
        if deck is not None and deck.user_id != request.user.id:
            raise serializers.ValidationError("Invalid deck.")
        return deck
