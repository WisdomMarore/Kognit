from datetime import timedelta
from django.utils import timezone
from rest_framework import permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from core.billing import start_ecocash_payment, check_payment_status, create_checkout_payment
from core.models import Subscription

PRICE = 4.99
PAID_STATES = {"paid", "awaiting delivery", "delivered"}
FAILED_STATES = {"cancelled", "failed", "refunded", "disputed"}


class SubscribeView(APIView):
    """POST /api/billing/subscribe/ {phone_number} -> starts an EcoCash payment."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        phone_number = request.data.get("phone_number")
        if not phone_number:
            return Response({"detail": "Phone number is required."}, status=400)

        try:
            response = start_ecocash_payment(request.user, PRICE, phone_number)
        except Exception:
            return Response({"detail": "Could not start payment. Please try again."}, status=502)

        if not response.success:
            print("Paynow rejected payment:", vars(response))
            return Response({"detail": "Paynow could not start this payment. Check the number and try again."}, status=400)

        sub = request.user.subscription
        sub.provider = "ecocash"
        sub.ecocash_msisdn = phone_number
        sub.ecocash_reference = response.poll_url
        sub.save()

        instructions = response.instructions
        if not isinstance(instructions, str):
            instructions = "Check your phone and approve the payment request."

        return Response({"instructions": instructions, "poll_url": response.poll_url})


class CreateCheckoutView(APIView):
    """POST /api/billing/checkout/ -> Paynow's hosted page (all enabled methods)."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            response = create_checkout_payment(request.user, PRICE)
        except Exception:
            return Response({"detail": "Could not start checkout. Please try again."}, status=502)

        if not response.success:
            print("Paynow rejected checkout:", vars(response))
            return Response({"detail": "Paynow could not start checkout. Please try again."}, status=400)

        sub = request.user.subscription
        sub.ecocash_reference = response.poll_url
        sub.save()

        return Response({"redirect_url": response.redirect_url})


class CheckPaymentView(APIView):
    """GET /api/billing/check/ -> state of the user's latest payment; applies it once when paid."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        sub = request.user.subscription
        if not sub.ecocash_reference:
            return Response({"payment": "none", "status": sub.status})

        try:
            result = check_payment_status(sub.ecocash_reference)
        except Exception:
            return Response({"detail": "Could not check payment status."}, status=502)

        raw = str(getattr(result, "status", "")).lower()

        if result.paid or raw in PAID_STATES:
            if sub.last_paid_reference != sub.ecocash_reference:
                now = timezone.now()
                still_running = (
                    sub.status == Subscription.Status.ACTIVE
                    and sub.current_period_end
                    and sub.current_period_end > now
                )
                start = sub.current_period_end if still_running else now
                sub.current_period_end = start + timedelta(days=30)
                sub.status = Subscription.Status.ACTIVE
                sub.last_paid_reference = sub.ecocash_reference
                sub.save()
            payment = "paid"
        elif raw in FAILED_STATES:
            payment = "failed"
        else:
            payment = "pending"

        return Response({"payment": payment, "status": sub.status})
