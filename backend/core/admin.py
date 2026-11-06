from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from core.models import User, Deck, Card, ReviewLog, Subscription, SavedLink



class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ("Billing override", {"fields": ("is_lifetime_free",)}),
    )
    list_display = ("email", "is_staff", "is_lifetime_free")


admin.site.register(User, CustomUserAdmin)
admin.site.register(Deck)
admin.site.register(Card)
admin.site.register(ReviewLog)
admin.site.register(Subscription)
admin.site.register(SavedLink)

from core.models import PremadeDeck, PremadeCard


class PremadeCardInline(admin.TabularInline):
    model = PremadeCard
    extra = 3


class PremadeDeckAdmin(admin.ModelAdmin):
    list_display = ("title", "category", "is_published")
    list_filter = ("category", "is_published")
    inlines = [PremadeCardInline]


admin.site.register(PremadeDeck, PremadeDeckAdmin)

