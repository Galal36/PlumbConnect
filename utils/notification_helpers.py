from notifications.models import Notification
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.contrib.contenttypes.models import ContentType
from django.conf import settings


def create_notification(user, title, content, notification_type='system', action_url=None, related_object=None, is_important=False, request=None):
    """Helper function to create notifications"""
    content_type = None
    object_id = None
    if related_object:
        content_type = ContentType.objects.get_for_model(related_object)
        object_id = related_object.id

    if action_url is None and related_object and request:
        base_url = getattr(settings, 'FRONTEND_URL', request.build_absolute_uri('/'))
        
        # توليد action_url بناءً على نوع الكائن
        from chats.models import Chat
        from chat_messages.models import Message
        from complaints.models import Complaint
        
        if isinstance(related_object, Notification):
            action_url = f"{base_url}/notifications/{related_object.id}/"
        elif isinstance(related_object, Message):
            action_url = f"{base_url}/chats/{related_object.chat.id}/"
        elif isinstance(related_object, Complaint):
            action_url = f"{base_url}/complaints/{related_object.id}/"
        elif isinstance(related_object, Chat):
            action_url = f"{base_url}/chats/{related_object.id}/"

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

    # إرسال إشعار عبر WebSocket (معطل مؤقتاً)
    # channel_layer = get_channel_layer()
    # if channel_layer:
    #     try:
    #         async_to_sync(channel_layer.group_send)(
    #             f'user_{user.id}',
    #             {
    #                 'type': 'notification_message',
    #                 'message': {
    #                     'id': notification.id,
    #                     'title': notification.title,
    #                     'content': notification.content,
    #                     'notification_type': notification.notification_type,
    #                     'is_read': notification.is_read,
    #                     'is_important': notification.is_important,
    #                     'created_at': notification.created_at.isoformat(),
    #                     'action_url': notification.action_url,
    #                 }
    #             }
    #         )
    #     except Exception as e:
    #         print(f"WebSocket notification failed: {e}")
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
