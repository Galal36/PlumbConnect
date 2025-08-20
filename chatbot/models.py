from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class ChatBotConversation(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chatbot_conversations')
    session_id = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['-updated_at']
        indexes = [
            models.Index(fields=['user', 'is_active']),
            models.Index(fields=['session_id']),
        ]

    def __str__(self):
        return f"ChatBot conversation for {self.user.name} - {self.session_id}"


class ChatBotMessage(models.Model):
    MESSAGE_TYPES = (
        ('user', 'رسالة المستخدم'),
        ('bot', 'رد البوت'),
        ('system', 'رسالة النظام'),
    )

    conversation = models.ForeignKey(ChatBotConversation, on_delete=models.CASCADE, related_name='messages')
    message_type = models.CharField(max_length=10, choices=MESSAGE_TYPES)
    content = models.TextField()
    ai_model = models.CharField(max_length=50, blank=True, null=True)  # grok, deepseek, mock
    tokens_used = models.IntegerField(default=0)
    response_time = models.FloatField(default=0.0)  # بالثواني
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['conversation', 'created_at']),
            models.Index(fields=['message_type']),
        ]

    def __str__(self):
        return f"{self.message_type}: {self.content[:50]}..."
