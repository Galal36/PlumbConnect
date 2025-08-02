### chat/models.py
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Chat(models.Model):
    sender = models.ForeignKey(User, related_name='chats_sent', on_delete=models.CASCADE)
    receiver = models.ForeignKey(User, related_name='chats_received', on_delete=models.CASCADE)