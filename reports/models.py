from django.db import models
from django.contrib.auth import get_user_model
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType

User = get_user_model()

class Report(models.Model):
    reason = models.TextField()
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    # Generic relation
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    reportable = GenericForeignKey('content_type', 'object_id')

    created_at = models.DateTimeField(auto_now_add=True)