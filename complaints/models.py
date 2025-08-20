from django.db import models
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.utils import timezone
from chats.models import Chat

User = get_user_model()


class Complaint(models.Model):
    COMPLAINT_TYPES = (
        ('inappropriate_behavior', 'سلوك غير لائق'),
        ('poor_service_quality', 'جودة خدمة سيئة'),
        ('payment_issues', 'مشاكل في الدفع'),
        ('spam_harassment', 'إزعاج أو سبام'),
        ('fraud_scam', 'احتيال أو نصب'),
        ('other', 'أخرى'),
    )

    STATUS_CHOICES = (
        ('pending', 'قيد المراجعة'),
        ('in_progress', 'تحت التحقيق'),
        ('resolved', 'تم الحل'),
        ('rejected', 'مرفوضة'),
    )

    from_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='filed_complaints')
    to_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_complaints')
    complaint_type = models.CharField(max_length=30, choices=COMPLAINT_TYPES)
    description = models.TextField()
    related_chat = models.ForeignKey(Chat, on_delete=models.SET_NULL, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    admin_notes = models.TextField(blank=True)
    resolved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='resolved_complaints')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['from_user', 'status']),
            models.Index(fields=['to_user', 'status']),
            models.Index(fields=['status', 'created_at']),
        ]

    def clean(self):
        # منع الشكوى ضد النفس
        if self.from_user == self.to_user:
            raise ValidationError("لا يمكن تقديم شكوى ضد نفسك")
        
        # التحقق من أن الشكوى بين عميل وسباك
        if self.from_user.role == self.to_user.role:
            raise ValidationError("يجب أن تكون الشكوى بين عميل وسباك")

    def save(self, *args, **kwargs):
        self.clean()
        
        # تحديث وقت الحل عند تغيير الحالة إلى resolved
        if self.status == 'resolved' and not self.resolved_at:
            self.resolved_at = timezone.now()
        
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Complaint from {self.from_user.name} against {self.to_user.name}"
