from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Article
from .serializers import ArticleSerializer, ArticleApprovalSerializer 
from .permissions import IsPlumberOrReadOnly, IsAdminUser 



class ArticleViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows articles to be viewed or edited.
    - Anyone can view approved articles.
    - Only plumbers can create new articles.
    - Only the author plumber can edit or delete their own articles.
    """
    serializer_class = ArticleSerializer
    permission_classes = [IsPlumberOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        """
        - Admins can see all articles.
        - Plumbers can see all approved articles AND their own articles.
        - Other users can only see approved articles.
        """
        # If the user is an admin, return all articles.
        if user.is_authenticated and user.role == 'admin':
            return Article.objects.all()

        if user.is_authenticated and user.role == 'plumber':
            # Plumbers can see all approved articles OR their own articles.
            return Article.objects.filter(is_approved=True) | Article.objects.filter(user=user)
        
        # Anonymous or non-plumber users can only see approved articles.
        return Article.objects.filter(is_approved=True)


    def perform_create(self, serializer):
        """
        Automatically set the author of the article to the logged-in user.
        """
        serializer.save(user=self.request.user)

        
    @action(detail=True, methods=['patch'], permission_classes=[IsAdminUser])
    def approve(self, request, pk=None):
        """
        Custom action for an admin to approve an article.
        """
        article = self.get_object()
        serializer = ArticleApprovalSerializer(article, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)