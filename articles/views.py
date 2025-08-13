<<<<<<< HEAD

=======
>>>>>>> plumb_
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Article
<<<<<<< HEAD
# --- UPDATE THIS IMPORT ---
from .serializers import ArticleDetailSerializer, ArticleCreateSerializer, ArticleApprovalSerializer
from .permissions import IsPlumberOrReadOnly, IsAdminUser
from .ai_reviewer import review_article_with_ai
=======
from .serializers import ArticleSerializer, ArticleApprovalSerializer 
from .permissions import IsPlumberOrReadOnly, IsAdminUser 

>>>>>>> plumb_


class ArticleViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows articles to be viewed or edited.
<<<<<<< HEAD
    """
    # The default serializer is the detailed one
    serializer_class = ArticleDetailSerializer
    permission_classes = [IsPlumberOrReadOnly]

    # --- ADD THIS METHOD TO CHOOSE THE SERIALIZER ---
    def get_serializer_class(self):
        if self.action == 'create':
            return ArticleCreateSerializer
        return self.serializer_class # Use the default for all other actions
    # -----------------------------------------------

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and user.role == 'admin':
            return Article.objects.all()
        if user.is_authenticated and user.role == 'plumber':
            return Article.objects.filter(is_approved=True) | Article.objects.filter(user=user)
        return Article.objects.filter(is_approved=True)

    def perform_create(self, serializer):
        """
        Automatically set the author and trigger the AI review.
        """
        article = serializer.save(user=self.request.user)
        
        ai_feedback = review_article_with_ai(article.description)
        if ai_feedback:
            tech_score = ai_feedback.get('technical_score', 0)
            rel_score = ai_feedback.get('relevance_score', 0)
            article.ai_review_score = (tech_score + rel_score) / 2
            article.ai_review_summary = ai_feedback.get('summary')
            concerns = {
                "safety": ai_feedback.get('safety_concerns', []),
                "inappropriate": ai_feedback.get('is_inappropriate', False)
            }
            article.ai_review_concerns = concerns
            article.save()

    @action(detail=True, methods=['patch'], permission_classes=[IsAdminUser])
    def approve(self, request, pk=None):
=======
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
>>>>>>> plumb_
        article = self.get_object()
        serializer = ArticleApprovalSerializer(article, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
<<<<<<< HEAD
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
=======
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
>>>>>>> plumb_
