"""
مساعد لعرض جميع URLs المتاحة في النظام
"""

def get_all_urls():
    """إرجاع قائمة بجميع URLs في النظام"""
    return {
        'authentication': {
            'register': '/api/v1/accounts/auth/register/',
            'login': '/api/v1/accounts/auth/login/',
            'logout': '/api/v1/accounts/auth/logout/',
            'refresh_token': '/api/v1/accounts/auth/refresh-token/',
            'verify_phone': '/api/v1/accounts/auth/verify-phone/',
            'reset_password': '/api/v1/accounts/auth/reset-password/',
        },
        'profile': {
            'my_profile': '/api/v1/accounts/profile/',
            'update_profile': '/api/v1/accounts/profile/update/',
            'upload_image': '/api/v1/accounts/profile/upload-image/',
        },
        'users': {
            'list': '/api/v1/accounts/users/',
            'create': '/api/v1/accounts/users/create/',
            'detail': '/api/v1/accounts/users/{id}/',
            'plumbers': '/api/v1/accounts/plumbers/',
            'customers': '/api/v1/accounts/customers/',
            'search': '/api/v1/accounts/search/',
        },
        'chats': {
            'list': '/api/v1/chats/',
            'create': '/api/v1/chats/',
            'detail': '/api/v1/chats/{id}/',
            'my_chats': '/api/v1/chats/my-chats/',
            'active': '/api/v1/chats/active/',
            'archived': '/api/v1/chats/archived/',
            'search': '/api/v1/chats/search/',
        },
        'messages': {
            'list': '/api/v1/messages/',
            'create': '/api/v1/messages/',
            'detail': '/api/v1/messages/{id}/',
            'by_chat': '/api/v1/messages/chat/{chat_id}/',
            'unread': '/api/v1/messages/unread/',
            'unread_count': '/api/v1/messages/unread-count/',
        },
        'complaints': {
            'list': '/api/v1/complaints/',
            'create': '/api/v1/complaints/',
            'detail': '/api/v1/complaints/{id}/',
            'my_complaints': '/api/v1/complaints/my-complaints/',
            'pending': '/api/v1/complaints/pending/',
            'resolved': '/api/v1/complaints/resolved/',
            'statistics': '/api/v1/complaints/statistics/',
        },
        'notifications': {
            'list': '/api/v1/notifications/',
            'create': '/api/v1/notifications/create/',
            'detail': '/api/v1/notifications/{id}/',
            'unread': '/api/v1/notifications/unread/',
            'unread_count': '/api/v1/notifications/unread-count/',
            'mark_all_read': '/api/v1/notifications/mark-all-as-read/',
        }
    }

def print_urls():
    """طباعة جميع URLs بشكل منظم"""
    urls = get_all_urls()
    
    print("🔗 جميع URLs المتاحة في PlumbingConnect API:")
    print("=" * 60)
    
    for category, endpoints in urls.items():
        print(f"\n📱 {category.upper()}:")
        for name, url in endpoints.items():
            print(f"  • {name:<20} → {url}")
