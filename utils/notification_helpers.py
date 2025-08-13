from notifications.models import Notification
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.contrib.contenttypes.models import ContentType
from .url_helpers import get_full_api_url

# استيراد النماذج ذات الصلة لتطبيق isinstance
from chats.models import Chat
from chat_messages.models import Message # تم إلغاء التعليق
from complaints.models import Complaint # تم إلغاء التعليق


def create_notification(user, title, content, notification_type='system', action_url=None, related_object=None, is_important=False, request=None):
    """Helper function to create notifications"""
    content_type = None
    object_id = None
    if related_object:
        content_type = ContentType.objects.get_for_model(related_object)
        object_id = related_object.id

    if action_url is None and related_object and request:
        # توليد action_url بناءً على نوع الكائن باستخدام isinstance
        if isinstance(related_object, Notification):
            action_url = get_full_api_url(request, 'notifications:notification-detail', pk=related_object.id)
        elif isinstance(related_object, Message): # تم تفعيل هذا الشرط
            action_url = get_full_api_url(request, 'chat_messages:message-detail', pk=related_object.id)
        elif isinstance(related_object, Complaint): # تم تفعيل هذا الشرط
            action_url = get_full_api_url(request, 'complaints:complaint-detail', pk=related_object.id)
        elif isinstance(related_object, Chat):
            action_url = get_full_api_url(request, 'chats:chat-detail', pk=related_object.id)

    notification = Notification.objects.create(
        user=user,
        title=title,
        content=content,
        notification_type=notification_type,
        action_url=action_url,
        content_type=content_type,
        object_id=object_id,
        is_important=is_important
    )

    # إرسال إشعار عبر WebSocket
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f'user_{user.id}',
        {
            'type': 'notification_message',
            'message': {
                'id': notification.id,
                'title': notification.title,
                'content': notification.content,
                'notification_type': notification.notification_type,
                'is_read': notification.is_read,
                'is_important': notification.is_important,
                'created_at': notification.created_at.isoformat(),
                'action_url': notification.action_url,
            }
        }
    )
    return notification

def notify_new_message(receiver, sender, message, request=None):
    """Create notification for new message"""
    return create_notification(
        user=receiver,
        title='رسالة جديدة',
        content=f'لديك رسالة جديدة من {sender.name}',
        notification_type='new_message',
        related_object=message,
        is_important=False,
        request=request
    )

def notify_new_chat(user, chat, request=None):
    """Create notification for new chat"""
    return create_notification(
        user=user,
        title='محادثة جديدة',
        content=f'تم إنشاء محادثة جديدة مع {chat.sender.name if user != chat.sender else chat.receiver.name}',
        notification_type='new_chat',
        related_object=chat,
        is_important=True,
        request=request
    )

def notify_complaint_status_change(complaint, user=None, request=None):
    """Create notification for complaint status change"""
    if user is None:
        user = complaint.from_user
        content = f'تم تحديث حالة شكواك إلى: {complaint.get_status_display()}'
    else:
        content = f'تم تحديث حالة الشكوى المقدمة ضدك إلى: {complaint.get_status_display()}'

    return create_notification(
        user=user,
        title='تحديث الشكوى',
        content=content,
        notification_type='complaint_status',
        related_object=complaint,
        is_important=True,
        request=request
    )

def notify_new_complaint(complaint, request=None):
    """Create notification for new complaint"""
    return create_notification(
        user=complaint.to_user,
        title='شكوى جديدة',
        content=f'تم تقديم شكوى ضدك من قبل {complaint.from_user.name}',
        notification_type='complaint_status',
        related_object=complaint,
        is_important=True,
        request=request
    )
