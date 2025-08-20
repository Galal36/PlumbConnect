from django.urls import path
from . import views

app_name = 'chat_messages'

urlpatterns = [
    path('', views.MessageListCreateView.as_view(), name='message-list'),
    path('<int:pk>/', views.MessageDetailView.as_view(), name='message-detail'),
    path('mark-read/', views.MessageMarkReadView.as_view(), name='mark-read'),
]
