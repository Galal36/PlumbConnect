### complaint/models.py
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Complaint(models.Model):
    description = models.TextField()
    from_user = models.ForeignKey(User, related_name='complaints_sent', on_delete=models.CASCADE)
    to_user = models.ForeignKey(User, related_name='complaints_received', on_delete=models.CASCADE)