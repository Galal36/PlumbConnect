from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.db import models
from .models import Chat

User = get_user_model()


class ChatParticipantSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'role', 'image']


class ChatSerializer(serializers.ModelSerializer):
    sender = ChatParticipantSerializer(read_only=True)
    receiver = ChatParticipantSerializer(read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = Chat
        fields = ['id', 'sender', 'receiver', 'created_at', 'updated_at', 
                 'is_active', 'is_archived', 'last_message', 'unread_count']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_last_message(self, obj):
        last_message = obj.messages.first()
        if last_message:
            return last_message.content
        return None

    def get_unread_count(self, obj):
        request = self.context.get('request')
        if request and request.user:
            return obj.messages.filter(
                is_read=False
            ).exclude(sender=request.user).count()
        return 0


class ChatCreateSerializer(serializers.ModelSerializer):
    receiver_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Chat
        fields = ['receiver_id']

    def validate_receiver_id(self, value):
        try:
            receiver = User.objects.get(id=value)
        except User.DoesNotExist:
            raise serializers.ValidationError("المستخدم المحدد غير موجود")

        sender = self.context['request'].user

        # منع المحادثة مع النفس
        if sender.id == receiver.id:
            raise serializers.ValidationError("لا يمكنك بدء محادثة مع نفسك")

        # التحقق من قيود الأدوار
        if sender.role == 'client' and receiver.role != 'plumber':
            raise serializers.ValidationError("العملاء يمكنهم التحدث مع السباكين فقط")
        elif sender.role == 'plumber' and receiver.role != 'client':
            raise serializers.ValidationError("السباكون يمكنهم التحدث مع العملاء فقط")

        return value

    def create(self, validated_data):
        receiver_id = validated_data.pop('receiver_id')
        receiver = User.objects.get(id=receiver_id)
        sender = self.context['request'].user

        # التحقق من وجود محادثة سابقة وإرجاعها إذا وجدت
        existing_chat = Chat.objects.filter(
            models.Q(sender=sender, receiver=receiver) |
            models.Q(sender=receiver, receiver=sender)
        ).first()

        if existing_chat:
            return existing_chat

        # إنشاء محادثة جديدة
        chat = Chat.objects.create(
            sender=sender,
            receiver=receiver
        )
        return chat
