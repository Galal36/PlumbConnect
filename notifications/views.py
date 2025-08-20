from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter
from django.utils import timezone
from .models import Notification
from .serializers import NotificationSerializer, NotificationCreateSerializer
from .permissions import IsAdminOrNotificationRecipient


class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['is_read', 'notification_type', 'is_important']
    ordering = ['-created_at']

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)


class NotificationDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrNotificationRecipient]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # تحديد الإشعار كمقروء عند فتحه
        if not instance.is_read:
            instance.mark_as_read()
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class NotificationMarkAllReadView(generics.UpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def update(self, request, *args, **kwargs):
        updated_count = Notification.objects.filter(
            user=request.user,
            is_read=False
        ).update(is_read=True, read_at=timezone.now())

        return Response({
            'message': f'تم تحديد {updated_count} إشعار كمقروء',
            'updated_count': updated_count
        })


class NotificationStatsView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        notifications = Notification.objects.filter(user=user)

        stats = {
            'total_notifications': notifications.count(),
            'unread_notifications': notifications.filter(is_read=False).count(),
            'important_notifications': notifications.filter(is_important=True, is_read=False).count(),
            'notifications_by_type': {
                notification_type: notifications.filter(notification_type=notification_type).count()
                for notification_type, _ in Notification.NOTIFICATION_TYPES
            }
        }

        return Response(stats)
