from django.urls import path
from . import views

app_name = 'chats'

urlpatterns = [
    path('', views.ChatListCreateView.as_view(), name='chat-list'),
    path('<int:pk>/', views.ChatDetailView.as_view(), name='chat-detail'),
    path('<int:pk>/archive/', views.ChatArchiveView.as_view(), name='chat-archive'),
]
