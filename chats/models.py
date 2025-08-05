from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Chat(models.Model):
    sender = models.ForeignKey(User, related_name='chats_sent', on_delete=models.CASCADE)
    receiver = models.ForeignKey(User, related_name='chats_received', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

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
        if self.sender.role == self.receiver.role:
            raise ValueError("Chat must be between a client and a plumber.")
        super().save(*args, **kwargs)

    @property
    def last_message(self):
        return self.messages.last()

    @property
    def unread_count(self):
        return self.messages.filter(is_read=False, receiver=self.sender).count()


