from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Message
from chats.models import Chat
from notifications.models import Notification
from django.utils.translation import gettext_lazy as _
<<<<<<< HEAD
=======
from django.contrib.contenttypes.models import ContentType # <--- إضافة هذا الاستيراد
>>>>>>> plumb_

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
<<<<<<< HEAD
        fields = ['id', 'name', 'role', 'image', 'is_verified']
=======
        fields = ['id', 'name', 'role', 'image', 'status']
>>>>>>> plumb_

class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    receiver = UserSerializer(read_only=True)
    sender_name = serializers.CharField(source='sender.name', read_only=True)
    receiver_name = serializers.CharField(source='receiver.name', read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'message', 'image', 'message_type', 'chat', 'sender',
                  'receiver', 'sent_at', 'is_read', 'sender_name', 'receiver_name', 'link']
        read_only_fields = ['sender', 'sent_at']

class MessageCreateSerializer(serializers.ModelSerializer):
    chat_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Message
        fields = ['message', 'image', 'message_type', 'chat_id', 'link']

    def create(self, validated_data):
        chat_id = validated_data.pop('chat_id')
        chat = Chat.objects.get(id=chat_id)
        sender = self.context['request'].user
        if chat.sender == sender:
            receiver = chat.receiver
        else:
            receiver = chat.sender

        message = Message.objects.create(
            sender=sender,
            receiver=receiver,
            chat=chat,
            **validated_data
        )
        chat.save()

<<<<<<< HEAD
=======
        # <--- التعديل هنا: جلب كائن ContentType الفعلي
        message_content_type = ContentType.objects.get_for_model(Message)

>>>>>>> plumb_
        Notification.objects.create(
            user=receiver,
            title=_("رسالة جديدة"),
            content=_("لديك رسالة جديدة من %(name)s") % {'name': sender.name},
            notification_type="new_message",
            is_important=False,
            action_url=f"http://localhost:8000/api/chats/{chat.id}/",
<<<<<<< HEAD
            content_type="chat_messages.message",
=======
            content_type=message_content_type, # <--- استخدام الكائن هنا
>>>>>>> plumb_
            object_id=message.id
        )

        return message

    def validate_chat_id(self, value):
        try:
            chat = Chat.objects.get(id=value)
            if self.context['request'].user not in [chat.sender, chat.receiver]:
                raise serializers.ValidationError("You are not a participant in this chat.")
<<<<<<< HEAD
            if chat.sender.role == chat.receiver.role:
                raise serializers.ValidationError("Chat must be between a client and a plumber.")
=======
            # تم إزالة التحقق من دور المستخدمين هنا
>>>>>>> plumb_
            return value
        except Chat.DoesNotExist:
            raise serializers.ValidationError("Chat does not exist.")

    def validate(self, data):
        message_type = data.get('message_type')
        image = data.get('image')
        if message_type == 'image' and not image:
            raise serializers.ValidationError({"image": "An image is required for image-type messages."})
        if message_type != 'image' and image:
            raise serializers.ValidationError({"image": "Image should only be provided for image-type messages."})
        return data

class MessageUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['is_read']
