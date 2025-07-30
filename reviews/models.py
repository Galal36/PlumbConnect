### review/models.py
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Review(models.Model):
    rate = models.PositiveSmallIntegerField()
    description = models.TextField()
    maker = models.ForeignKey(User, related_name='reviews_made', on_delete=models.CASCADE)
    receiver = models.ForeignKey(User, related_name='reviews_received', on_delete=models.CASCADE)