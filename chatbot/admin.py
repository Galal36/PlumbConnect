from django.contrib import admin
from .models import ChatBotConversation, ChatBotMessage

@admin.register(ChatBotConversation)
class ChatBotConversationAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'session_id', 'is_active', 'created_at', 'updated_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['user__name', 'user__email', 'session_id']
    readonly_fields = ['session_id', 'created_at', 'updated_at']

@admin.register(ChatBotMessage)
class ChatBotMessageAdmin(admin.ModelAdmin):
    list_display = ['id', 'conversation', 'message_type', 'ai_model', 'tokens_used', 'response_time', 'created_at']
    list_filter = ['message_type', 'ai_model', 'created_at']
    search_fields = ['content', 'conversation__user__name']
    readonly_fields = ['created_at']
