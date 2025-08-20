from django.db import models
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError

User = get_user_model()


class Chat(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_chats')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_chats')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    is_archived = models.BooleanField(default=False)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['sender', 'receiver'],
                name='unique_chat_pair'
            )
        ]
        indexes = [
            models.Index(fields=['sender', 'receiver']),
            models.Index(fields=['created_at']),
            models.Index(fields=['is_active']),
        ]
        ordering = ['-updated_at']

    def clean(self):
        # منع المحادثة مع النفس
        if self.sender == self.receiver:
            raise ValidationError("Cannot create chat with yourself")
        
        # التحقق من قيود الأدوار - العميل يمكنه بدء محادثة مع السباك فقط
        if self.sender.role == 'client' and self.receiver.role != 'plumber':
            raise ValidationError("Clients can only chat with plumbers")
        elif self.sender.role == 'plumber' and self.receiver.role != 'client':
            raise ValidationError("Plumbers can only chat with clients")

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Chat between {self.sender.name} and {self.receiver.name}"

    @property
    def participants(self):
        return [self.sender, self.receiver]

    def get_other_participant(self, user):
        return self.receiver if user == self.sender else self.sender
