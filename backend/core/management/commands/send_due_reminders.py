from django.core.management.base import BaseCommand
from core.notifications import send_due_reminders


class Command(BaseCommand):
    help = "Sends due-card reminder emails to all users with active access and cards due today."

    def handle(self, *args, **options):
        count = send_due_reminders()
        self.stdout.write(self.style.SUCCESS(f"Sent {count} reminder email(s)."))