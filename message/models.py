### messages/models.py
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Message(models.Model):
    message = models.TextField()
    image = models.ImageField(upload_to='messages/', blank=True, null=True)
    chat = models.ForeignKey('chats.Chat', on_delete=models.CASCADE)
    sender = models.ForeignKey(User, related_name='messages_sent', on_delete=models.CASCADE)
    receiver = models.ForeignKey(User, related_name='messages_received', on_delete=models.CASCADE)
    sent_at = models.DateTimeField(auto_now_add=True)
