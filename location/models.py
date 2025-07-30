from django.db import models

class Location(models.Model):
    city = models.CharField(max_length=100)

    def __str__(self):
        return self.city
