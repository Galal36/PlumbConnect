from django.urls import path
from . import views

app_name = 'chatbot'

urlpatterns = [
    # المحادثات
    path('conversations/', views.ChatBotConversationListView.as_view(), name='conversation-list'),
    path('conversations/<int:pk>/', views.ChatBotConversationDetailView.as_view(), name='conversation-detail'),
    path('conversations/new/', views.ChatBotNewConversationView.as_view(), name='new-conversation'),
    path('conversations/<int:pk>/end/', views.ChatBotEndConversationView.as_view(), name='end-conversation'),

    # الرسائل
    path('send/', views.ChatBotSendMessageView.as_view(), name='send-message'),

    # الإحصائيات
    path('stats/', views.ChatBotStatsView.as_view(), name='chatbot-stats'),
]
