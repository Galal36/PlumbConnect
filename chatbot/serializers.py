from rest_framework import serializers
from .models import ChatBotConversation, ChatBotMessage
from django.contrib.auth import get_user_model

User = get_user_model()


class ChatBotMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatBotMessage
        fields = ['id', 'message_type', 'content', 'ai_model', 'tokens_used',
                  'response_time', 'created_at']
        read_only_fields = ['id', 'ai_model', 'tokens_used', 'response_time', 'created_at']


class ChatBotConversationSerializer(serializers.ModelSerializer):
    messages = ChatBotMessageSerializer(many=True, read_only=True)
    message_count = serializers.SerializerMethodField()

    class Meta:
        model = ChatBotConversation
        fields = ['id', 'session_id', 'created_at', 'updated_at', 'is_active',
                  'messages', 'message_count']
        read_only_fields = ['id', 'session_id', 'created_at', 'updated_at']

    def get_message_count(self, obj):
        return obj.messages.count()


class ChatBotMessageCreateSerializer(serializers.ModelSerializer):
    session_id = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = ChatBotMessage
        fields = ['content', 'session_id']

    def validate_content(self, value):
        if not value.strip():
            raise serializers.ValidationError("محتوى الرسالة لا يمكن أن يكون فارغاً")
        if len(value) > 2000:
            raise serializers.ValidationError("الرسالة طويلة جداً. الحد الأقصى 2000 حرف")
        return value.strip()
