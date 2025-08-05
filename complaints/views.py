from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db.models import Q
from .models import Complaint
from .serializers import ComplaintSerializer, ComplaintCreateSerializer, ComplaintUpdateSerializer
from django.contrib.auth import get_user_model
from users.permissions import IsAdmin
from django.utils.translation import gettext_lazy as _
from django.http import HttpResponse
import csv

User = get_user_model()

# إذن مخصص للسماح للمدير أو أطراف الشكوى
class IsAdminOrComplaintParticipant(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user.role == 'admin' or request.user in [obj.from_user, obj.to_user]

# Base queryset for complaints accessible by the user
class BaseComplaintQuerysetMixin:
    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Complaint.objects.all().select_related(
                'from_user', 'to_user', 'resolved_by', 'chat'
            )
        return Complaint.objects.filter(
            Q(from_user=user) | Q(to_user=user)
        ).select_related('from_user', 'to_user', 'resolved_by', 'chat')

# 1. ComplaintListCreateView: لعرض وإنشاء الشكاوى
class ComplaintListCreateView(BaseComplaintQuerysetMixin, generics.ListCreateAPIView):
    serializer_class = ComplaintSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'complaint_type', 'from_user', 'to_user']
    search_fields = ['title', 'description', 'from_user__name', 'to_user__name']
    ordering_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ComplaintCreateSerializer
        return ComplaintSerializer

    def perform_create(self, serializer):
        serializer.save(from_user=self.request.user)

# 2. ComplaintDetailView: لعرض تفاصيل شكوى واحدة
class ComplaintDetailView(BaseComplaintQuerysetMixin, generics.RetrieveAPIView):
    serializer_class = ComplaintSerializer
    permission_classes = [IsAdminOrComplaintParticipant]

# 3. ComplaintUpdateView: لتحديث شكوى
class ComplaintUpdateView(BaseComplaintQuerysetMixin, generics.UpdateAPIView):
    serializer_class = ComplaintUpdateSerializer
    permission_classes = [IsAdmin]

# 4. ComplaintDeleteView: لحذف شكوى
class ComplaintDeleteView(BaseComplaintQuerysetMixin, generics.DestroyAPIView):
    serializer_class = ComplaintSerializer
    permission_classes = [IsAdmin]

# 5. MyComplaintsView: لعرض الشكاوى التي قدمها المستخدم الحالي
class MyComplaintsView(BaseComplaintQuerysetMixin, generics.ListAPIView):
    serializer_class = ComplaintSerializer
    permission_classes = [permissions.IsAuthenticated]
    ordering = ['-created_at']

    def get_queryset(self):
        return super().get_queryset().filter(from_user=self.request.user)

# 6. ComplaintsAgainstMeView: لعرض الشكاوى المقدمة ضد المستخدم الحالي
class ComplaintsAgainstMeView(BaseComplaintQuerysetMixin, generics.ListAPIView):
    serializer_class = ComplaintSerializer
    permission_classes = [permissions.IsAuthenticated]
    ordering = ['-created_at']

    def get_queryset(self):
        return super().get_queryset().filter(to_user=self.request.user)

# 7. UserComplaintsView: لعرض الشكاوى الخاصة بمستخدم معين
class UserComplaintsView(BaseComplaintQuerysetMixin, generics.ListAPIView):
    serializer_class = ComplaintSerializer
    permission_classes = [IsAdminOrComplaintParticipant]

    def get_queryset(self):
        user_id = self.kwargs['user_id']
        if self.request.user.role == 'admin':
            return super().get_queryset().filter(Q(from_user_id=user_id) | Q(to_user_id=user_id))
        elif self.request.user.id == user_id:
            return super().get_queryset().filter(Q(from_user=self.request.user) | Q(to_user=self.request.user))
        return Complaint.objects.none()

# 8. PendingComplaintsView: لعرض الشكاوى المعلقة
class PendingComplaintsView(BaseComplaintQuerysetMixin, generics.ListAPIView):
    serializer_class = ComplaintSerializer
    permission_classes = [IsAdminOrComplaintParticipant]
    ordering = ['-created_at']

    def get_queryset(self):
        return super().get_queryset().filter(status='pending')

# 9. InProgressComplaintsView: لعرض الشكاوى قيد المعالجة
class InProgressComplaintsView(BaseComplaintQuerysetMixin, generics.ListAPIView):
    serializer_class = ComplaintSerializer
    permission_classes = [IsAdminOrComplaintParticipant]
    ordering = ['-created_at']

    def get_queryset(self):
        return super().get_queryset().filter(status='in_progress')

# 10. ResolvedComplaintsView: لعرض الشكاوى المحلولة
class ResolvedComplaintsView(BaseComplaintQuerysetMixin, generics.ListAPIView):
    serializer_class = ComplaintSerializer
    permission_classes = [IsAdminOrComplaintParticipant]
    ordering = ['-created_at']

    def get_queryset(self):
        return super().get_queryset().filter(status='resolved')

