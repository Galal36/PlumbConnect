from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Message
from chats.models import Chat

User = get_user_model()

class MessageSerializer(serializers.ModelSerializer):
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

        # Determine receiver
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

        # Update chat timestamp
        chat.save()

        return message

    def validate_chat_id(self, value):
        try:
            chat = Chat.objects.get(id=value)
            if self.context['request'].user not in [chat.sender, chat.receiver]:
                raise serializers.ValidationError("You are not a participant in this chat.")
            if chat.sender.role == chat.receiver.role:
                raise serializers.ValidationError("Chat must be between a client and a plumber.")
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