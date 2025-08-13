from rest_framework import serializers
from .models import Notification
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _

User = get_user_model()

class NotificationSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.name', read_only=True)

    class Meta:
        model = Notification
        fields = ['id', 'user', 'user_name', 'title', 'content', 'notification_type',
                  'is_read', 'is_important', 'created_at', 'action_url',
                  'content_type', 'object_id']
        read_only_fields = ['user', 'created_at', 'content_type', 'object_id']

class NotificationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['user', 'title', 'content', 'notification_type', 'is_important',
                  'action_url', 'content_type', 'object_id']

    def validate(self, data):
        request = self.context.get('request')
        if request and request.user.role != 'admin':
            raise serializers.ValidationError(
                _("Only admin can create notifications manually.")
            )
        return data

class NotificationUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['is_read']