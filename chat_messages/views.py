from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db import models
from .models import Message
from .serializers import MessageSerializer, MessageCreateSerializer
from .permissions import IsAdminOrChatParticipant


class MessageListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['message_type', 'is_read', 'chat']
    search_fields = ['content']
    ordering = ['created_at']

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return MessageCreateSerializer
        return MessageSerializer

    def get_queryset(self):
        user = self.request.user

        # Admins can see all messages
        if user.role == 'admin':
            return Message.objects.filter(
                is_deleted=False
            ).select_related('sender', 'chat')

        # Regular users can only see messages from their chats
        return Message.objects.filter(
            models.Q(chat__sender=user) | models.Q(chat__receiver=user),
            is_deleted=False
        ).select_related('sender', 'chat')

    def create(self, request, *args, **kwargs):
        # Use MessageCreateSerializer for validation and creation
        create_serializer = MessageCreateSerializer(data=request.data, context={'request': request})
        create_serializer.is_valid(raise_exception=True)
        message = create_serializer.save()

        # Return the full message data using MessageSerializer
        response_serializer = MessageSerializer(message, context={'request': request})
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)


class MessageDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrChatParticipant]

    def get_queryset(self):
        user = self.request.user

        # Admins can see all messages
        if user.role == 'admin':
            return Message.objects.all().select_related('sender', 'chat')

        # Regular users can only see messages from their chats
        return Message.objects.filter(
            models.Q(chat__sender=user) | models.Q(chat__receiver=user)
        ).select_related('sender', 'chat')

    def perform_destroy(self, instance):
        # حذف ناعم
        instance.is_deleted = True
        instance.save()


class MessageMarkReadView(generics.UpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Message.objects.filter(
            chat__receiver=user,
            is_read=False
        )

    def update(self, request, *args, **kwargs):
        chat_id = request.data.get('chat_id')
        
        if chat_id:
            # تحديد رسائل محادثة معينة كمقروءة
            messages = self.get_queryset().filter(chat_id=chat_id)
        else:
            # تحديد جميع الرسائل كمقروءة
            messages = self.get_queryset()

        updated_count = messages.update(is_read=True)
        
        return Response({
            'message': f'تم تحديد {updated_count} رسالة كمقروءة',
            'updated_count': updated_count
        })
