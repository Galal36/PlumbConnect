from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Message
from chats.models import Chat

User = get_user_model()


class MessageSenderSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'role', 'image']


class MessageSerializer(serializers.ModelSerializer):
    sender = MessageSenderSerializer(read_only=True)
    
    class Meta:
        model = Message
        fields = ['id', 'chat', 'sender', 'content', 'message_type', 'image', 
                 'file', 'is_read', 'created_at', 'updated_at']
        read_only_fields = ['id', 'sender', 'created_at', 'updated_at']


class MessageCreateSerializer(serializers.ModelSerializer):
    chat = serializers.IntegerField(write_only=True)

    class Meta:
        model = Message
        fields = ['chat', 'content', 'message_type', 'image', 'file']

    def validate_chat(self, value):
        try:
            chat = Chat.objects.get(id=value)
        except Chat.DoesNotExist:
            raise serializers.ValidationError("المحادثة غير موجودة")

        user = self.context['request'].user
        
        # التحقق من أن المستخدم مشارك في المحادثة
        if user not in [chat.sender, chat.receiver]:
            raise serializers.ValidationError("ليس لديك صلاحية للكتابة في هذه المحادثة")

        # التحقق من أن المحادثة نشطة
        if not chat.is_active:
            raise serializers.ValidationError("المحادثة غير نشطة")

        return value

    def validate_content(self, value):
        if value and len(value) > 2000:
            raise serializers.ValidationError("الرسالة طويلة جداً. الحد الأقصى 2000 حرف")
        return value.strip() if value else ""

    def validate(self, data):
        # Ensure that either content or image/file is provided
        content = data.get('content', '').strip()
        image = data.get('image')
        file = data.get('file')

        if not content and not image and not file:
            raise serializers.ValidationError("يجب تقديم محتوى نصي أو صورة أو ملف")

        return data

    def create(self, validated_data):
        chat_id = validated_data.pop('chat')
        chat = Chat.objects.get(id=chat_id)

        message = Message.objects.create(
            chat=chat,
            sender=self.context['request'].user,
            **validated_data
        )
        return message
