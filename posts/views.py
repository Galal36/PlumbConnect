from rest_framework import viewsets, permissions,status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Post, Comment, Comment_Reply, Like
from django_filters.rest_framework import DjangoFilterBackend
from .serializers import PostSerializer, CommentSerializer, CommentReplySerializer
from .permissions import IsOwnerOrReadOnly

class PostViewSet(viewsets.ModelViewSet):
    """API endpoint for posts."""
    queryset = Post.objects.all().order_by('-created_at')
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    # --- Add this new action ---
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def like(self, request, pk=None):
        """
        Toggles a 'like' on a post for the current user.
        """
        post = self.get_object()
        user = request.user

        try:
            # Check if the user has already liked the post
            like = Like.objects.get(user=user, post=post)
            # If a like exists, delete it (unlike)
            like.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Like.DoesNotExist:
            # If no like exists, create one (like)
            Like.objects.create(user=user, post=post)
            return Response(status=status.HTTP_201_CREATED)


class CommentViewSet(viewsets.ModelViewSet):
    """API endpoint for comments."""
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]

    def perform_create(self, serializer):
        # The post_id will be passed in the request data
        serializer.save(user=self.request.user)

class CommentReplyViewSet(viewsets.ModelViewSet):
    """API endpoint for comment replies."""
    queryset = Comment_Reply.objects.all()
    serializer_class = CommentReplySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    
    # Add these three lines to enable filtering
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['comment']

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)