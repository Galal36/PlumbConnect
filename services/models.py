### service/models.py
from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator

User = get_user_model()

class Service(models.Model):
    sender = models.ForeignKey(User, related_name='services_sent', on_delete=models.CASCADE)
    receiver = models.ForeignKey(User, related_name='services_received', on_delete=models.CASCADE)
    status = models.CharField(max_length=50)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']  # Newest first


class ServiceReview(models.Model):
    service_request = models.OneToOneField(Service, on_delete=models.CASCADE, related_name='review')
    reviewer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='service_reviews_given')
    plumber = models.ForeignKey(User, on_delete=models.CASCADE, related_name='service_reviews_received')
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ['service_request', 'reviewer']  # One review per service per reviewer

    def __str__(self):
        return f"Review by {self.reviewer.name} for {self.plumber.name} - {self.rating}/5"