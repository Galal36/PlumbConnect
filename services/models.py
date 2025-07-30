### service/models.py
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Service(models.Model):
    sender = models.ForeignKey(User, related_name='services_sent', on_delete=models.CASCADE)
    receiver = models.ForeignKey(User, related_name='services_received', on_delete=models.CASCADE)
    status = models.CharField(max_length=50)
    amount = models.DecimalField(max_digits=10, decimal_places=2)