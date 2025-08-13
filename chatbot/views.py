import uuid
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter
from django.db import models
from .models import ChatBotConversation, ChatBotMessage
from .serializers import (
    ChatBotConversationSerializer,
    ChatBotMessageSerializer,
    ChatBotMessageCreateSerializer
)
from .ai_clients import get_ai_client
from django.conf import settings
from django.utils.translation import gettext_lazy as _


class ChatBotConversationListView(generics.ListAPIView):
    serializer_class = ChatBotConversationSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['is_active']
    ordering = ['-updated_at']

    def get_queryset(self):
        return ChatBotConversation.objects.filter(user=self.request.user)


class ChatBotConversationDetailView(generics.RetrieveAPIView):
    serializer_class = ChatBotConversationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ChatBotConversation.objects.filter(user=self.request.user)


class ChatBotSendMessageView(generics.CreateAPIView):
    serializer_class = ChatBotMessageCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        if not getattr(settings, 'AI_CHATBOT_ENABLED', True):
            return Response({
                'error': _('ChatBot service is currently disabled')
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user
        content = serializer.validated_data['content']
        session_id = serializer.validated_data.get('session_id')

        # إنشاء أو الحصول على المحادثة
        if session_id:
            try:
                conversation = ChatBotConversation.objects.get(
                    session_id=session_id,
                    user=user
                )
            except ChatBotConversation.DoesNotExist:
                conversation = ChatBotConversation.objects.create(
                    user=user,
                    session_id=session_id
                )
        else:
            # إنشاء محادثة جديدة
            session_id = str(uuid.uuid4())
            conversation = ChatBotConversation.objects.create(
                user=user,
                session_id=session_id
            )

        # حفظ رسالة المستخدم
        user_message = ChatBotMessage.objects.create(
            conversation=conversation,
            message_type='user',
            content=content
        )

        # الحصول على تاريخ المحادثة
        conversation_history = conversation.messages.order_by('created_at')

        # الحصول على AI client
        ai_model = request.data.get('ai_model', getattr(settings, 'AI_DEFAULT_MODEL', 'mock'))
        ai_client = get_ai_client(ai_model)

        # توليد الرد
        ai_response = ai_client.generate_response(content, conversation_history)

        # حفظ رد البوت
        bot_message = ChatBotMessage.objects.create(
            conversation=conversation,
            message_type='bot',
            content=ai_response['response'],
            ai_model=ai_response.get('model', ai_model),
            tokens_used=ai_response.get('tokens_used', 0),
            response_time=ai_response.get('response_time', 0.0)
        )

        # تحديث وقت المحادثة
        conversation.save()

        return Response({
            'session_id': conversation.session_id,
            'user_message': ChatBotMessageSerializer(user_message).data,
            'bot_response': ChatBotMessageSerializer(bot_message).data,
            'success': ai_response['success']
        }, status=status.HTTP_201_CREATED)


class ChatBotNewConversationView(generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        session_id = str(uuid.uuid4())
        conversation = ChatBotConversation.objects.create(
            user=request.user,
            session_id=session_id
        )

        # رسالة ترحيب
        welcome_message = ChatBotMessage.objects.create(
            conversation=conversation,
            message_type='bot',
            content=f"""مرحباً {request.user.name}! 👋

أنا مساعدك الذكي في PlumbingConnect. يمكنني مساعدتك في:

🔧 العثور على سباكين محترفين في منطقتك
💬 الإجابة على أسئلة حول مشاكل السباكة
📱 شرح كيفية استخدام الموقع
⭐ نصائح للصيانة الوقائية

كيف يمكنني مساعدتك اليوم؟""",
            ai_model='system'
        )

        return Response({
            'session_id': conversation.session_id,
            'conversation': ChatBotConversationSerializer(conversation).data
        }, status=status.HTTP_201_CREATED)


class ChatBotEndConversationView(generics.UpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ChatBotConversation.objects.filter(user=self.request.user)

    def update(self, request, *args, **kwargs):
        conversation = self.get_object()
        conversation.is_active = False
        conversation.save()

        return Response({
            'message': _('Conversation ended successfully')
        }, status=status.HTTP_200_OK)


class ChatBotStatsView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        conversations = ChatBotConversation.objects.filter(user=user)
        messages = ChatBotMessage.objects.filter(conversation__user=user)

        stats = {
            'total_conversations': conversations.count(),
            'active_conversations': conversations.filter(is_active=True).count(),
            'total_messages': messages.count(),
            'user_messages': messages.filter(message_type='user').count(),
            'bot_responses': messages.filter(message_type='bot').count(),
            'total_tokens_used': sum(messages.values_list('tokens_used', flat=True)),
            'average_response_time': messages.filter(message_type='bot').aggregate(
                avg_time=models.Avg('response_time')
            )['avg_time'] or 0
        }

        return Response(stats, status=status.HTTP_200_OK)
