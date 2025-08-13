from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter, SearchFilter
from django.db.models import Q
from .models import Chat
from .serializers import ChatSerializer, ChatCreateSerializer, ChatUpdateSerializer
from users.permissions import IsAdmin
from django.utils.translation import gettext_lazy as _
<<<<<<< HEAD
from notifications.notification_helpers import notify_new_chat
=======
from utils.notification_helpers import notify_new_chat
from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()

>>>>>>> plumb_

class IsAdminOrChatParticipant(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user.role == 'admin' or request.user in [obj.sender, obj.receiver]

<<<<<<< HEAD
=======

>>>>>>> plumb_
class BaseChatQuerysetMixin:
    def get_queryset(self):
        user = self.request.user
        return Chat.objects.filter(
            Q(sender=user) | Q(receiver=user)
        ).select_related('sender', 'receiver')

<<<<<<< HEAD
=======

>>>>>>> plumb_
class ChatListCreateView(BaseChatQuerysetMixin, generics.ListCreateAPIView):
    serializer_class = ChatSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['is_active', 'is_archived']
    ordering_fields = ['created_at', 'updated_at']
    ordering = ['-updated_at']

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ChatCreateSerializer
        return ChatSerializer

    def perform_create(self, serializer):
        chat = serializer.save(sender=self.request.user)
        notify_new_chat(chat.receiver, chat, request=self.request)

<<<<<<< HEAD
=======

>>>>>>> plumb_
class ChatDetailView(BaseChatQuerysetMixin, generics.RetrieveAPIView):
    serializer_class = ChatSerializer
    permission_classes = [IsAdminOrChatParticipant]

<<<<<<< HEAD
=======

>>>>>>> plumb_
class ChatUpdateView(BaseChatQuerysetMixin, generics.UpdateAPIView):
    serializer_class = ChatUpdateSerializer
    permission_classes = [IsAdminOrChatParticipant]

<<<<<<< HEAD
=======

>>>>>>> plumb_
class ChatDeleteView(BaseChatQuerysetMixin, generics.DestroyAPIView):
    serializer_class = ChatSerializer
    permission_classes = [IsAdminOrChatParticipant]

<<<<<<< HEAD
=======

>>>>>>> plumb_
class MyChatListView(BaseChatQuerysetMixin, generics.ListAPIView):
    serializer_class = ChatSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return super().get_queryset().filter(is_active=True)

<<<<<<< HEAD
=======

>>>>>>> plumb_
class ActiveChatsView(BaseChatQuerysetMixin, generics.ListAPIView):
    serializer_class = ChatSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return super().get_queryset().filter(is_active=True, is_archived=False)

<<<<<<< HEAD
=======

>>>>>>> plumb_
class ArchivedChatsView(BaseChatQuerysetMixin, generics.ListAPIView):
    serializer_class = ChatSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return super().get_queryset().filter(is_archived=True)

<<<<<<< HEAD
=======

>>>>>>> plumb_
class SearchChatsView(BaseChatQuerysetMixin, generics.ListAPIView):
    serializer_class = ChatSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['sender__name', 'receiver__name']
    ordering_fields = ['created_at', 'updated_at']
    ordering = ['-updated_at']

    def get_queryset(self):
        queryset = super().get_queryset()
        query = self.request.query_params.get('q', '')
        if query:
            queryset = queryset.filter(
                Q(sender__name__icontains=query) | Q(receiver__name__icontains=query)
            )
        return queryset

<<<<<<< HEAD
=======

>>>>>>> plumb_
class MarkChatAsReadView(BaseChatQuerysetMixin, generics.UpdateAPIView):
    serializer_class = ChatSerializer
    permission_classes = [permissions.IsAuthenticated]

    def update(self, request, *args, **kwargs):
        chat = self.get_object()
        if request.user in [chat.sender, chat.receiver]:
            messages = chat.messages.filter(receiver=request.user, is_read=False, is_deleted=False)
            updated_count = messages.update(is_read=True)
            return Response({'status': _('chat marked as read'), 'updated_count': updated_count},
<<<<<<< HEAD
                           status=status.HTTP_200_OK)
        return Response({'error': _('You can only mark your own chats as read')},
                       status=status.HTTP_403_FORBIDDEN)
=======
                            status=status.HTTP_200_OK)
        return Response({'error': _('You can only mark your own chats as read')},
                        status=status.HTTP_403_FORBIDDEN)

>>>>>>> plumb_

class ArchiveChatView(BaseChatQuerysetMixin, generics.UpdateAPIView):
    serializer_class = ChatSerializer
    permission_classes = [permissions.IsAuthenticated]

    def update(self, request, *args, **kwargs):
        chat = self.get_object()
        if request.user in [chat.sender, chat.receiver]:
            chat.is_archived = True
            chat.save()
            serializer = self.get_serializer(chat)
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response({'error': _('You can only archive your own chats')},
<<<<<<< HEAD
                       status=status.HTTP_403_FORBIDDEN)
=======
                        status=status.HTTP_403_FORBIDDEN)

>>>>>>> plumb_

class UnarchiveChatView(BaseChatQuerysetMixin, generics.UpdateAPIView):
    serializer_class = ChatSerializer
    permission_classes = [permissions.IsAuthenticated]

    def update(self, request, *args, **kwargs):
        chat = self.get_object()
        if request.user in [chat.sender, chat.receiver]:
            chat.is_archived = False
            chat.save()
            serializer = self.get_serializer(chat)
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response({'error': _('You can only unarchive your own chats')},
<<<<<<< HEAD
                       status=status.HTTP_403_FORBIDDEN)
=======
                        status=status.HTTP_403_FORBIDDEN)

>>>>>>> plumb_

class ChatWithUserView(generics.CreateAPIView):
    serializer_class = ChatCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        user_id = self.kwargs['user_id']
        try:
            receiver = User.objects.get(id=user_id)
            if receiver == self.request.user:
<<<<<<< HEAD
                return Response({'error': _('Cannot create chat with yourself')},
                               status=status.HTTP_400_BAD_REQUEST)
            serializer.save(sender=self.request.user, receiver=receiver)
            notify_new_chat(receiver, serializer.instance, request=self.request)
        except User.DoesNotExist:
            return Response({'error': _('User not found')}, status=status.HTTP_404_NOT_FOUND)
=======
                raise serializers.ValidationError({'error': _('Cannot create chat with yourself')})

            # التحقق الجديد: السباك لا يستطيع بدء محادثة مع العميل
            if self.request.user.role == 'plumber' and receiver.role == 'client':
                raise serializers.ValidationError({
                    'error': _(
                        'Plumbers cannot initiate chats with clients. Only clients can start conversations with plumbers.')
                })

            serializer.save(sender=self.request.user, receiver=receiver)
            notify_new_chat(receiver, serializer.instance, request=self.request)
        except User.DoesNotExist:
            raise serializers.ValidationError({'error': _('User not found')})

>>>>>>> plumb_

class ChatCountView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        count = Chat.objects.filter(
            Q(sender=user) | Q(receiver=user)
        ).count()
        return Response({'total_chats_count': count}, status=status.HTTP_200_OK)

<<<<<<< HEAD
=======

>>>>>>> plumb_
class AdminCreateChatView(generics.CreateAPIView):
    serializer_class = ChatCreateSerializer
    permission_classes = [IsAdmin]

    def perform_create(self, serializer):
        chat = serializer.save(sender=self.request.user, is_admin_created=True)
        notify_new_chat(chat.receiver, chat, request=self.request)
