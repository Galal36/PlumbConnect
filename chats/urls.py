from django.urls import path
from . import views

app_name = 'chats'

urlpatterns = [
    # CRUD Operations للمحادثات
    path('', views.ChatListCreateView.as_view(), name='chat-list-create'),
    path('<int:pk>/', views.ChatDetailView.as_view(), name='chat-detail'),
    path('<int:pk>/update/', views.ChatUpdateView.as_view(), name='chat-update'),
    path('<int:pk>/delete/', views.ChatDeleteView.as_view(), name='chat-delete'),

    # Custom URLs للمحادثات
    path('my-chats/', views.MyChatListView.as_view(), name='my-chats'),
    path('active/', views.ActiveChatsView.as_view(), name='active-chats'),
    path('archived/', views.ArchivedChatsView.as_view(), name='archived-chats'),
    path('search/', views.SearchChatsView.as_view(), name='search-chats'),

    # Actions للمحادثات
    path('<int:pk>/mark-as-read/', views.MarkChatAsReadView.as_view(), name='mark-chat-as-read'),
    path('<int:pk>/archive/', views.ArchiveChatView.as_view(), name='archive-chat'),
    path('<int:pk>/unarchive/', views.UnarchiveChatView.as_view(), name='unarchive-chat'),

    # URLs إضافية
    path('user/<int:user_id>/', views.ChatWithUserView.as_view(), name='chat-with-user'),
    path('count/', views.ChatCountView.as_view(), name='chat-count'),
    path('admin-create/', views.AdminCreateChatView.as_view(), name='admin-create-chat'),
]
