from notifications.models import Notification

def create_notification(user, title, content, notification_type='system', action_url=None, related_object_id=None):
    """Helper function to create notifications"""
    return Notification.objects.create(
        user=user,
        title=title,
        content=content,
        notification_type=notification_type,
        action_url=action_url,
        related_object_id=related_object_id
    )

def notify_new_message(receiver, sender, message):
    """Create notification for new message"""
    create_notification(
        user=receiver,
        title='رسالة جديدة',
        content=f'لديك رسالة جديدة من {sender.username}',
        notification_type='message',
        related_object_id=message.id
    )

def notify_complaint_status_change(complaint):
    """Create notification for complaint status change"""
    create_notification(
        user=complaint.from_user,
        title='تحديث الشكوى',
        content=f'تم تحديث حالة شكواك إلى: {complaint.get_status_display()}',
        notification_type='complaint',
        related_object_id=complaint.id
    )

def notify_new_complaint(complaint):
    """Create notification for new complaint"""
    create_notification(
        user=complaint.to_user,
        title='شكوى جديدة',
        content=f'تم تقديم شكوى ضدك من قبل {complaint.from_user.username}',
        notification_type='complaint',
        related_object_id=complaint.id
    )
