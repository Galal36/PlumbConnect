from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter, SearchFilter
<<<<<<< HEAD
from django.db.models import Q, Count
from .models import Complaint
from .serializers import ComplaintSerializer, ComplaintCreateSerializer, ComplaintUpdateSerializer
from users.models import User
from users.permissions import IsAdmin
from django.utils.translation import gettext_lazy as _
from notifications.notification_helpers import notify_new_complaint, notify_complaint_status_change
from django.http import HttpResponse
import csv
=======
from django.db.models import Q
from .models import Complaint
from .serializers import ComplaintSerializer, ComplaintCreateSerializer, ComplaintUpdateSerializer
from users.permissions import IsAdmin
from django.utils.translation import gettext_lazy as _
from utils.notification_helpers import notify_new_complaint, notify_complaint_status_change
from rest_framework.exceptions import NotFound, PermissionDenied # تم إضافة PermissionDenied
>>>>>>> plumb_

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
<<<<<<< HEAD
    filterset_fields = ['status', 'complaint_type']
    ordering_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']
    search_fields = ['title', 'description']
=======
    filterset_fields = ['status', 'complaint_type', 'from_user', 'to_user']
    ordering_fields = ['created_at', 'updated_at', 'status']
    ordering = ['-created_at']
    search_fields = ['title', 'description', 'from_user__name', 'to_user__name']
>>>>>>> plumb_

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ComplaintCreateSerializer
        return ComplaintSerializer

    def perform_create(self, serializer):
<<<<<<< HEAD
        complaint = serializer.save(from_user=self.request.user)
=======
        # تم تعديل هذا السطر: إزالة from_user=self.request.user
        complaint = serializer.save()
>>>>>>> plumb_
        notify_new_complaint(complaint, request=self.request)

class ComplaintDetailView(BaseComplaintQuerysetMixin, generics.RetrieveAPIView):
    serializer_class = ComplaintSerializer
    permission_classes = [IsAdminOrComplaintParticipant]

class ComplaintUpdateView(BaseComplaintQuerysetMixin, generics.UpdateAPIView):
    serializer_class = ComplaintUpdateSerializer
    permission_classes = [IsAdminOrComplaintParticipant]

<<<<<<< HEAD
class ComplaintDeleteView(BaseComplaintQuerysetMixin, generics.DestroyAPIView):
    serializer_class = ComplaintSerializer
    permission_classes = [IsAdminOrComplaintParticipant]

class MyComplaintsView(BaseComplaintQuerysetMixin, generics.ListAPIView):
    serializer_class = ComplaintSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return super().get_queryset().filter(from_user=self.request.user)

class ComplaintsAgainstMeView(BaseComplaintQuerysetMixin, generics.ListAPIView):
    serializer_class = ComplaintSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return super().get_queryset().filter(to_user=self.request.user)

class UserComplaintsView(BaseComplaintQuerysetMixin, generics.ListAPIView):
    serializer_class = ComplaintSerializer
    permission_classes = [IsAdmin]

    def get_queryset(self):
        user_id = self.kwargs['user_id']
        return super().get_queryset().filter(Q(from_user__id=user_id) | Q(to_user__id=user_id))

class PendingComplaintsView(BaseComplaintQuerysetMixin, generics.ListAPIView):
=======
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
>>>>>>> plumb_
    serializer_class = ComplaintSerializer
    permission_classes = [IsAdmin]

    def get_queryset(self):
<<<<<<< HEAD
        return super().get_queryset().filter(status='pending')

class InProgressComplaintsView(BaseComplaintQuerysetMixin, generics.ListAPIView):
    serializer_class = ComplaintSerializer
    permission_classes = [IsAdmin]

    def get_queryset(self):
        return super().get_queryset().filter(status='in_progress')

class ResolvedComplaintsView(BaseComplaintQuerysetMixin, generics.ListAPIView):
    serializer_class = ComplaintSerializer
    permission_classes = [IsAdmin]

    def get_queryset(self):
        return super().get_queryset().filter(status='resolved')

class RejectedComplaintsView(BaseComplaintQuerysetMixin, generics.ListAPIView):
    serializer_class = ComplaintSerializer
    permission_classes = [IsAdmin]

    def get_queryset(self):
        return super().get_queryset().filter(status='rejected')

class ComplaintsByTypeView(BaseComplaintQuerysetMixin, generics.ListAPIView):
    serializer_class = ComplaintSerializer
    permission_classes = [IsAdmin]

    def get_queryset(self):
        complaint_type = self.kwargs['complaint_type']
        return super().get_queryset().filter(complaint_type=complaint_type)

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

        notify_complaint_status_change(complaint, user=complaint.from_user, request=request)
        notify_complaint_status_change(complaint, user=complaint.to_user, request=request)
        serializer = self.get_serializer(complaint)
        return Response(serializer.data, status=status.HTTP_200_OK)

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

        notify_complaint_status_change(complaint, user=complaint.from_user, request=request)
        notify_complaint_status_change(complaint, user=complaint.to_user, request=request)
        serializer = self.get_serializer(complaint)
        return Response(serializer.data, status=status.HTTP_200_OK)

class SearchComplaintsView(BaseComplaintQuerysetMixin, generics.ListAPIView):
    serializer_class = ComplaintSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = super().get_queryset()
        query = self.request.query_params.get('q', '')
        if query:
            queryset = queryset.filter(
                Q(title__icontains=query) | Q(description__icontains=query)
            )
        return queryset

class ComplaintStatisticsView(generics.RetrieveAPIView):
    permission_classes = [IsAdmin]

    def get(self, request, *args, **kwargs):
        stats = Complaint.objects.aggregate(
            total=Count('id'),
            pending=Count('id', filter=Q(status='pending')),
            in_progress=Count('id', filter=Q(status='in_progress')),
            resolved=Count('id', filter=Q(status='resolved')),
            rejected=Count('id', filter=Q(status='rejected'))
        )
        return Response(stats, status=status.HTTP_200_OK)

class ExportComplaintsView(BaseComplaintQuerysetMixin, generics.ListAPIView):
    permission_classes = [IsAdmin]

    def get(self, request, *args, **kwargs):
        complaints = super().get_queryset().order_by('created_at')

        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="complaints.csv"'

        writer = csv.writer(response)
        writer.writerow(['ID', 'From User', 'To User', 'Title', 'Description', 'Status', 'Complaint Type', 'Created At', 'Updated At', 'Admin Notes'])

        for complaint in complaints:
            writer.writerow([
                complaint.id,
                complaint.from_user.name,
                complaint.to_user.name,
                complaint.title,
                complaint.description,
                complaint.get_status_display(),
                complaint.get_complaint_type_display(),
                complaint.created_at.isoformat(),
                complaint.updated_at.isoformat(),
                complaint.admin_notes or ''
            ])
        return response
=======
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
>>>>>>> plumb_
