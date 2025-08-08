# experiences/api/views.py
from rest_framework import viewsets, permissions
from .serializers import ExperienceSerializer
from experiences.models import Experience
from .permissions import IsOwnerOrAdmin
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from .serializers import ExperienceSerializer
from django.contrib.auth import get_user_model
User = get_user_model()



class ExperienceViewSet(viewsets.ModelViewSet):
    queryset = Experience.objects.all()
    serializer_class = ExperienceSerializer

    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsOwnerOrAdmin()]
        elif self.action in ['create']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class MyExperiencesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        experiences = Experience.objects.filter(user=request.user)
        serializer = ExperienceSerializer(experiences, many=True)
        return Response(serializer.data)


class UserExperiencesView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'detail': 'User not found.'}, status=404)

        experiences = Experience.objects.filter(user=user)
        serializer = ExperienceSerializer(experiences, many=True)
        return Response(serializer.data)