from django.urls import path
from . import views

app_name = 'chat_messages'

urlpatterns = [
    # CRUD Operations للرسائل
    path('', views.MessageListCreateView.as_view(), name='message-list-create'),
    path('<int:pk>/', views.MessageDetailView.as_view(), name='message-detail'),
    path('<int:pk>/update/', views.MessageUpdateView.as_view(), name='message-update'),
    path('<int:pk>/delete/', views.MessageDeleteView.as_view(), name='message-delete'),

    # رسائل حسب المحادثة
    path('chat/<int:chat_id>/', views.MessagesByChatView.as_view(), name='messages-by-chat'),
    path('chat/<int:chat_id>/latest/', views.LatestMessagesByChatView.as_view(), name='latest-messages-by-chat'),

    # إدارة الرسائل
    path('<int:pk>/mark-as-read/', views.MarkMessageAsReadView.as_view(), name='mark-message-as-read'),
    path('<int:pk>/soft-delete/', views.SoftDeleteMessageView.as_view(), name='soft-delete-message'),
    path('mark-all-read/', views.MarkAllMessagesAsReadView.as_view(), name='mark-all-read'),

    # البحث والفلترة
    path('search/', views.SearchMessagesView.as_view(), name='search-messages'),
    path('media/', views.MediaMessagesView.as_view(), name='media-messages'),
    path('unread/', views.UnreadMessagesView.as_view(), name='unread-messages'),

    # رسائل نظامية
    path('system-message/', views.SendSystemMessageView.as_view(), name='send-system-message'),
    path('chat/<int:chat_id>/system-message/', views.SendSystemMessageToChatView.as_view(),
         name='send-system-message-to-chat'),

    # إحصائيات
    path('unread-count/', views.UnreadCountView.as_view(), name='unread-count'),
    path('count/', views.MessageCountView.as_view(), name='message-count'),

    # تصدير
    path('export/chat/<int:chat_id>/', views.ExportChatMessagesView.as_view(), name='export-chat-messages'),
]
