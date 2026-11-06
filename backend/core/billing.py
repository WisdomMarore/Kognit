import time
from paynow import Paynow
from django.conf import settings


def get_paynow_client():
    return Paynow(
        settings.PAYNOW_INTEGRATION_ID,
        settings.PAYNOW_INTEGRATION_KEY,
        settings.PAYNOW_RETURN_URL,
        settings.PAYNOW_RESULT_URL,
    )


def _new_payment(paynow, user, amount):
    # Unique reference per attempt, and the customer's own email (not the merchant's)
    payment = paynow.create_payment(f"recall-{user.id}-{int(time.time())}", user.email)
    payment.add("Kognit subscription", amount)
    return payment


def start_ecocash_payment(user, amount, phone_number):
    paynow = get_paynow_client()
    return paynow.send_mobile(_new_payment(paynow, user, amount), phone_number, "ecocash")


def create_checkout_payment(user, amount):
    paynow = get_paynow_client()
    return paynow.send(_new_payment(paynow, user, amount))


def check_payment_status(poll_url):
    return get_paynow_client().check_transaction_status(poll_url)
