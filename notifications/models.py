from django.db import models
from django.contrib.auth import get_user_model
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey

User = get_user_model()


class Notification(models.Model):
    NOTIFICATION_TYPES = (
        ('new_message', 'رسالة جديدة'),
        ('new_chat', 'محادثة جديدة'),
        ('complaint_status', 'تحديث الشكوى'),
        ('system', 'إشعار النظام'),
        ('reminder', 'تذكير'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=200)
    content = models.TextField()
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES, default='system')
    is_read = models.BooleanField(default=False)
    is_important = models.BooleanField(default=False)
    action_url = models.URLField(blank=True, null=True)
    
    # Generic Foreign Key للربط بأي كائن
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, null=True, blank=True)
    object_id = models.PositiveIntegerField(null=True, blank=True)
    content_object = GenericForeignKey('content_type', 'object_id')
    
    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'is_read']),
            models.Index(fields=['user', 'notification_type']),
            models.Index(fields=['created_at']),
            models.Index(fields=['is_important']),
        ]

    def __str__(self):
        return f"Notification for {self.user.name}: {self.title}"

    def mark_as_read(self):
        if not self.is_read:
            self.is_read = True
            self.read_at = timezone.now()
            self.save()
