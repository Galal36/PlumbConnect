### post/models.py
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Post(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    statement = models.TextField()
    image = models.ImageField(upload_to='posts/', blank=True, null=True)