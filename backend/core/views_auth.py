from rest_framework import generics, permissions
from core.serializers import RegisterSerializer


class RegisterView(generics.CreateAPIView):
    """POST /api/auth/register/ {email, password} -> creates user."""
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]