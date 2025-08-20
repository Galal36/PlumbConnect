from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db import models
from .models import Chat
from .serializers import ChatSerializer, ChatCreateSerializer
from .permissions import IsAdminOrChatParticipant


class ChatListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['is_active', 'is_archived']
    search_fields = ['sender__name', 'receiver__name']
    ordering = ['-updated_at']

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ChatCreateSerializer
        return ChatSerializer

    def get_queryset(self):
        user = self.request.user
        return Chat.objects.filter(
            models.Q(sender=user) | models.Q(receiver=user)
        ).select_related('sender', 'receiver').prefetch_related('messages')

    def create(self, request, *args, **kwargs):
        # Use ChatCreateSerializer for validation and creation
        create_serializer = ChatCreateSerializer(data=request.data, context={'request': request})
        create_serializer.is_valid(raise_exception=True)
        chat = create_serializer.save()

        # Return the full chat data using ChatSerializer
        response_serializer = ChatSerializer(chat, context={'request': request})
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)


class ChatDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ChatSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrChatParticipant]

    def get_queryset(self):
        user = self.request.user
        return Chat.objects.filter(
            models.Q(sender=user) | models.Q(receiver=user)
        ).select_related('sender', 'receiver')

    def perform_update(self, serializer):
        # السماح بتحديث is_archived فقط
        allowed_fields = ['is_archived']
        update_data = {k: v for k, v in serializer.validated_data.items() 
                      if k in allowed_fields}
        serializer.save(**update_data)


class ChatArchiveView(generics.UpdateAPIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminOrChatParticipant]
    
    def get_queryset(self):
        user = self.request.user
        return Chat.objects.filter(
            models.Q(sender=user) | models.Q(receiver=user)
        )

    def update(self, request, *args, **kwargs):
        chat = self.get_object()
        chat.is_archived = not chat.is_archived
        chat.save()
        
        return Response({
            'message': 'تم أرشفة المحادثة' if chat.is_archived else 'تم إلغاء أرشفة المحادثة',
            'is_archived': chat.is_archived
        })
