# articles/serializers.py
from rest_framework import serializers
from .models import Article
from users.serializers import UserSerializer # To display author info

# This class is to allow just admins to approve the articles
class ArticleApprovalSerializer(serializers.ModelSerializer):
    """
    Serializer specifically for changing the is_approved status.
    """
    class Meta:
        model = Article
        fields = ['is_approved']

# --- NEW: Serializer for creating an article (hides AI fields) ---
class ArticleCreateSerializer(serializers.ModelSerializer):
    """
    This serializer is used ONLY for the 'create' action.
    It does not include the AI review fields in its output.
    """
    user = UserSerializer(read_only=True)

    class Meta:
        model = Article
        fields = [
            'id', 'title', 'description', 'image', 'user', 
            'is_approved', 'created_at', 'updated_at'
        ]
        read_only_fields = ['is_approved', 'user']

# --- UPDATED: The main serializer for viewing articles ---
class ArticleDetailSerializer(serializers.ModelSerializer):
    """
    This is the default serializer for viewing articles (list, retrieve).
    It INCLUDES the sensitive AI review fields for admins.
    """
    user = UserSerializer(read_only=True)

    class Meta:
        model = Article
        fields = [
            'id', 'title', 'description', 'image', 'user', 
            'is_approved', 'created_at', 'updated_at',
            'ai_review_score', 'ai_review_summary', 'ai_review_concerns'
        ]
        read_only_fields = ['is_approved', 'user']
