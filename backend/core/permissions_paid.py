from django.utils import timezone
from rest_framework.permissions import BasePermission
from core.models import Subscription


def is_paid(user):
    """Lifetime-free users and active, unexpired subscribers. Trial users are not paid."""
    if user.is_lifetime_free:
        return True
    try:
        sub = user.subscription
    except Subscription.DoesNotExist:
        return False
    if sub.status != Subscription.Status.ACTIVE:
        return False
    return sub.current_period_end is None or sub.current_period_end > timezone.now()


class IsPaidSubscriber(BasePermission):
    message = "Premade decks are available to subscribers."

    def has_permission(self, request, view):
        return is_paid(request.user)
