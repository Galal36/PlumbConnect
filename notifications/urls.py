from django.urls import path
from . import views

app_name = 'notifications'

urlpatterns = [
    path('', views.NotificationListView.as_view(), name='notification-list'),
    path('<int:pk>/', views.NotificationDetailView.as_view(), name='notification-detail'),
    path('mark-all-read/', views.NotificationMarkAllReadView.as_view(), name='mark-all-read'),
    path('stats/', views.NotificationStatsView.as_view(), name='notification-stats'),
]
