from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Chat
from chat_messages.models import Message  # هذا الاستيراد سيعمل بمجرد توفير نموذج الرسائل
from notifications.models import Notification
from django.utils.translation import gettext_lazy as _
from django.db import models

User = get_user_model()


class UserBasicSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'name', 'role', 'image', 'is_active']


class LastMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['id', 'message', 'sent_at', 'is_read', 'message_type', 'link']


class ChatSerializer(serializers.ModelSerializer):
    sender = UserBasicSerializer(read_only=True)
    receiver = UserBasicSerializer(read_only=True)
    last_message = LastMessageSerializer(read_only=True)
    unread_count = serializers.ReadOnlyField()

    class Meta:
        model = Chat
        fields = ['id', 'sender', 'receiver', 'created_at', 'updated_at',
                  'is_active', 'is_archived', 'last_message', 'unread_count']
        read_only_fields = ['sender', 'created_at', 'updated_at']


class ChatCreateSerializer(serializers.ModelSerializer):
    receiver_id = serializers.IntegerField(write_only=True)
    is_admin_created = serializers.BooleanField(default=False, write_only=True)

    class Meta:
        model = Chat
        fields = ['receiver_id', 'is_admin_created']

    def validate_receiver_id(self, value):
        try:
            receiver = User.objects.get(id=value)
            sender = self.context['request'].user

            # التحقق من أن المحادثة بين أدوار مختلفة
            if sender.role == receiver.role:
                raise serializers.ValidationError(
                    _("Chat must be between a client and a plumber.")
                )

            # التحقق الجديد: السباك لا يستطيع بدء محادثة مع العميل
            # إلا إذا كان المسؤول هو من ينشئ المحادثة
            is_admin_created = self.initial_data.get('is_admin_created', False)
            if sender.role == 'plumber' and receiver.role == 'client' and not is_admin_created:
                raise serializers.ValidationError(
                    _("Plumbers cannot initiate chats with clients. Only clients can start conversations with plumbers.")
                )

            return value
        except User.DoesNotExist:
            raise serializers.ValidationError(_("Receiver does not exist."))

    def validate(self, data):
        sender = self.context['request'].user
        is_admin_created = data.get('is_admin_created', False)
        if is_admin_created and sender.role != 'admin':
            raise serializers.ValidationError(
                _("Only admin can create chats with is_admin_created=True.")
            )
        return data

    def create(self, validated_data):
        sender = self.context['request'].user
        receiver_id = validated_data['receiver_id']
        receiver = User.objects.get(id=receiver_id)

        chat = Chat.objects.filter(
            models.Q(sender=sender, receiver=receiver) |
            models.Q(sender=receiver, receiver=sender)
        ).first()

        if not chat:
            chat = Chat.objects.create(sender=sender, receiver=receiver)
            Notification.objects.create(
                user=receiver,
                title=_("محادثة جديدة"),
                content=_("محادثة جديدة من %(name)s") % {'name': sender.name},
                notification_type='new_chat',
                is_important=False,
                action_url=f"http://localhost:8000/api/chats/{chat.id}/"
            )

        return chat


class ChatUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chat
        fields = ['is_active', 'is_archived']
