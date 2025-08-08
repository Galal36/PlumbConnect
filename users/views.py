from rest_framework_simplejwt.views import TokenObtainPairView
from .models import User, Location
from .permissions import IsAdminOrOwner
from rest_framework.views import APIView
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response


# --- Imports for Activation ---
#forgetting password
from .serializers import (
    UserSerializer, LocationSerializer, CustomTokenObtainPairSerializer,
    PasswordResetRequestSerializer, PasswordResetConfirmSerializer # Import new serializers
)

# --- Imports for Activation & Password Reset ---
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.utils.encoding import force_str, force_bytes
from .tokens import account_activation_token
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.conf import settings
# ---------------------------------------------


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
        #New users can registers with any type of authentication!
        if self.action=='create':
            return [permissions.AllowAny()]
        #Just the admin or the owner of the account can do these
        if self.action in ['update', 'partial_update', 'destroy']:
            return [IsAdminOrOwner()]
        return [permissions.IsAuthenticated()]  # ✅ everything else needs token
    
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

#Password Reset
class PasswordResetRequestView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            user = User.objects.get(email__iexact=email)
            
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)

            # Replace with your frontend URL
            reset_link = f"http://your-frontend-domain.com/reset-password/{uid}/{token}"

            subject = 'Password Reset for Your PlumbConnect Account'
            message = f"""
            Hi {user.name},

            You requested a password reset. Please click the link below to set a new password:
            {reset_link}

            If you did not request this, please ignore this email.

            Thanks,
            The PlumbConnect Team
            """
            
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                fail_silently=False,
            )
            return Response({"message": "Password reset link has been sent to your email."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PasswordResetConfirmView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Password has been reset successfully."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
