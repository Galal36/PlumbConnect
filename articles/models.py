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
<<<<<<< HEAD
    ai_review_score = models.IntegerField(null=True, blank=True, help_text="Overall score from AI (e.g., average of technical and relevance)")
    ai_review_summary = models.TextField(blank=True, null=True, help_text="Summary provided by AI")
    ai_review_concerns = models.JSONField(null=True, blank=True, help_text="Safety or content concerns identified by AI")
=======
>>>>>>> plumb_

    def __str__(self):
        return self.title
