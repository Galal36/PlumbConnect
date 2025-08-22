from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db import models
from .models import Complaint
from .serializers import ComplaintSerializer, ComplaintCreateSerializer, ComplaintUpdateSerializer
from .permissions import IsAdminOrComplaintParticipant
from notifications.utils import NotificationService


class ComplaintListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['complaint_type', 'status']
    search_fields = ['description']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ComplaintCreateSerializer
        return ComplaintSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role in ['admin', 'moderator']:
            return Complaint.objects.all().select_related('from_user', 'to_user', 'resolved_by')
        else:
            return Complaint.objects.filter(
                models.Q(from_user=user) | models.Q(to_user=user)
            ).select_related('from_user', 'to_user', 'resolved_by')

    def perform_create(self, serializer):
        complaint = serializer.save()

        # Send notifications for new complaint
        try:
            # Create notifications for admins
            NotificationService.notify_new_complaint(complaint)
        except Exception as e:
            # Log error but don't fail the complaint creation
            print(f"Failed to send complaint notification: {e}")


class ComplaintDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminOrComplaintParticipant]

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return ComplaintUpdateSerializer
        return ComplaintSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role in ['admin', 'moderator']:
            return Complaint.objects.all().select_related('from_user', 'to_user', 'resolved_by')
        else:
            return Complaint.objects.filter(
                models.Q(from_user=user) | models.Q(to_user=user)
            ).select_related('from_user', 'to_user', 'resolved_by')

    def perform_update(self, serializer):
        # Get the old status before updating
        complaint = self.get_object()
        old_status = complaint.status

        # تسجيل من قام بحل الشكوى
        if 'status' in serializer.validated_data and serializer.validated_data['status'] == 'resolved':
            updated_complaint = serializer.save(resolved_by=self.request.user)
        else:
            updated_complaint = serializer.save()

        # Send notifications for status change
        try:
            new_status = updated_complaint.status
            if old_status != new_status:
                # Create notifications for status change
                NotificationService.notify_complaint_status_change(updated_complaint, old_status, new_status)
        except Exception as e:
            # Log error but don't fail the update
            print(f"Failed to send complaint status change notification: {e}")


class ComplaintStatsView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        
        if user.role in ['admin', 'moderator']:
            # إحصائيات للأدمن
            complaints = Complaint.objects.all()
            stats = {
                'total_complaints': complaints.count(),
                'pending_complaints': complaints.filter(status='pending').count(),
                'in_progress_complaints': complaints.filter(status='in_progress').count(),
                'resolved_complaints': complaints.filter(status='resolved').count(),
                'rejected_complaints': complaints.filter(status='rejected').count(),
                'complaints_by_type': {
                    complaint_type: complaints.filter(complaint_type=complaint_type).count()
                    for complaint_type, _ in Complaint.COMPLAINT_TYPES
                }
            }
        else:
            # إحصائيات للمستخدم العادي
            filed_complaints = Complaint.objects.filter(from_user=user)
            received_complaints = Complaint.objects.filter(to_user=user)
            
            stats = {
                'filed_complaints': filed_complaints.count(),
                'received_complaints': received_complaints.count(),
                'pending_filed': filed_complaints.filter(status='pending').count(),
                'resolved_filed': filed_complaints.filter(status='resolved').count(),
                'pending_received': received_complaints.filter(status='pending').count(),
                'resolved_received': received_complaints.filter(status='resolved').count(),
            }

        return Response(stats)
