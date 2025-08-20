// Notification system types

export type NotificationType =
  | "chat_message"
  | "post_comment"
  | "comment_reply";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  userId: string; // Who should receive this notification
  fromUserId: string; // Who triggered this notification
  fromUserName: string;
  fromUserAvatar?: string;
  relatedEntityId?: string; // Post ID, Chat ID, etc.
  relatedEntityTitle?: string; // Post title, etc.
  isRead: boolean;
  createdAt: string;
  readAt?: string;
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
}

export interface NotificationContextType extends NotificationState {
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  addNotification: (
    notification: Omit<Notification, "id" | "createdAt" | "isRead">,
  ) => void;
  removeNotification: (notificationId: string) => void;
  clearOldNotifications: (daysOld?: number) => void;
}

// Notification display configuration
export const NOTIFICATION_CONFIG = {
  TYPES: {
    chat_message: {
      icon: "MessageCircle",
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      title: "رسالة جديدة",
    },
    post_comment: {
      icon: "MessageSquare",
      color: "text-green-500",
      bgColor: "bg-green-50",
      title: "تعليق جديد",
    },
    comment_reply: {
      icon: "Reply",
      color: "text-orange-500",
      bgColor: "bg-orange-50",
      title: "رد جديد",
    },
  },
  MAX_NOTIFICATIONS: 50,
  AUTO_CLEANUP_DAYS: 30,
} as const;
