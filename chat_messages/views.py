from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter, SearchFilter
from django.db.models import Q
from .models import Message
from .serializers import MessageSerializer, MessageCreateSerializer, MessageUpdateSerializer
from chats.models import Chat
from django.http import HttpResponse
import csv
from users.permissions import IsAdmin
from django.utils.translation import gettext_lazy as _
<<<<<<< HEAD
from notifications.notification_helpers import notify_new_message
=======
from utils.notification_helpers import notify_new_message
from rest_framework.exceptions import NotFound # تم إضافة هذا الاستيراد
>>>>>>> plumb_

class IsAdminOrChatParticipant(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user.role == 'admin' or request.user in [obj.sender, obj.receiver]

class BaseMessageQuerysetMixin:
    def get_queryset(self):
        user = self.request.user
        return Message.objects.filter(
            Q(sender=user) | Q(receiver=user),
            is_deleted=False
        ).select_related('sender', 'receiver', 'chat')

class MessageListCreateView(BaseMessageQuerysetMixin, generics.ListCreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter, SearchFilter]
    filterset_fields = ['message_type', 'is_read', 'chat']
    ordering_fields = ['sent_at']
    ordering = ['sent_at']
    search_fields = ['message']

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return MessageCreateSerializer
        return MessageSerializer

    def perform_create(self, serializer):
<<<<<<< HEAD
        message = serializer.save(sender=self.request.user)
=======
        # تم تعديل هذا السطر: إزالة sender=self.request.user
        message = serializer.save()
>>>>>>> plumb_
        notify_new_message(message.receiver, message.sender, message, request=self.request)

class MessageDetailView(BaseMessageQuerysetMixin, generics.RetrieveAPIView):
    serializer_class = MessageSerializer
    permission_classes = [IsAdminOrChatParticipant]

class MessageUpdateView(BaseMessageQuerysetMixin, generics.UpdateAPIView):
    serializer_class = MessageUpdateSerializer
    permission_classes = [IsAdminOrChatParticipant]

class MessageDeleteView(BaseMessageQuerysetMixin, generics.DestroyAPIView):
    serializer_class = MessageSerializer
    permission_classes = [IsAdminOrChatParticipant]

class MessagesByChatView(BaseMessageQuerysetMixin, generics.ListAPIView):
    serializer_class = MessageSerializer
    permission_classes = [IsAdminOrChatParticipant]
    filter_backends = [OrderingFilter]
    ordering = ['sent_at']

    def get_queryset(self):
        chat_id = self.kwargs['chat_id']
        user = self.request.user
        try:
            chat = Chat.objects.get(id=chat_id)
            if user not in [chat.sender, chat.receiver]:
                return Message.objects.none()
            return super().get_queryset().filter(chat=chat)
        except Chat.DoesNotExist:
            return Message.objects.none()

class LatestMessagesByChatView(MessagesByChatView):
    def get_queryset(self):
        queryset = super().get_queryset()
        return queryset.order_by('-sent_at')[:10]

class MarkMessageAsReadView(BaseMessageQuerysetMixin, generics.UpdateAPIView):
    serializer_class = MessageUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def update(self, request, *args, **kwargs):
        message = self.get_object()
        if message.receiver == request.user:
            message.is_read = True
            message.save()
            serializer = self.get_serializer(message)
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response({'error': _('You can only mark messages sent to you as read')},
                       status=status.HTTP_403_FORBIDDEN)

class SoftDeleteMessageView(BaseMessageQuerysetMixin, generics.UpdateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def update(self, request, *args, **kwargs):
        message = self.get_object()
        if message.sender == request.user:
            message.is_deleted = True
            message.save()
            return Response({'status': _('message deleted')}, status=status.HTTP_200_OK)
        return Response({'error': _('You can only delete your own messages')},
                       status=status.HTTP_403_FORBIDDEN)

class MarkAllMessagesAsReadView(generics.UpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def update(self, request, *args, **kwargs):
        user = request.user
        updated_count = Message.objects.filter(
            receiver=user,
            is_read=False,
            is_deleted=False
        ).update(is_read=True)
        return Response({'status': _('all messages marked as read'), 'updated_count': updated_count},
                       status=status.HTTP_200_OK)

class SearchMessagesView(BaseMessageQuerysetMixin, generics.ListAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['message']
    ordering_fields = ['sent_at']
    ordering = ['sent_at']

    def get_queryset(self):
        queryset = super().get_queryset()
        query = self.request.query_params.get('q', '')
        if query:
            queryset = queryset.filter(message__icontains=query)
        return queryset

class MediaMessagesView(BaseMessageQuerysetMixin, generics.ListAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    ordering = ['-sent_at']

    def get_queryset(self):
        return super().get_queryset().filter(message_type='image', image__isnull=False)

class UnreadMessagesView(BaseMessageQuerysetMixin, generics.ListAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    ordering = ['sent_at']

    def get_queryset(self):
        return super().get_queryset().filter(receiver=self.request.user, is_read=False)

class UnreadCountView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        count = Message.objects.filter(
            receiver=request.user,
            is_read=False,
            is_deleted=False
        ).count()
        return Response({'unread_count': count}, status=status.HTTP_200_OK)

class MessageCountView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        count = Message.objects.filter(
            Q(sender=user) | Q(receiver=user),
            is_deleted=False
        ).count()
        return Response({'total_messages_count': count}, status=status.HTTP_200_OK)

class ExportChatMessagesView(BaseMessageQuerysetMixin, generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        chat_id = self.kwargs['chat_id']
        try:
            chat = Chat.objects.get(id=chat_id)
            if request.user not in [chat.sender, chat.receiver]:
                return Response({'error': _('Access denied')}, status=status.HTTP_403_FORBIDDEN)

            messages = super().get_queryset().filter(chat=chat).order_by('sent_at')

            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = f'attachment; filename="chat_{chat_id}_messages.csv"'

            writer = csv.writer(response)
            writer.writerow(['ID', 'Sender', 'Receiver', 'Message', 'Message Type', 'Sent At', 'Is Read', 'Link'])

            for msg in messages:
                writer.writerow([
                    msg.id,
                    msg.sender.name,
                    msg.receiver.name,
                    msg.message,
                    msg.message_type,
                    msg.sent_at.isoformat(),
                    msg.is_read,
                    msg.link or ''
                ])
            return response
        except Chat.DoesNotExist:
            return Response({'error': _('Chat not found')}, status=status.HTTP_404_NOT_FOUND)

class SendSystemMessageView(generics.CreateAPIView):
    serializer_class = MessageCreateSerializer
    permission_classes = [IsAdmin]

    def perform_create(self, serializer):
        message = serializer.save(sender=self.request.user, message_type='system')
        notify_new_message(message.receiver, message.sender, message, request=self.request)

class SendSystemMessageToChatView(generics.CreateAPIView):
    serializer_class = MessageCreateSerializer
    permission_classes = [IsAdmin]

    def perform_create(self, serializer):
        chat_id = self.kwargs['chat_id']
        try:
            chat = Chat.objects.get(id=chat_id)
            message = serializer.save(
                sender=self.request.user,
                message_type='system',
                chat=chat
            )
            notify_new_message(message.receiver, message.sender, message, request=self.request)
        except Chat.DoesNotExist:
<<<<<<< HEAD
            return Response({'error': _('Chat not found')}, status=status.HTTP_404_NOT_FOUND)
=======
            # تم تعديل هذا الجزء: رفع NotFound بدلاً من Response
            raise NotFound(_('Chat not found'))
>>>>>>> plumb_
