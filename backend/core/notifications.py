from core.permissions import has_access
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from core.models import Deck, Subscription


def send_due_reminders():
    """Finds every user with cards due today and emails them a daily summary.
    Only runs when explicitly triggered (manually or by a scheduler) --
    never fires automatically when a card becomes due.
    Returns the number of emails sent."""
    today = timezone.localdate()
    sent = 0

    for sub in Subscription.objects.select_related("user").all():
        user = sub.user
        is_active = has_access(user)
        if not is_active:
            continue

        decks = Deck.objects.filter(user=user)
        due_decks = []
        total_due = 0
        for deck in decks:
            count = deck.cards.filter(next_review_date__lte=today).count()
            if count > 0:
                due_decks.append((deck.name, count))
                total_due += count

        if total_due == 0:
            continue

        deck_lines = "\n".join(f"  - {name}: {count} due" for name, count in due_decks)
        message = (
            f"You have {total_due} card{"s" if total_due != 1 else ""} due today:\n\n"
            f"{deck_lines}\n\n"
            f"Review them: {settings.FRONTEND_URL}/dashboard\n\n"
            f"-- Kognit"
        )

        send_mail(
            subject=f"{total_due} card{"s" if total_due != 1 else ""} due today -- Kognit",
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=True,
        )
        sent += 1

    return sent

