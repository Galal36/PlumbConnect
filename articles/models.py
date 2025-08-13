from django.db import models
from users.models import User


class Article(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    image = models.ImageField(upload_to='articles/', null=True, blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='articles')
    is_approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
