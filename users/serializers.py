from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User, Location

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
            'role', 'status'
        ]
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': False, 'allow_null': True, 'allow_blank': True},
            'name': {'required': True},
            'image': {'required': False} # The image is not always required,

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
        if not value.isdigit() or len(value) < 8:
            raise serializers.ValidationError(_("رقم الهاتف غير صالح."))
        return value


    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
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

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['name'] = user.name
        token['role'] = user.role
        return token
