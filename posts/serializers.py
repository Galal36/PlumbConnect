from rest_framework import serializers
from .models import Post, Comment, Comment_Reply
from users.serializers import UserSerializer # To show user details

class CommentReplySerializer(serializers.ModelSerializer):
    """Serializer for comment replies."""
    user = UserSerializer(read_only=True)

    class Meta:
        model = Comment_Reply
        # Add 'comment' to the fields list
        fields = ['id', 'user', 'reply', 'created_at', 'comment']
        read_only_fields = ['user']
        # Use extra_kwargs to make the 'comment' field write-only.
        extra_kwargs = {
            'comment': {'write_only': True}
        }

class CommentSerializer(serializers.ModelSerializer):
    """Serializer for comments, includes nested replies."""
    user = UserSerializer(read_only=True)
    replies = CommentReplySerializer(many=True, read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'user', 'comment', 'created_at', 'replies', 'post']
        read_only_fields = ['user']
        extra_kwargs = {
            'post': {'write_only': True}
        }

class PostSerializer(serializers.ModelSerializer):
    """Serializer for posts, includes nested comments."""
    user = UserSerializer(read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    
    #for counting reactions
    likes_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()


    class Meta:
        model = Post
        fields = ['id', 'user', 'statement', 'image', 'created_at', 'comments', 'likes_count', 'is_liked']
        read_only_fields = ['user']
    
    def get_likes_count(self, obj):
        """Returns the number of likes for a post."""
        return obj.likes.count()

    def get_is_liked(self, obj):
        """
        Checks if the requesting user has liked the post.
        Returns True or False.
        """
        user = self.context['request'].user
        if user.is_anonymous:
            return False
        return obj.likes.filter(user=user).exists()

