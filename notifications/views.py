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

User = get_user_model()

# إذن مخصص للسماح للمستخدم المستلم أو المدير
class IsAdminOrNotificationRecipient(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user.role == 'admin' or request.user == obj.user

# Base queryset for notifications accessible by the user
class BaseNotificationQuerysetMixin:
    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Notification.objects.all().select_related('user')
        return Notification.objects.filter(user=user).select_related('user')

# 1. NotificationListView: لعرض قائمة الإشعارات
class NotificationListView(BaseNotificationQuerysetMixin, generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['notification_type', 'is_read']
    search_fields = ['title', 'content']
    ordering_fields = ['created_at']
    ordering = ['-created_at']

# 2. NotificationCreateView: لإنشاء إشعار
class NotificationCreateView(generics.CreateAPIView):
    serializer_class = NotificationCreateSerializer
    permission_classes = [IsAdmin]

# 3. NotificationDetailView: لعرض تفاصيل إشعار
class NotificationDetailView(BaseNotificationQuerysetMixin, generics.RetrieveAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsAdminOrNotificationRecipient]

# 4. NotificationUpdateView: لتحديث إشعار
class NotificationUpdateView(BaseNotificationQuerysetMixin, generics.UpdateAPIView):
    serializer_class = NotificationUpdateSerializer
    permission_classes = [IsAdminOrNotificationRecipient]

# 5. NotificationDeleteView: لحذف إشعار
class NotificationDeleteView(BaseNotificationQuerysetMixin, generics.DestroyAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsAdminOrNotificationRecipient]

# 6. UnreadNotificationsView: لعرض الإشعارات غير المقروءة
class UnreadNotificationsView(BaseNotificationQuerysetMixin, generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    ordering = ['-created_at']

    def get_queryset(self):
        return super().get_queryset().filter(is_read=False)

# 7. ReadNotificationsView: لعرض الإشعارات المقروءة
class ReadNotificationsView(BaseNotificationQuerysetMixin, generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    ordering = ['-created_at']

    def get_queryset(self):
        return super().get_queryset().filter(is_read=True)

# 8. MarkNotificationAsReadView: لتحديد إشعار كمقروء
class MarkNotificationAsReadView(BaseNotificationQuerysetMixin, generics.UpdateAPIView):
    serializer_class = NotificationUpdateSerializer
    permission_classes = [IsAdminOrNotificationRecipient]

    def update(self, request, *args, **kwargs):
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({'status': 'notification marked as read'}, status=status.HTTP_200_OK)

# 9. MarkAllNotificationsAsReadView: لتحديد جميع الإشعارات كمقروءة
class MarkAllNotificationsAsReadView(generics.UpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def update(self, request, *args, **kwargs):
        updated_count = Notification.objects.filter(
            user=request.user, is_read=False
        ).update(is_read=True)
        return Response({
            'status': 'all notifications marked as read',
            'updated_count': updated_count
        }, status=status.HTTP_200_OK)

# 10. NotificationsByTypeView: لعرض الإشعارات حسب النوع
class NotificationsByTypeView(BaseNotificationQuerysetMixin, generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    ordering = ['-created_at']

    def get_queryset(self):
        notification_type = self.kwargs['notification_type']
        return super().get_queryset().filter(notification_type=notification_type)

# 11. MessageNotificationsView: لعرض إشعارات الرسائل
class MessageNotificationsView(BaseNotificationQuerysetMixin, generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    ordering = ['-created_at']

    def get_queryset(self):
        return super().get_queryset().filter(notification_type='new_message')

# 12. ChatNotificationsView: لعرض إشعارات المحادثات
class ChatNotificationsView(BaseNotificationQuerysetMixin, generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    ordering = ['-created_at']

    def get_queryset(self):
        return super().get_queryset().filter(notification_type='new_chat')

# 13. ComplaintNotificationsView: لعرض إشعارات الشكاوى
class ComplaintNotificationsView(BaseNotificationQuerysetMixin, generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    ordering = ['-created_at']

    def get_queryset(self):
        return super().get_queryset().filter(notification_type='complaint_status')

# 14. SystemNotificationsView: لعرض الإشعارات النظامية
class SystemNotificationsView(BaseNotificationQuerysetMixin, generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    ordering = ['-created_at']

    def get_queryset(self):
        return super().get_queryset().filter(notification_type='system')

# 15. UnreadNotificationCountView: لعد الإشعارات غير المقروءة
class UnreadNotificationCountView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        count = Notification.objects.filter(user=request.user, is_read=False).count()
        return Response({'unread_count': count}, status=status.HTTP_200_OK)

# 16. NotificationCountView: لعد إجمالي الإشعارات
class NotificationCountView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        count = Notification.objects.filter(user=request.user).count()
        return Response({'total_count': count}, status=status.HTTP_200_OK)

# 17. RecentNotificationsView: لعرض الإشعارات الحديثة
class RecentNotificationsView(BaseNotificationQuerysetMixin, generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    ordering = ['-created_at']

    def get_queryset(self):
        return super().get_queryset()[:10]  # آخر 10 إشعارات

# 18. ImportantNotificationsView: لعرض الإشعارات المهمة
class ImportantNotificationsView(BaseNotificationQuerysetMixin, generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    ordering = ['-created_at']

    def get_queryset(self):
        return super().get_queryset().filter(is_important=True)

# 19. ClearAllNotificationsView: لحذف جميع الإشعارات
class ClearAllNotificationsView(generics.DestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, *args, **kwargs):
        deleted_count = Notification.objects.filter(user=request.user).delete()[0]
        return Response({
            'status': 'all notifications cleared',
            'deleted_count': deleted_count
        }, status=status.HTTP_200_OK)

# 20. ClearReadNotificationsView: لحذف الإشعارات المقروءة
class ClearReadNotificationsView(generics.DestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, *args, **kwargs):
        deleted_count = Notification.objects.filter(
            user=request.user, is_read=True
        ).delete()[0]
        return Response({
            'status': 'read notifications cleared',
            'deleted_count': deleted_count
        }, status=status.HTTP_200_OK)

# 21. ClearOldNotificationsView: لحذف الإشعارات القديمة
class ClearOldNotificationsView(generics.DestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, *args, **kwargs):
        threshold = datetime.now().astimezone() - timedelta(days=30)
        deleted_count = Notification.objects.filter(
            user=request.user, created_at__lt=threshold
        ).delete()[0]
        return Response({
            'status': 'old notifications cleared',
            'deleted_count': deleted_count
        }, status=status.HTTP_200_OK)