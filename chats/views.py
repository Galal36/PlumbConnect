from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.db.models import Q
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import Chat
from .serializers import ChatSerializer, ChatCreateSerializer
from django.contrib.auth import get_user_model
from users.permissions import IsAdmin

User = get_user_model()

# إذن مخصص للسماح للمدير أو أطراف المحادثة
class IsAdminOrChatParticipant(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user.role == 'admin' or request.user in [obj.sender, obj.receiver]

# Base queryset for chats accessible by the user
class BaseChatQuerysetMixin:
    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Chat.objects.all().select_related('sender', 'receiver').prefetch_related('messages')
        return Chat.objects.filter(
            Q(sender=user) | Q(receiver=user)
        ).select_related('sender', 'receiver').prefetch_related('messages')

# 1. ChatListCreateView: لعرض وإنشاء المحادثات
class ChatListCreateView(BaseChatQuerysetMixin, generics.ListCreateAPIView):
    serializer_class = ChatSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['is_active']
    search_fields = ['sender__name', 'receiver__name']
    ordering_fields = ['created_at', 'updated_at']
    ordering = ['-updated_at']

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ChatCreateSerializer
        return ChatSerializer

# 2. ChatDetailView: لعرض تفاصيل محادثة واحدة
class ChatDetailView(BaseChatQuerysetMixin, generics.RetrieveAPIView):
    serializer_class = ChatSerializer
    permission_classes = [IsAdminOrChatParticipant]

# 3. ChatUpdateView: لتحديث محادثة (مثلاً is_active)
class ChatUpdateView(BaseChatQuerysetMixin, generics.UpdateAPIView):
    serializer_class = ChatSerializer
    permission_classes = [IsAdminOrChatParticipant]

# 4. ChatDeleteView: لحذف محادثة (Hard Delete)
class ChatDeleteView(BaseChatQuerysetMixin, generics.DestroyAPIView):
    serializer_class = ChatSerializer
    permission_classes = [IsAdminOrChatParticipant]

# 5. MyChatListView: لعرض جميع محادثات المستخدم الحالي
class MyChatListView(BaseChatQuerysetMixin, generics.ListAPIView):
    serializer_class = ChatSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['is_active']
    search_fields = ['sender__name', 'receiver__name']
    ordering_fields = ['created_at', 'updated_at']
    ordering = ['-updated_at']

# 6. ActiveChatsView: لعرض المحادثات النشطة فقط
class ActiveChatsView(BaseChatQuerysetMixin, generics.ListAPIView):
    serializer_class = ChatSerializer
    permission_classes = [permissions.IsAuthenticated]
    ordering = ['-updated_at']

    def get_queryset(self):
        return super().get_queryset().filter(is_active=True)

# 7. ArchivedChatsView: لعرض المحادثات المؤرشفة
class ArchivedChatsView(BaseChatQuerysetMixin, generics.ListAPIView):
    serializer_class = ChatSerializer
    permission_classes = [permissions.IsAuthenticated]
    ordering = ['-updated_at']

    def get_queryset(self):
        return super().get_queryset().filter(is_active=False)

# 8. SearchChatsView: للبحث في المحادثات
class SearchChatsView(BaseChatQuerysetMixin, generics.ListAPIView):
    serializer_class = ChatSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['sender__name', 'receiver__name', 'messages__message']
    ordering_fields = ['created_at', 'updated_at']
    ordering = ['-updated_at']

    def get_queryset(self):
        queryset = super().get_queryset()
        query = self.request.query_params.get('q', '')
        if query:
            queryset = queryset.filter(
                Q(sender__name__icontains=query) |
                Q(receiver__name__icontains=query) |
                Q(messages__message__icontains=query)
            ).distinct()
        return queryset

# 9. MarkChatAsReadView: لتحديد جميع رسائل المحادثة كمقروءة
class MarkChatAsReadView(generics.UpdateAPIView):
    serializer_class = ChatSerializer
    permission_classes = [IsAdminOrChatParticipant]

    def get_object(self):
        chat_id = self.kwargs['pk']
        user = self.request.user
        try:
            chat = Chat.objects.get(id=chat_id)
            if user not in [chat.sender, chat.receiver] and user.role != 'admin':
                raise permissions.PermissionDenied("You do not have permission to access this chat.")
            return chat
        except Chat.DoesNotExist:
            raise status.HTTP_404_NOT_FOUND

    def update(self, request, *args, **kwargs):
        chat = self.get_object()
        user = request.user

        updated_count = chat.messages.filter(
            receiver=user,
            is_read=False
        ).update(is_read=True)

        return Response({
            'status': 'messages marked as read',
            'updated_count': updated_count
        }, status=status.HTTP_200_OK)

# 10. ArchiveChatView: لأرشفة المحادثة
class ArchiveChatView(generics.UpdateAPIView):
    serializer_class = ChatSerializer
    permission_classes = [IsAdminOrChatParticipant]

    def get_object(self):
        chat_id = self.kwargs['pk']
        user = self.request.user
        try:
            chat = Chat.objects.get(id=chat_id)
            if user not in [chat.sender, chat.receiver] and user.role != 'admin':
                raise permissions.PermissionDenied("You do not have permission to access this chat.")
            return chat
        except Chat.DoesNotExist:
            raise status.HTTP_404_NOT_FOUND

    def update(self, request, *args, **kwargs):
        chat = self.get_object()
        chat.is_active = False
        chat.save()
        return Response({'status': 'chat archived'}, status=status.HTTP_200_OK)

# 11. UnarchiveChatView: لإلغاء أرشفة المحادثة
class UnarchiveChatView(generics.UpdateAPIView):
    serializer_class = ChatSerializer
    permission_classes = [IsAdminOrChatParticipant]

    def get_object(self):
        chat_id = self.kwargs['pk']
        user = self.request.user
        try:
            chat = Chat.objects.get(id=chat_id)
            if user not in [chat.sender, chat.receiver] and user.role != 'admin':
                raise permissions.PermissionDenied("You do not have permission to access this chat.")
            return chat
        except Chat.DoesNotExist:
            raise status.HTTP_404_NOT_FOUND

    def update(self, request, *args, **kwargs):
        chat = self.get_object()
        chat.is_active = True
        chat.save()
        return Response({'status': 'chat unarchived'}, status=status.HTTP_200_OK)

# 12. ChatWithUserView: للحصول على محادثة مع مستخدم معين
class ChatWithUserView(BaseChatQuerysetMixin, generics.RetrieveAPIView):
    serializer_class = ChatSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        user_id = self.kwargs['user_id']
        current_user = self.request.user
        try:
            other_user = User.objects.get(id=user_id)
            chat = Chat.objects.filter(
                Q(sender=current_user, receiver=other_user) |
                Q(sender=other_user, receiver=current_user)
            ).first()
            if not chat:
                raise status.HTTP_404_NOT_FOUND
            return chat
        except User.DoesNotExist:
            raise status.HTTP_404_NOT_FOUND

# 13. ChatCountView: لعد إجمالي المحادثات للمستخدم
class ChatCountView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        count = Chat.objects.filter(
            Q(sender=user) | Q(receiver=user)
        ).count()
        return Response({'total_chats_count': count}, status=status.HTTP_200_OK)

# 14. AdminCreateChatView: لإنشاء محادثة بواسطة المدير
class AdminCreateChatView(generics.CreateAPIView):
    serializer_class = ChatCreateSerializer
    permission_classes = [IsAdmin]
