from rest_framework import viewsets, permissions
from reports.models import Report
from .serializers import ReportSerializer
from django.contrib.contenttypes.models import ContentType
from rest_framework.decorators import action
from rest_framework.response import Response
from posts.models import Post, Comment, Comment_Reply
from .permissions import IsOwnerOrAdmin

class ReportViewSet(viewsets.ModelViewSet):
    queryset = Report.objects.all()
    serializer_class = ReportSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsOwnerOrAdmin()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        if self.action == 'my_reports':
            return Report.objects.filter(user=self.request.user)
        return super().get_queryset()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'], url_path='my-reports')
    def my_reports(self, request):
        reports = Report.objects.filter(user=request.user)
        serializer = self.get_serializer(reports, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='post/(?P<post_id>[^/.]+)')
    def reports_for_post(self, request, post_id=None):
        ct = ContentType.objects.get_for_model(Post)
        reports = Report.objects.filter(content_type=ct, object_id=post_id)
        serializer = self.get_serializer(reports, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='comment/(?P<comment_id>[^/.]+)')
    def reports_for_comment(self, request, comment_id=None):
        ct = ContentType.objects.get_for_model(Comment)
        reports = Report.objects.filter(content_type=ct, object_id=comment_id)
        serializer = self.get_serializer(reports, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='reply-comment/(?P<reply_id>[^/.]+)')
    def reports_for_reply(self, request, reply_id=None):
        ct = ContentType.objects.get_for_model(Comment_Reply)
        reports = Report.objects.filter(content_type=ct, object_id=reply_id)
        serializer = self.get_serializer(reports, many=True)
        return Response(serializer.data)
