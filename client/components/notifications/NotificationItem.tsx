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
    switch (notification.type) {
      case "chat_message":
        return <MessageCircle className="h-4 w-4" />;
      case "post_comment":
        return <MessageSquare className="h-4 w-4" />;
      case "comment_reply":
        return <Reply className="h-4 w-4" />;
      default:
        return <MessageCircle className="h-4 w-4" />;
    }
  };

  // Get notification link
  const getNotificationLink = (): string => {
    switch (notification.type) {
      case "chat_message":
        return notification.relatedEntityId
          ? ROUTES.CHAT_WITH_USER(notification.relatedEntityId)
          : ROUTES.CHAT;
      case "post_comment":
      case "comment_reply":
        return notification.relatedEntityId
          ? `/posts/${notification.relatedEntityId}`
          : ROUTES.POSTS;
      default:
        return ROUTES.HOME;
    }
  };

  // Get notification color
  const getNotificationColor = () => {
    switch (notification.type) {
      case "chat_message":
        return "text-blue-500";
      case "post_comment":
        return "text-green-500";
      case "comment_reply":
        return "text-orange-500";
      default:
        return "text-gray-500";
    }
  };

  // Handle notification click
  const handleClick = () => {
    if (!notification.isRead) {
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
        !notification.isRead && "bg-blue-50/50",
      )}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={notification.fromUserAvatar} />
          <AvatarFallback className="text-xs">
            {getAvatarInitials(notification.fromUserName)}
          </AvatarFallback>
        </Avatar>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 mb-1">
              <span className={cn("flex-shrink-0", getNotificationColor())}>
                {getIcon()}
              </span>
              <span className="text-sm font-medium text-gray-900">
                {notification.title}
              </span>
              {!notification.isRead && (
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
            {notification.message}
          </p>

          {/* Related entity title (if any) */}
          {notification.relatedEntityTitle && (
            <p className="text-xs text-gray-500 italic mb-1 truncate">
              {notification.relatedEntityTitle}
            </p>
          )}

          {/* Timestamp */}
          <p className="text-xs text-gray-400">
            {formatTimeAgo(notification.createdAt)}
          </p>
        </div>
      </div>
    </Link>
  );
});

export default NotificationItem;
