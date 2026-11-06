from django.utils import timezone
from rest_framework.permissions import BasePermission
from core.models import Subscription


def has_access(user):
    """Lifetime-free, a running trial, or an active subscription that hasn't expired.
    A blank current_period_end means no expiry (older or manually activated accounts)."""
    if user.is_lifetime_free:
        return True
    try:
        sub = user.subscription
    except Subscription.DoesNotExist:
        return False
    now = timezone.now()
    if sub.status == Subscription.Status.ACTIVE:
        return sub.current_period_end is None or sub.current_period_end > now
    if sub.status == Subscription.Status.TRIALING:
        return bool(sub.trial_ends_at and sub.trial_ends_at > now)
    return False


class HasActiveAccess(BasePermission):
    message = "Your access has ended. Subscribe to keep using Kognit."

    def has_permission(self, request, view):
        return has_access(request.user)
