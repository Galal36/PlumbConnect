from django.urls import path
from . import views

app_name = 'notifications'

urlpatterns = [
    # CRUD Operations للإشعارات
    path('', views.NotificationListView.as_view(), name='notification-list'),
    path('create/', views.NotificationCreateView.as_view(), name='notification-create'),
    path('<int:pk>/', views.NotificationDetailView.as_view(), name='notification-detail'),
    path('<int:pk>/update/', views.NotificationUpdateView.as_view(), name='notification-update'),
    path('<int:pk>/delete/', views.NotificationDeleteView.as_view(), name='notification-delete'),

    # إدارة الإشعارات
    path('unread/', views.UnreadNotificationsView.as_view(), name='unread-notifications'),
    path('read/', views.ReadNotificationsView.as_view(), name='read-notifications'),
    path('<int:pk>/mark-as-read/', views.MarkNotificationAsReadView.as_view(), name='mark-notification-read'),
    path('mark-all-as-read/', views.MarkAllNotificationsAsReadView.as_view(), name='mark-all-notifications-read'),

    # حسب النوع
    path('type/<str:notification_type>/', views.NotificationsByTypeView.as_view(), name='notifications-by-type'),
    path('messages/', views.MessageNotificationsView.as_view(), name='message-notifications'),
    path('chats/', views.ChatNotificationsView.as_view(), name='chat-notifications'),
    path('complaints/', views.ComplaintNotificationsView.as_view(), name='complaint-notifications'),
    path('system/', views.SystemNotificationsView.as_view(), name='system-notifications'),

    # إحصائيات وعدادات
    path('unread-count/', views.UnreadNotificationCountView.as_view(), name='unread-notification-count'),
    path('count/', views.NotificationCountView.as_view(), name='notification-count'),
    path('recent/', views.RecentNotificationsView.as_view(), name='recent-notifications'),
    path('important/', views.ImportantNotificationsView.as_view(), name='important-notifications'),

    # تنظيف الإشعارات
    path('clear-all/', views.ClearAllNotificationsView.as_view(), name='clear-all-notifications'),
    path('clear-read/', views.ClearReadNotificationsView.as_view(), name='clear-read-notifications'),
    path('clear-old/', views.ClearOldNotificationsView.as_view(), name='clear-old-notifications'),
]
