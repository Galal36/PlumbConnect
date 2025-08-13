from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PostViewSet, CommentViewSet, CommentReplyViewSet

router = DefaultRouter()
router.register('posts', PostViewSet, basename='post')
router.register('comments', CommentViewSet, basename='comment')
router.register('replies', CommentReplyViewSet, basename='reply')

urlpatterns = [
    path('', include(router.urls)),
]
