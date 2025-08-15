from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter, SearchFilter
from django.db.models import Q
from .models import Complaint
from .serializers import ComplaintSerializer, ComplaintCreateSerializer, ComplaintUpdateSerializer
from users.permissions import IsAdmin
from django.utils.translation import gettext_lazy as _
from utils.notification_helpers import notify_new_complaint, notify_complaint_status_change
from rest_framework.exceptions import NotFound, PermissionDenied # تم إضافة PermissionDenied

class IsAdminOrComplaintParticipant(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user.role == 'admin' or request.user in [obj.from_user, obj.to_user]

class BaseComplaintQuerysetMixin:
    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Complaint.objects.all().select_related('from_user', 'to_user', 'chat', 'resolved_by')
        return Complaint.objects.filter(
            Q(from_user=user) | Q(to_user=user)
        ).select_related('from_user', 'to_user', 'chat', 'resolved_by')

class ComplaintListCreateView(BaseComplaintQuerysetMixin, generics.ListCreateAPIView):
    serializer_class = ComplaintSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter, SearchFilter]
    filterset_fields = ['status', 'complaint_type', 'from_user', 'to_user']
    ordering_fields = ['created_at', 'updated_at', 'status']
    ordering = ['-created_at']
    search_fields = ['title', 'description', 'from_user__name', 'to_user__name']

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ComplaintCreateSerializer
        return ComplaintSerializer

    def perform_create(self, serializer):
        # تم تعديل هذا السطر: إزالة from_user=self.request.user
        complaint = serializer.save()
        notify_new_complaint(complaint, request=self.request)

class ComplaintDetailView(BaseComplaintQuerysetMixin, generics.RetrieveAPIView):
    serializer_class = ComplaintSerializer
    permission_classes = [IsAdminOrComplaintParticipant]

class ComplaintUpdateView(BaseComplaintQuerysetMixin, generics.UpdateAPIView):
    serializer_class = ComplaintUpdateSerializer
    permission_classes = [IsAdminOrComplaintParticipant]

    def perform_update(self, serializer):
        complaint = self.get_object()
        user = self.request.user

        # فقط المسؤول يمكنه تغيير الحالة أو إضافة ملاحظات المسؤول
        if 'status' in serializer.validated_data and user.role != 'admin':
            raise PermissionDenied(_("Only administrators can change complaint status."))
        if 'admin_notes' in serializer.validated_data and user.role != 'admin':
            raise PermissionDenied(_("Only administrators can add admin notes."))

        # إذا كان المسؤول يغير الحالة إلى 'resolved'، قم بتعيين resolved_by
        if user.role == 'admin' and serializer.validated_data.get('status') == 'resolved':
            serializer.validated_data['resolved_by'] = user
        elif user.role == 'admin' and complaint.status == 'resolved' and serializer.validated_data.get('status') != 'resolved':
            # إذا كان المسؤول يغير الحالة من 'resolved' إلى شيء آخر، قم بإزالة resolved_by
            serializer.validated_data['resolved_by'] = None

        updated_complaint = serializer.save()

        # إرسال إشعار عند تغيير الحالة
        if 'status' in serializer.validated_data:
            # إشعار للمستخدم الذي قدم الشكوى
            notify_complaint_status_change(updated_complaint, user=updated_complaint.from_user, request=self.request)
            # إشعار للمستخدم الذي قُدمت الشكوى ضده (إذا كان مختلفًا عن مقدم الشكوى)
            if updated_complaint.from_user != updated_complaint.to_user:
                notify_complaint_status_change(updated_complaint, user=updated_complaint.to_user, request=self.request)

class ComplaintDeleteView(BaseComplaintQuerysetMixin, generics.DestroyAPIView):
    serializer_class = ComplaintSerializer
    permission_classes = [IsAdmin] # فقط المسؤول يمكنه حذف الشكاوى

class UserComplaintsView(BaseComplaintQuerysetMixin, generics.ListAPIView):
    serializer_class = ComplaintSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return super().get_queryset().filter(Q(from_user=user) | Q(to_user=user))

class AdminComplaintListView(BaseComplaintQuerysetMixin, generics.ListAPIView):
    serializer_class = ComplaintSerializer
    permission_classes = [IsAdmin]

    def get_queryset(self):
        return Complaint.objects.all().select_related('from_user', 'to_user', 'chat', 'resolved_by')

class ComplaintStatusView(BaseComplaintQuerysetMixin, generics.ListAPIView):
    serializer_class = ComplaintSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        status_param = self.kwargs['status']
        return super().get_queryset().filter(status=status_param)

class ComplaintCountView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        if user.role == 'admin':
            count = Complaint.objects.count()
        else:
            count = Complaint.objects.filter(Q(from_user=user) | Q(to_user=user)).count()
        return Response({'total_complaints_count': count}, status=status.HTTP_200_OK)

class AdminComplaintUpdateView(generics.UpdateAPIView):
    serializer_class = ComplaintUpdateSerializer
    permission_classes = [IsAdmin]
    queryset = Complaint.objects.all() # يجب أن يكون المسؤول قادرًا على تحديث أي شكوى

    def perform_update(self, serializer):
        complaint = self.get_object()
        user = self.request.user

        # تعيين resolved_by إذا تم حل الشكوى بواسطة المسؤول
        if serializer.validated_data.get('status') == 'resolved':
            serializer.validated_data['resolved_by'] = user
        elif complaint.status == 'resolved' and serializer.validated_data.get('status') != 'resolved':
            # إذا كان المسؤول يغير الحالة من 'resolved' إلى شيء آخر، قم بإزالة resolved_by
            serializer.validated_data['resolved_by'] = None

        updated_complaint = serializer.save()

        # إرسال إشعار عند تغيير الحالة
        if 'status' in serializer.validated_data:
            # إشعار للمستخدم الذي قدم الشكوى
            notify_complaint_status_change(updated_complaint, user=updated_complaint.from_user, request=self.request)
            # إشعار للمستخدم الذي قُدمت الشكوى ضده (إذا كان مختلفًا عن مقدم الشكوى)
            if updated_complaint.from_user != updated_complaint.to_user:
                notify_complaint_status_change(updated_complaint, user=updated_complaint.to_user, request=self.request)
