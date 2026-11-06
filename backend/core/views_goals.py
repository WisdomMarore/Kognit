from rest_framework import generics, permissions
from core.models import Goal
from core.permissions import HasActiveAccess
from core.serializers_goals import GoalSerializer


class GoalListCreateView(generics.ListCreateAPIView):
    serializer_class = GoalSerializer
    permission_classes = [permissions.IsAuthenticated, HasActiveAccess]

    def get_queryset(self):
        return Goal.objects.filter(user=self.request.user).select_related("deck")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class GoalDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = GoalSerializer
    permission_classes = [permissions.IsAuthenticated, HasActiveAccess]

    def get_queryset(self):
        return Goal.objects.filter(user=self.request.user).select_related("deck")
