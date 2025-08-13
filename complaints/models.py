from django.db import models
from django.contrib.auth import get_user_model
from chats.models import Chat

User = get_user_model()


class Complaint(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
        ('rejected', 'Rejected'),
    )

    COMPLAINT_TYPES = (
        ('user_behavior', 'User Behavior'),
        ('service_quality', 'Service Quality'),
        ('payment_issue', 'Payment Issue'),
        ('spam', 'Spam'),
        ('other', 'Other'),
    )

    title = models.CharField(max_length=200)
    description = models.TextField()
    complaint_type = models.CharField(max_length=20, choices=COMPLAINT_TYPES, default='other')
    from_user = models.ForeignKey(User, related_name='complaints_sent', on_delete=models.CASCADE)
    to_user = models.ForeignKey(User, related_name='complaints_received', on_delete=models.CASCADE)
    chat = models.ForeignKey(Chat, related_name='complaints', on_delete=models.SET_NULL, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    resolved_by = models.ForeignKey(User, related_name='complaints_resolved', on_delete=models.SET_NULL, null=True,
                                    blank=True)
    admin_notes = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['from_user', 'to_user']),
            models.Index(fields=['status', 'complaint_type']),
            models.Index(fields=['created_at'])
        ]

    def __str__(self):
        return f"Complaint: {self.title} - {self.status} by {self.from_user.name} against {self.to_user.name}"

    def save(self, *args, **kwargs):
        if self.from_user == self.to_user:
            raise ValueError("Cannot file a complaint against yourself.")
        if self.from_user.role == self.to_user.role:
            raise ValueError("Complaint must be between a client and a plumber.")
        super().save(*args, **kwargs)