# 11. RejectedComplaintsView: لعرض الشكاوى المرفوضة
class RejectedComplaintsView(BaseComplaintQuerysetMixin, generics.ListAPIView):
    serializer_class = ComplaintSerializer
    permission_classes = [IsAdminOrComplaintParticipant]
    ordering = ['-created_at']

    def get_queryset(self):
        return super().get_queryset().filter(status='rejected')

# 12. ComplaintsByTypeView: لعرض الشكاوى حسب النوع
class ComplaintsByTypeView(BaseComplaintQuerysetMixin, generics.ListAPIView):
    serializer_class = ComplaintSerializer
    permission_classes = [IsAdminOrComplaintParticipant]
    ordering = ['-created_at']

    def get_queryset(self):
        complaint_type = self.kwargs['complaint_type']
        return super().get_queryset().filter(complaint_type=complaint_type)

# 13. ResolveComplaintView: لحل شكوى
class ResolveComplaintView(BaseComplaintQuerysetMixin, generics.UpdateAPIView):
    serializer_class = ComplaintUpdateSerializer
    permission_classes = [IsAdmin]

    def update(self, request, *args, **kwargs):
        complaint = self.get_object()
        admin_notes = request.data.get('admin_notes', complaint.admin_notes)

        complaint.status = 'resolved'
        complaint.resolved_by = request.user
        complaint.admin_notes = admin_notes
        complaint.save()

        from notifications.models import Notification
        Notification.objects.create(
            user=complaint.from_user,
            message=_("تم حل شكواك: %(title)s") % {'title': complaint.title},
            type='complaint_status'
        )
        Notification.objects.create(
            user=complaint.to_user,
            message=_("تم حل الشكوى المقدمة ضدك: %(title)s") % {'title': complaint.title},
            type='complaint_status'
        )

        serializer = self.get_serializer(complaint)
        return Response(serializer.data, status=status.HTTP_200_OK)

# 14. RejectComplaintView: لرفض شكوى
class RejectComplaintView(BaseComplaintQuerysetMixin, generics.UpdateAPIView):
    serializer_class = ComplaintUpdateSerializer
    permission_classes = [IsAdmin]

    def update(self, request, *args, **kwargs):
        complaint = self.get_object()
        admin_notes = request.data.get('admin_notes', complaint.admin_notes)

        complaint.status = 'rejected'
        complaint.resolved_by = request.user
        complaint.admin_notes = admin_notes
        complaint.save()

        from notifications.models import Notification
        Notification.objects.create(
            user=complaint.from_user,
            message=_("تم رفض شكواك: %(title)s") % {'title': complaint.title},
            type='complaint_status'
        )
        Notification.objects.create(
            user=complaint.to_user,
            message=_("تم رفض الشكوى المقدمة ضدك: %(title)s") % {'title': complaint.title},
            type='complaint_status'
        )

        serializer = self.get_serializer(complaint)
        return Response(serializer.data, status=status.HTTP_200_OK)

# 15. SearchComplaintsView: للبحث في الشكاوى
class SearchComplaintsView(BaseComplaintQuerysetMixin, generics.ListAPIView):
    serializer_class = ComplaintSerializer
    permission_classes = [IsAdminOrComplaintParticipant]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['title', 'description', 'from_user__name', 'to_user__name']
    ordering_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = super().get_queryset()
        query = self.request.query_params.get('q', '')
        if query:
            queryset = queryset.filter(
                Q(title__icontains=query) |
                Q(description__icontains=query) |
                Q(from_user__name__icontains=query) |
                Q(to_user__name__icontains=query)
            )
        return queryset

# 16. ComplaintStatisticsView: للحصول على إحصائيات الشكاوى
class ComplaintStatisticsView(generics.RetrieveAPIView):
    permission_classes = [IsAdmin]

    def get(self, request, *args, **kwargs):
        total = Complaint.objects.count()
        pending = Complaint.objects.filter(status='pending').count()
        in_progress = Complaint.objects.filter(status='in_progress').count()
        resolved = Complaint.objects.filter(status='resolved').count()
        rejected = Complaint.objects.filter(status='rejected').count()

        return Response({
            'total': total,
            'pending': pending,
            'in_progress': in_progress,
            'resolved': resolved,
            'rejected': rejected
        }, status=status.HTTP_200_OK)

# 17. ExportComplaintsView: لتصدير الشكاوى إلى CSV
class ExportComplaintsView(BaseComplaintQuerysetMixin, generics.ListAPIView):
    permission_classes = [IsAdmin]

    def get(self, request, *args, **kwargs):
        queryset = self.get_queryset()

        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="complaints.csv"'

        writer = csv.writer(response)
        writer.writerow(['ID', 'Title', 'Description', 'Type', 'From User', 'To User', 'Chat ID', 'Status', 'Created At', 'Resolved By', 'Admin Notes'])

        for complaint in queryset:
            writer.writerow([
                complaint.id,
                complaint.title,
                complaint.description,
                complaint.get_complaint_type_display(),
                complaint.from_user.name,
                complaint.to_user.name,
                complaint.chat.id if complaint.chat else '',
                complaint.get_status_display(),
                complaint.created_at.isoformat(),
                complaint.resolved_by.name if complaint.resolved_by else '',
                complaint.admin_notes
            ])
        return response