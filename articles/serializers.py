# articles/serializers.py
from rest_framework import serializers
from .models import Article
from users.serializers import UserSerializer # To display author info

#This class is to allow just admins to approve the aticles
class ArticleApprovalSerializer(serializers.ModelSerializer):
    """
    Serializer specifically for changing the is_approved status.
    """
    class Meta:
        model = Article
        fields = ['is_approved']

class ArticleSerializer(serializers.ModelSerializer):
    # Use a read-only serializer to show author details but not allow editing them.
    user = UserSerializer(read_only=True)

    class Meta:
        model = Article
        fields = [
            'id', 'title', 'description', 'image', 'user', 
            'is_approved', 'created_at', 'updated_at'
        ]
        # Make 'is_approved' read-only for plumbers. Only admins can change this.
        read_only_fields = ['is_approved', 'user']