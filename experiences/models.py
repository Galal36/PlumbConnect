### experience/models.py
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Experience(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    start_date = models.DateField()
    end_date = models.DateField()
    user = models.ForeignKey(User, on_delete=models.CASCADE)