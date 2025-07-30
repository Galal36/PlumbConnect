from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Article(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    image = models.ImageField(upload_to='articles/', blank=True, null=True)
    status = models.CharField(max_length=50)
    user = models.ForeignKey(User, on_delete=models.CASCADE)