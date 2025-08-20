from django.db import models
from django.contrib.auth import get_user_model
from chats.models import Chat

User = get_user_model()


class Message(models.Model):
    MESSAGE_TYPES = (
        ('text', 'نص'),
        ('image', 'صورة'),
        ('file', 'ملف'),
        ('link', 'رابط'),
        ('system', 'رسالة نظام'),
    )

    chat = models.ForeignKey(Chat, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    content = models.TextField(blank=True, default="")
    message_type = models.CharField(max_length=10, choices=MESSAGE_TYPES, default='text')
    image = models.ImageField(upload_to='chat_images/', blank=True, null=True)
    file = models.FileField(upload_to='chat_files/', blank=True, null=True)
    is_read = models.BooleanField(default=False)
    is_deleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['created_at']  # Changed to show oldest first (chronological order)
        indexes = [
            models.Index(fields=['chat', 'created_at']),
            models.Index(fields=['sender', 'created_at']),
            models.Index(fields=['is_read']),
        ]

    def __str__(self):
        return f"Message from {self.sender.name} in chat {self.chat.id}"

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)
        
        if is_new:
            # تحديث وقت المحادثة
            self.chat.save()
            
            # إرسال إشعار للمستقبل
            receiver = self.chat.get_other_participant(self.sender)
            from utils.notification_helpers import notify_new_message
            notify_new_message(receiver, self.sender, self)
