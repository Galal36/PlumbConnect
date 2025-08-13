from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User, Location

from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import User  
<<<<<<< HEAD
from django.utils.translation import gettext as _  
=======
>>>>>>> plumb_


# --- Imports for Email Sending ---
from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes
from .tokens import account_activation_token
from django.conf import settings
# ---------------------------------

# --- Imports for Password Reset ---
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_str
# ----------------------------------

class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = ['id', 'city']

class UserSerializer(serializers.ModelSerializer):
    location = LocationSerializer(read_only=True)
    location_id = serializers.PrimaryKeyRelatedField(
        queryset=Location.objects.all(),
        source='location',
        write_only=True
    )

    class Meta:
        model = User
        fields = [
            'id', 'name', 'email', 'phone', 'password', 'location', 'location_id',
<<<<<<< HEAD
            'role', 'status', 'image'
=======
            'role', 'status'
>>>>>>> plumb_
        ]
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': False, 'allow_null': True, 'allow_blank': True},
            'name': {'required': True},
            'image': {'required': False}, # The image is not always required,
            'status': {'read_only': True}, # Status should not be set by user
<<<<<<< HEAD
            'image': {'required': False}, # The image is not always required,
            'status': {'read_only': True}, # Status should not be set by user
=======
>>>>>>> plumb_

        }



    def validate_email(self, value):
        """تحقق أن الإيميل غير مكرر إذا تم إدخاله"""
        if value:
            if User.objects.filter(email=value).exists():
                raise serializers.ValidationError(_("البريد الإلكتروني مستخدم بالفعل."))
        return value

    def validate_name(self, value):
        """الاسم مطلوب ولا يمكن أن يكون فارغًا"""
        if not value.strip():
            raise serializers.ValidationError(_("الاسم لا يمكن أن يكون فارغًا."))
        return value
    
    def validate_phone(self, value):
<<<<<<< HEAD
        # Remove any non-digit characters (like +965)
        clean_phone = ''.join(filter(str.isdigit, value))
        if len(clean_phone) < 8:
            raise serializers.ValidationError(_("رقم الهاتف غير صالح."))
        
        # Check for uniqueness, excluding the current user if this is an update
        if User.objects.filter(phone=clean_phone).exclude(pk=self.instance.pk if self.instance else None).exists():
            raise serializers.ValidationError(_("رقم الهاتف مستخدم بالفعل."))
        
        return clean_phone
=======
        if not value.isdigit() or len(value) < 8:
            raise serializers.ValidationError(_("رقم الهاتف غير صالح."))
        return value
>>>>>>> plumb_


    def create(self, validated_data):
            # Create the user with status='inactive'
<<<<<<< HEAD
            # The create_user method already handles password setting
            user = User.objects.create_user(**validated_data)
=======
            user = User.objects.create_user(**validated_data)
            user.set_password(validated_data['password'])
            user.save()
>>>>>>> plumb_

            # --- Send Confirmation Email ---
            token = account_activation_token.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            
            # This will be the link in the email.
            # You will need to replace 'your-frontend-domain.com' with your actual frontend URL.
<<<<<<< HEAD
            activation_link = f"http://localhost:8080/activate/{uid}/{token}"
=======
            activation_link = f"http://your-frontend-domain.com/activate/{uid}/{token}"
>>>>>>> plumb_

            subject = 'Activate Your PlumbConnect Account'
            message = f"""
            Hi {user.name},

            Thank you for registering at PlumbConnect. Please click the link below to activate your account:
            {activation_link}

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
            # -----------------------------

            return user



    def update(self, instance, validated_data):
        # The 'password' field represents the new password.
        # We get it from initial_data to ensure we always have access to it.
        new_password = self.initial_data.get('password')
        old_password = self.initial_data.get('old_password')
        
        # The parent class handle the regular profile updates (name, email, etc.)
        # We remove password fields from validated_data to prevent the default update behavior.
        # to prevent hashing I used pop
        validated_data.pop('password', None)
        validated_data.pop('old_password', None)
        user = super().update(instance, validated_data)

        # Handle password change separately
        if new_password:
            if not old_password:
                raise serializers.ValidationError({'old_password': 'This field is required when setting a new password.'})
            
            if not instance.check_password(old_password):
                raise serializers.ValidationError({'old_password': 'Your old password was entered incorrectly. Please enter it again.'})
            
            # If the old password is correct, set the new password
            user.set_password(new_password)
            user.save()

        return user
    


    def to_representation(self, instance):
        """Controls the output (what is shown to the user)."""
        representation = super().to_representation(instance)
        # If the user is not a plumber, remove the image field from the response.
        if instance.role != 'plumber':
            representation.pop('image', None)
        return representation

    def validate(self, data):
        """
        Controls the input (what is accepted from the user).
        Called during user creation and updates.
        """
        # If an image is provided but the role is not 'plumber', raise an error.
        if 'image' in data and data.get('image') is not None:
            # Check the role from the input data or from the existing user instance
            role = data.get('role') if 'role' in data else getattr(self.instance, 'role', None)
            if role != 'plumber':
                raise serializers.ValidationError({"image": "Only users with the 'plumber' role can have an image."})
        return data

# Loggin in
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'email'  # ensures DRF uses email as the identifier

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        user = authenticate(email=email, password=password)
        if not user:
            raise serializers.ValidationError("Invalid email or password")

        # ---  security check ---
        if user.status != 'active':
            raise serializers.ValidationError("This account is not active. Please check your email for the activation link.")
        # -----------------------------

        refresh = RefreshToken.for_user(user)

        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }
class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        if not User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("No user is associated with this email address.")
        return value

class PasswordResetConfirmSerializer(serializers.Serializer):
    uidb64 = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        try:
            uid = force_str(urlsafe_base64_decode(attrs.get('uidb64')))
            self.user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            raise serializers.ValidationError('The reset link is invalid.')

        if not default_token_generator.check_token(self.user, attrs.get('token')):
            raise serializers.ValidationError('The reset link is invalid or has expired.')
        
        return attrs

    def save(self):
        self.user.set_password(self.validated_data['new_password'])
        self.user.save()
        return self.user
