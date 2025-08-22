import { memo } from "react";
import { Link } from "react-router-dom";
import { MessageCircle, MessageSquare, Reply, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatTimeAgo, getAvatarInitials } from "@/utils";
import { ROUTES } from "@/constants";
import { useNotificationContext } from "@/contexts/NotificationContext";
import { cn } from "@/lib/utils";
import type { Notification } from "@/types/notifications";

interface NotificationItemProps {
  notification: Notification;
  onClose?: () => void;
}

const NotificationItem = memo(function NotificationItem({
  notification,
  onClose,
}: NotificationItemProps) {
  const { markAsRead, removeNotification } = useNotificationContext();

  // Get icon based on notification type
  const getIcon = () => {
    switch (notification.notification_type) {
      case "new_message":
        return <MessageCircle className="h-4 w-4" />;
      case "new_chat":
        return <MessageSquare className="h-4 w-4" />;
      case "complaint_status":
        return <Reply className="h-4 w-4" />;
      case "system":
        return <MessageSquare className="h-4 w-4" />;
      case "reminder":
        return <MessageCircle className="h-4 w-4" />;
      default:
        return <MessageCircle className="h-4 w-4" />;
    }
  };

  // Get notification link
  const getNotificationLink = (): string => {
    if (notification.action_url) {
      return notification.action_url;
    }

    switch (notification.notification_type) {
      case "new_message":
      case "new_chat":
        return ROUTES.CHAT;
      case "complaint_status":
        return "/complaints";
      default:
        return ROUTES.HOME;
    }
  };

  // Get notification color
  const getNotificationColor = () => {
    switch (notification.notification_type) {
      case "new_message":
        return "text-blue-500";
      case "new_chat":
        return "text-green-500";
      case "complaint_status":
        return "text-orange-500";
      case "system":
        return "text-gray-500";
      case "reminder":
        return "text-purple-500";
      default:
        return "text-gray-500";
    }
  };

  // Handle notification click
  const handleClick = () => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    if (onClose) {
      onClose();
    }
  };

  // Handle remove notification
  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    removeNotification(notification.id);
  };

  return (
    <Link
      to={getNotificationLink()}
      onClick={handleClick}
      className={cn(
        "block p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors",
        !notification.is_read && "bg-blue-50/50",
      )}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 mt-1">
          <span className={cn("flex-shrink-0", getNotificationColor())}>
            {getIcon()}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-gray-900">
                {notification.title}
              </span>
              {notification.is_important && (
                <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                  مهم
                </span>
              )}
              {!notification.is_read && (
                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
              )}
            </div>

            {/* Remove button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-gray-200 flex-shrink-0"
              aria-label="حذف الإشعار"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>

          {/* Message */}
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
            {notification.content}
          </p>

          {/* Notification type */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {notification.notification_type === 'new_message' && 'رسالة جديدة'}
              {notification.notification_type === 'new_chat' && 'محادثة جديدة'}
              {notification.notification_type === 'complaint_status' && 'تحديث الشكوى'}
              {notification.notification_type === 'system' && 'إشعار النظام'}
              {notification.notification_type === 'reminder' && 'تذكير'}
            </span>

            {/* Timestamp */}
            <p className="text-xs text-gray-400">
              {formatTimeAgo(notification.created_at)}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
});

export default NotificationItem;
