from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter, SearchFilter
from django.db.models import Q, Count
from .models import Complaint
from .serializers import ComplaintSerializer, ComplaintCreateSerializer, ComplaintUpdateSerializer
from users.models import User
from users.permissions import IsAdmin
from django.utils.translation import gettext_lazy as _
from notifications.notification_helpers import notify_new_complaint, notify_complaint_status_change
from django.http import HttpResponse
import csv

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
    filterset_fields = ['status', 'complaint_type']
    ordering_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']
    search_fields = ['title', 'description']

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ComplaintCreateSerializer
        return ComplaintSerializer

    def perform_create(self, serializer):
        complaint = serializer.save(from_user=self.request.user)
        notify_new_complaint(complaint, request=self.request)

class ComplaintDetailView(BaseComplaintQuerysetMixin, generics.RetrieveAPIView):
    serializer_class = ComplaintSerializer
    permission_classes = [IsAdminOrComplaintParticipant]

class ComplaintUpdateView(BaseComplaintQuerysetMixin, generics.UpdateAPIView):
    serializer_class = ComplaintUpdateSerializer
    permission_classes = [IsAdminOrComplaintParticipant]

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
    serializer_class = ComplaintSerializer
    permission_classes = [IsAdmin]

    def get_queryset(self):
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