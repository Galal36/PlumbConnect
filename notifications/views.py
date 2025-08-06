from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db.models import Q
from .models import Notification
from .serializers import NotificationSerializer, NotificationCreateSerializer, NotificationUpdateSerializer
from django.contrib.auth import get_user_model
from users.permissions import IsAdmin
from django.utils.translation import gettext_lazy as _
from datetime import datetime, timedelta
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

User = get_user_model()

class IsAdminOrNotificationRecipient(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user.role == 'admin' or request.user == obj.user

class BaseNotificationQuerysetMixin:
    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Notification.objects.all().select_related('user')
        return Notification.objects.filter(user=user).select_related('user')

class NotificationListView(BaseNotificationQuerysetMixin, generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['notification_type', 'is_read']
    search_fields = ['title', 'content']
    ordering_fields = ['created_at']
    ordering = ['-created_at']

class NotificationCreateView(generics.CreateAPIView):
    serializer_class = NotificationCreateSerializer
    permission_classes = [IsAdmin]

    def perform_create(self, serializer):
        notification = serializer.save()
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f'user_{notification.user.id}',
            {
                'type': 'notification_message',
                'message': {
                    'id': notification.id,
                    'title': notification.title,
                    'content': notification.content,
                    'notification_type': notification.notification_type,
                    'is_read': notification.is_read,
                    'is_important': notification.is_important,
                    'created_at': notification.created_at.isoformat(),
                    'action_url': notification.action_url,
                }
            }
        )

class NotificationDetailView(BaseNotificationQuerysetMixin, generics.RetrieveAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsAdminOrNotificationRecipient]

class NotificationUpdateView(BaseNotificationQuerysetMixin, generics.UpdateAPIView):
    serializer_class = NotificationUpdateSerializer
    permission_classes = [IsAdminOrNotificationRecipient]

class NotificationDeleteView(BaseNotificationQuerysetMixin, generics.DestroyAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsAdminOrNotificationRecipient]

class UnreadNotificationsView(BaseNotificationQuerysetMixin, generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    ordering = ['-created_at']

    def get_queryset(self):
        return super().get_queryset().filter(is_read=False)

class ReadNotificationsView(BaseNotificationQuerysetMixin, generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    ordering = ['-created_at']

    def get_queryset(self):
        return super().get_queryset().filter(is_read=True)

class MarkNotificationAsReadView(BaseNotificationQuerysetMixin, generics.UpdateAPIView):
    serializer_class = NotificationUpdateSerializer
    permission_classes = [IsAdminOrNotificationRecipient]

    def update(self, request, *args, **kwargs):
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({'status': _('notification marked as read')}, status=status.HTTP_200_OK)

class MarkAllNotificationsAsReadView(generics.UpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def update(self, request, *args, **kwargs):
        updated_count = Notification.objects.filter(
            user=request.user, is_read=False
        ).update(is_read=True)
        return Response({
            'status': _('all notifications marked as read'),
            'updated_count': updated_count
        }, status=status.HTTP_200_OK)

class NotificationsByTypeView(BaseNotificationQuerysetMixin, generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    ordering = ['-created_at']

    def get_queryset(self):
        notification_type = self.kwargs['notification_type']
        return super().get_queryset().filter(notification_type=notification_type)

class MessageNotificationsView(BaseNotificationQuerysetMixin, generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    ordering = ['-created_at']

    def get_queryset(self):
        return super().get_queryset().filter(notification_type='new_message')

class ChatNotificationsView(BaseNotificationQuerysetMixin, generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    ordering = ['-created_at']

    def get_queryset(self):
        return super().get_queryset().filter(notification_type='new_chat')

class ComplaintNotificationsView(BaseNotificationQuerysetMixin, generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    ordering = ['-created_at']

    def get_queryset(self):
        return super().get_queryset().filter(notification_type='complaint_status')

class SystemNotificationsView(BaseNotificationQuerysetMixin, generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    ordering = ['-created_at']

    def get_queryset(self):
        return super().get_queryset().filter(notification_type='system')

class UnreadNotificationCountView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        count = Notification.objects.filter(user=request.user, is_read=False).count()
        return Response({'unread_count': count}, status=status.HTTP_200_OK)

class NotificationCountView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        count = Notification.objects.filter(user=request.user).count()
        return Response({'total_count': count}, status=status.HTTP_200_OK)

class RecentNotificationsView(BaseNotificationQuerysetMixin, generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    ordering = ['-created_at']

    def get_queryset(self):
        return super().get_queryset()[:10]

class ImportantNotificationsView(BaseNotificationQuerysetMixin, generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    ordering = ['-created_at']

    def get_queryset(self):
        return super().get_queryset().filter(is_important=True)

class ClearAllNotificationsView(generics.DestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, *args, **kwargs):
        deleted_count = Notification.objects.filter(user=request.user).delete()[0]
        return Response({
            'status': _('all notifications cleared'),
            'deleted_count': deleted_count
        }, status=status.HTTP_200_OK)

class ClearReadNotificationsView(generics.DestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, *args, **kwargs):
        deleted_count = Notification.objects.filter(
            user=request.user, is_read=True
        ).delete()[0]
        return Response({
            'status': _('read notifications cleared'),
            'deleted_count': deleted_count
        }, status=status.HTTP_200_OK)

class ClearOldNotificationsView(generics.DestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, *args, **kwargs):
        threshold = datetime.now().astimezone() - timedelta(days=30)
        deleted_count = Notification.objects.filter(
            user=request.user, created_at__lt=threshold
        ).delete()[0]
        return Response({
            'status': _('old notifications cleared'),
            'deleted_count': deleted_count
        }, status=status.HTTP_200_OK)