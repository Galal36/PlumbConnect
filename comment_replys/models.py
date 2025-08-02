from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Comment_Reply(models.Model):
    reply = models.TextField()
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey('posts.Post', on_delete=models.CASCADE)
    comment = models.ForeignKey('comments.Comment', on_delete=models.CASCADE)