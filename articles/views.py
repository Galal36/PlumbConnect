
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Article
# --- UPDATE THIS IMPORT ---
from .serializers import ArticleDetailSerializer, ArticleCreateSerializer, ArticleApprovalSerializer
from .permissions import IsPlumberOrReadOnly, IsAdminUser
from .ai_reviewer import review_article_with_ai


class ArticleViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows articles to be viewed or edited.
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
        Automatically set the author, set status to pending, and trigger the AI review.
        """
        # Save article with pending status (not approved by default)
        article = serializer.save(user=self.request.user, is_approved=False)

        # Trigger AI review
        ai_feedback = review_article_with_ai(article.description)
        if ai_feedback:
            tech_score = ai_feedback.get('technical_score', 0)
            rel_score = ai_feedback.get('relevance_score', 0)
            article.ai_review_score = (tech_score + rel_score) / 2
            article.ai_review_summary = ai_feedback.get('summary', 'No summary available')
            concerns = {
                "safety": ai_feedback.get('safety_concerns', []),
                "inappropriate": ai_feedback.get('is_inappropriate', False)
            }
            article.ai_review_concerns = concerns
            article.save()
        else:
            # If AI review fails, set default values
            article.ai_review_score = 0.5
            article.ai_review_summary = "AI review unavailable"
            article.ai_review_concerns = {"safety": [], "inappropriate": False}
            article.save()

    @action(detail=True, methods=['patch'], permission_classes=[IsAdminUser])
    def approve(self, request, pk=None):
        article = self.get_object()
        serializer = ArticleApprovalSerializer(article, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
