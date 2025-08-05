from django.urls import reverse
from django.conf import settings

def get_api_url(view_name, *args, **kwargs):
    """
    مساعد لإنشاء URLs للـ API
    """
    return reverse(f'api:v1:{view_name}', args=args, kwargs=kwargs)

def get_full_api_url(request, view_name, *args, **kwargs):
    """
    مساعد لإنشاء URLs كاملة للـ API
    """
    url = get_api_url(view_name, *args, **kwargs)
    return request.build_absolute_uri(url)

# قائمة بجميع URLs المتاحة في النظام
API_ENDPOINTS = {
    'authentication': {
        'login': 'accounts:login',
        'register': 'accounts:register',
        'refresh': 'accounts:refresh-token',
        'logout': 'accounts:logout',
    },
    'chats': {
        'list': 'chats:chat-list',
        'create': 'chats:chat-list',
        'detail': 'chats:chat-detail',
        'my_chats': 'chats:my-chats',
        'active': 'chats:active-chats',
        'archived': 'chats:archived-chats',
    },
    'messages': {
        'list': 'chat_messages:message-list',
        'create': 'chat_messages:message-list',
        'detail': 'chat_messages:message-detail',
        'by_chat': 'chat_messages:messages-by-chat',
        'unread_count': 'chat_messages:unread-count',
    },
    'complaints': {
        'list': 'complaints:complaint-list',
        'create': 'complaints:complaint-list',
        'detail': 'complaints:complaint-detail',
        'my_complaints': 'complaints:my-complaints',
        'statistics': 'complaints:statistics',
    },
    'notifications': {
        'list': 'notifications:notification-list',
        'unread': 'notifications:unread',
        'unread_count': 'notifications:unread-count',
        'mark_all_read': 'notifications:mark-all-as-read',
    }
}
