from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Chat(models.Model):
    sender = models.ForeignKey(User, related_name='chats_sent', on_delete=models.CASCADE)
    receiver = models.ForeignKey(User, related_name='chats_received', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    is_archived = models.BooleanField(default=False) # تم إضافة هذا الحقل

    class Meta:
        unique_together = ('sender', 'receiver')
        ordering = ['-updated_at']
        indexes = [
            models.Index(fields=['sender', 'receiver']),
            models.Index(fields=['updated_at'])
        ]

    def __str__(self):
        return f"Chat between {self.sender.name} and {self.receiver.name}"

    def save(self, *args, **kwargs):
        # تم إزالة التحقق من دور المستخدمين هنا، حيث يتم التعامل معه في Serializer
        super().save(*args, **kwargs)

    @property
    def last_message(self):
        # تأكد من أن لديك related_name 'messages' في نموذج الرسائل الخاص بك
        # (مثال: chat_messages.models.Message.chat = models.ForeignKey(Chat, related_name='messages', ...))
        return self.messages.last()

    @property
    def unread_count(self):
        # تأكد من أن لديك related_name 'messages' في نموذج الرسائل الخاص بك
        return self.messages.filter(is_read=False, receiver=self.sender).count()
