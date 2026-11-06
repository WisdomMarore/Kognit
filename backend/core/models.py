import uuid
from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone

from django.contrib.auth.models import BaseUserManager

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)
    
class User(AbstractUser):
    email = models.EmailField(unique=True)
    is_lifetime_free = models.BooleanField(
        default=False,
        help_text="Toggle in Django admin to give this user free access forever, bypassing billing."
    )

    USERNAME_FIELD = "email"   # login with email instead of username
    REQUIRED_FIELDS = []
    objects = UserManager()  

    def save(self, *args, **kwargs):
        if not self.username:
            self.username = self.email
        super().save(*args, **kwargs)

    def __str__(self):
        return self.email


class Deck(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="decks")
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class Card(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    deck = models.ForeignKey(Deck, on_delete=models.CASCADE, related_name="cards")
    front = models.TextField()
    back = models.TextField()

    # SM-2 scheduling state â€” read/updated after every review
    ease_factor = models.FloatField(default=2.5)
    interval_days = models.PositiveIntegerField(default=0)
    repetitions = models.PositiveIntegerField(default=0)
    next_review_date = models.DateField(default=timezone.localdate)
    last_reviewed_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [models.Index(fields=["deck", "next_review_date"])]

    def __str__(self):
        return self.front[:50]


class ReviewLog(models.Model):
    class Rating(models.IntegerChoices):
        AGAIN = 0, "Again"
        HARD = 1, "Hard"
        GOOD = 2, "Good"
        EASY = 3, "Easy"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    card = models.ForeignKey(Card, on_delete=models.CASCADE, related_name="review_logs")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="review_logs")
    rating = models.IntegerField(choices=Rating.choices)

    ease_factor = models.FloatField()
    interval_days = models.PositiveIntegerField()
    repetitions = models.PositiveIntegerField()

    reviewed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [models.Index(fields=["user", "reviewed_at"])]


class Subscription(models.Model):
    class Provider(models.TextChoices):
        STRIPE = "stripe", "Stripe"
        ECOCASH = "ecocash", "Ecocash"

    class Status(models.TextChoices):
        TRIALING = "trialing", "Trialing"
        ACTIVE = "active", "Active"
        PAST_DUE = "past_due", "Past due"
        CANCELED = "canceled", "Canceled"

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="subscription")
    provider = models.CharField(max_length=10, choices=Provider.choices, blank=True, default='')
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.TRIALING)

    stripe_customer_id = models.CharField(max_length=100, blank=True)
    stripe_subscription_id = models.CharField(max_length=100, blank=True)

    ecocash_msisdn = models.CharField(max_length=20, blank=True)
    ecocash_reference = models.CharField(max_length=100, blank=True)

    trial_ends_at = models.DateTimeField(null=True, blank=True)
    current_period_end = models.DateTimeField(null=True, blank=True)
    last_paid_reference = models.CharField(max_length=200, blank=True)

    def __str__(self):
        return f"{self.user.email} â€” {self.status}"
    
class SavedLink(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="saved_links")
    title = models.CharField(max_length=200)
    url = models.URLField()
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title

class Goal(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="goals")
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    target_date = models.DateField()
    deck = models.ForeignKey(Deck, null=True, blank=True, on_delete=models.SET_NULL, related_name="goals")
    completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["target_date"]

    def __str__(self):
        return self.title


class PremadeDeck(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=60, default="General")
    is_published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["category", "title"]

    def __str__(self):
        return self.title


class PremadeCard(models.Model):
    deck = models.ForeignKey(PremadeDeck, on_delete=models.CASCADE, related_name="cards")
    front = models.TextField()
    back = models.TextField()
    position = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["position"]

    def __str__(self):
        return self.front[:50]


class PremadeCopy(models.Model):
    """Records which premade decks a user has added, so they can't add one twice."""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="premade_copies")
    premade = models.ForeignKey(PremadeDeck, on_delete=models.CASCADE, related_name="copies")
    deck = models.ForeignKey(Deck, on_delete=models.CASCADE, related_name="premade_copy")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = [("user", "premade")]

