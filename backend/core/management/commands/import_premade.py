import json
from django.core.management.base import BaseCommand, CommandError
from core.models import PremadeDeck, PremadeCard


class Command(BaseCommand):
    help = "Import a premade deck from JSON: {title, description, category, cards: [{front, back}]}"

    def add_arguments(self, parser):
        parser.add_argument("path")
        parser.add_argument("--publish", action="store_true", help="Make it visible to users")

    def handle(self, *args, **opts):
        try:
            with open(opts["path"], encoding="utf-8-sig") as f:
                data = json.load(f)
        except Exception as exc:
            raise CommandError(f"Could not read {opts['path']}: {exc}")

        deck, _ = PremadeDeck.objects.update_or_create(
            title=data["title"],
            defaults={
                "description": data.get("description", ""),
                "category": data.get("category", "General"),
                "is_published": opts["publish"],
            },
        )
        deck.cards.all().delete()  # re-importing replaces the cards
        PremadeCard.objects.bulk_create(
            [PremadeCard(deck=deck, front=c["front"], back=c["back"], position=i)
             for i, c in enumerate(data["cards"])]
        )
        self.stdout.write(self.style.SUCCESS(f"Imported '{deck.title}' with {len(data['cards'])} cards."))
