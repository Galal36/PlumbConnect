from django.contrib.auth import get_user_model
from .models import Notification

User = get_user_model()

class NotificationService:
    """Service class for creating notifications"""
    
    @staticmethod
    def create_notification(user, title, content, notification_type, is_important=False, action_url=None):
        """Create a single notification"""
        return Notification.objects.create(
            user=user,
            title=title,
            content=content,
            notification_type=notification_type,
            is_important=is_important,
            action_url=action_url
        )
    
    @staticmethod
    def notify_admins(title, content, notification_type, is_important=False, action_url=None):
        """Send notification to all admin users"""
        admins = User.objects.filter(role='admin')
        notifications = []
        
        for admin in admins:
            notification = NotificationService.create_notification(
                user=admin,
                title=title,
                content=content,
                notification_type=notification_type,
                is_important=is_important,
                action_url=action_url
            )
            notifications.append(notification)
        
        return notifications
    
    @staticmethod
    def notify_new_message(sender, receiver, chat_id):
        """Notify when a new message is sent"""
        # Notify the receiver
        receiver_notification = NotificationService.create_notification(
            user=receiver,
            title="رسالة جديدة",
            content=f"لديك رسالة جديدة من {sender.name}",
            notification_type="new_message",
            is_important=False,
            action_url=f"/chat"
        )
        
        # Notify admins
        admin_notifications = NotificationService.notify_admins(
            title="رسالة جديدة في النظام",
            content=f"تم إرسال رسالة جديدة من {sender.name} إلى {receiver.name}",
            notification_type="new_message",
            is_important=False,
            action_url=f"/chat"
        )
        
        return [receiver_notification] + admin_notifications
    
    @staticmethod
    def notify_new_chat(sender, receiver, chat_id):
        """Notify when a new chat is created"""
        # Notify the receiver
        receiver_notification = NotificationService.create_notification(
            user=receiver,
            title="محادثة جديدة",
            content=f"بدأ {sender.name} محادثة جديدة معك",
            notification_type="new_chat",
            is_important=False,
            action_url=f"/chat"
        )
        
        # Notify admins
        admin_notifications = NotificationService.notify_admins(
            title="محادثة جديدة في النظام",
            content=f"تم بدء محادثة جديدة بين {sender.name} و {receiver.name}",
            notification_type="new_chat",
            is_important=False,
            action_url=f"/chat"
        )
        
        return [receiver_notification] + admin_notifications
    
    @staticmethod
    def notify_service_request(client, plumber, service_id):
        """Notify when a service is requested"""
        # Notify the plumber
        plumber_notification = NotificationService.create_notification(
            user=plumber,
            title="طلب خدمة جديد",
            content=f"طلب {client.name} خدمة منك",
            notification_type="system",
            is_important=True,
            action_url=f"/services"
        )
        
        # Notify admins
        admin_notifications = NotificationService.notify_admins(
            title="طلب خدمة جديد في النظام",
            content=f"طلب {client.name} خدمة من {plumber.name}",
            notification_type="system",
            is_important=False,
            action_url=f"/services"
        )
        
        return [plumber_notification] + admin_notifications
    
    @staticmethod
    def notify_service_review(reviewer, plumber, rating, service_id):
        """Notify when a service review is created"""
        # Notify the plumber
        plumber_notification = NotificationService.create_notification(
            user=plumber,
            title="تقييم جديد",
            content=f"قام {reviewer.name} بتقييمك بـ {rating} نجوم",
            notification_type="system",
            is_important=False,
            action_url=f"/services"
        )
        
        # Notify admins
        admin_notifications = NotificationService.notify_admins(
            title="تقييم جديد في النظام",
            content=f"قام {reviewer.name} بتقييم {plumber.name} بـ {rating} نجوم",
            notification_type="system",
            is_important=False,
            action_url=f"/services"
        )
        
        return [plumber_notification] + admin_notifications
    
    @staticmethod
    def notify_post_comment(commenter, post_author, post_id, comment_content):
        """Notify when someone comments on a post"""
        # Notify the post author (if not commenting on their own post)
        notifications = []
        
        if commenter.id != post_author.id:
            author_notification = NotificationService.create_notification(
                user=post_author,
                title="تعليق جديد على منشورك",
                content=f"علق {commenter.name} على منشورك: {comment_content[:50]}...",
                notification_type="system",
                is_important=False,
                action_url=f"/posts"
            )
            notifications.append(author_notification)
        
        # Notify admins
        admin_notifications = NotificationService.notify_admins(
            title="تعليق جديد في النظام",
            content=f"علق {commenter.name} على منشور {post_author.name}",
            notification_type="system",
            is_important=False,
            action_url=f"/posts"
        )
        
        return notifications + admin_notifications
    
    @staticmethod
    def notify_complaint_status_change(complaint, old_status, new_status):
        """Notify when complaint status changes"""
        # Notify the complaint author
        user_notification = NotificationService.create_notification(
            user=complaint.from_user,
            title="تحديث حالة الشكوى",
            content=f"تم تحديث حالة شكواك من {old_status} إلى {new_status}",
            notification_type="complaint_status",
            is_important=True,
            action_url=f"/complaints"
        )

        # Notify admins
        admin_notifications = NotificationService.notify_admins(
            title="تحديث حالة شكوى",
            content=f"تم تحديث حالة شكوى {complaint.from_user.name} إلى {new_status}",
            notification_type="complaint_status",
            is_important=False,
            action_url=f"/complaints"
        )

        return [user_notification] + admin_notifications
    
    @staticmethod
    def notify_new_complaint(complaint):
        """Notify when a new complaint is created"""
        # Notify admins only
        admin_notifications = NotificationService.notify_admins(
            title="شكوى جديدة",
            content=f"تم تقديم شكوى جديدة من {complaint.from_user.name}: {complaint.complaint_type}",
            notification_type="complaint_status",
            is_important=True,
            action_url=f"/complaints"
        )

        return admin_notifications
