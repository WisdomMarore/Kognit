from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView, TokenObtainPairView
from core.views_auth import RegisterView
from core.serializers import EmailTokenObtainPairSerializer
from core.views import (
    DeckListCreateView, DeckDetailView,
    CardListCreateView, CardDetailView,
    DueCardsView, ReviewCardView,
    DashboardView,GenerateCardsView,
)
from core.views_billing import SubscribeView, CheckPaymentView
from core.views_billing import SubscribeView, CheckPaymentView, CreateCheckoutView
from core.views import SavedLinkListCreateView, SavedLinkDetailView
from core.views import MultipleChoiceQuizView
from core.views_goals import GoalListCreateView, GoalDetailView


class LoginView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer


urlpatterns = [
    path('goals/', GoalListCreateView.as_view(), name='goal-list-create'),
    path('goals/<uuid:pk>/', GoalDetailView.as_view(), name='goal-detail'),
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    path('decks/', DeckListCreateView.as_view(), name='deck-list-create'),
    path('decks/<uuid:pk>/', DeckDetailView.as_view(), name='deck-detail'),
    path('decks/<uuid:deck_id>/cards/', CardListCreateView.as_view(), name='card-list-create'),
    path('decks/<uuid:deck_id>/due/', DueCardsView.as_view(), name='due-cards'),
    path('cards/<uuid:pk>/', CardDetailView.as_view(), name='card-detail'),
    path('cards/<uuid:pk>/review/', ReviewCardView.as_view(), name='card-review'),
    path('dashboard/', DashboardView.as_view(), name='dashboard'),
    path('decks/<uuid:deck_id>/generate/', GenerateCardsView.as_view(), name='generate-cards'),
    path('billing/subscribe/', SubscribeView.as_view(), name='subscribe'),
    path('billing/check/', CheckPaymentView.as_view(), name='check-payment'),
    path('billing/checkout/', CreateCheckoutView.as_view(), name='checkout'),
    path('links/', SavedLinkListCreateView.as_view(), name='link-list-create'),
    path('links/<uuid:pk>/', SavedLinkDetailView.as_view(), name='link-detail'),
    path('decks/<uuid:deck_id>/quiz-mc/', MultipleChoiceQuizView.as_view(), name='quiz-mc'),
]


from core.views_library import PremadeListView, PremadeAddView

urlpatterns += [
    path('library/', PremadeListView.as_view(), name='premade-list'),
    path('library/<uuid:pk>/add/', PremadeAddView.as_view(), name='premade-add'),
]
