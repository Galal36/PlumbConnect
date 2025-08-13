from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Message(models.Model):
    MESSAGE_TYPES = (
        ('text', 'Text'),
        ('image', 'Image'),
        ('system', 'System'),
    )

    message = models.TextField()
    image = models.ImageField(upload_to='messages/', blank=True, null=True)
    message_type = models.CharField(max_length=10, choices=MESSAGE_TYPES, default='text')
    chat = models.ForeignKey('chats.Chat', related_name='messages', on_delete=models.CASCADE)
    sender = models.ForeignKey(User, related_name='messages_sent', on_delete=models.CASCADE)
    receiver = models.ForeignKey(User, related_name='messages_received', on_delete=models.CASCADE)
    sent_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    is_deleted = models.BooleanField(default=False)
    link = models.URLField(blank=True, null=True)  # لروابط التقييم

    class Meta:
        ordering = ['sent_at']
        indexes = [models.Index(fields=['sent_at'])]

    def __str__(self):
        return f"Message from {self.sender.name} to {self.receiver.name}"