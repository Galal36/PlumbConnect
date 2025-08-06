from rest_framework_simplejwt.views import TokenObtainPairView
from .models import User, Location
from .serializers import UserSerializer, LocationSerializer, CustomTokenObtainPairSerializer
from .permissions import IsAdminOrOwner
from rest_framework.views import APIView
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response


# --- Imports for Activation ---
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str
from .tokens import account_activation_token
# ----------------------------




class LocationViewSet(viewsets.ModelViewSet):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer
    permission_classes = [permissions.IsAuthenticated]

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_permissions(self):
        if self.action=='create':
            return [permissions.AllowAny()]
        if self.action in ['update', 'partial_update', 'destroy']:
            return [IsAdminOrOwner()]
        return [permissions.IsAuthenticated()]
    
class ActivateAccountView(APIView):
    permission_classes = [permissions.AllowAny] # Anyone can access this link

    def get(self, request, uidb64, token):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None

        if user is not None and account_activation_token.check_token(user, token):
            user.status = 'active'
            user.save()
            # Here you would ideally redirect to your frontend login page
            # For an API, we can just return a success message.
            return Response({"message": "Account activated successfully!"}, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Activation link is invalid!"}, status=status.HTTP_400_BAD_REQUEST)
