from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from reviews.models import Review
from .serializers import ReviewSerializer
from .permissions import IsMakerOrReadOnly

class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsMakerOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(maker=self.request.user)

    # ✅ التقييمات التي صنعها المستخدم الحالي
    @action(detail=False, methods=['get'], url_path='made-by-me')
    def made_by_me(self, request):
        reviews = Review.objects.filter(maker=request.user)
        serializer = self.get_serializer(reviews, many=True)
        return Response(serializer.data)

    # ✅ التقييمات التي استلمها المستخدم الحالي
    @action(detail=False, methods=['get'], url_path='received-by-me')
    def received_by_me(self, request):
        reviews = Review.objects.filter(receiver=request.user)
        serializer = self.get_serializer(reviews, many=True)
        return Response(serializer.data)

    # ✅ التقييمات الخاصة بمستخدم معين (by user_id)
    @action(detail=False, methods=['get'], url_path='user/(?P<user_id>[^/.]+)')
    def by_user_id(self, request, user_id=None):
        reviews = Review.objects.filter(receiver__id=user_id)
        serializer = self.get_serializer(reviews, many=True)
        return Response(serializer.data)
