from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'title', 'content', 'notification_type', 'is_read', 
                 'is_important', 'action_url', 'created_at', 'read_at']
        read_only_fields = ['id', 'created_at', 'read_at']


class NotificationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['title', 'content', 'notification_type', 'is_important', 'action_url']

    def validate_title(self, value):
        if not value.strip():
            raise serializers.ValidationError("عنوان الإشعار مطلوب")
        return value.strip()

    def validate_content(self, value):
        if not value.strip():
            raise serializers.ValidationError("محتوى الإشعار مطلوب")
        return value.strip()
