// Notification system types

export type NotificationType =
  | "new_message"
  | "new_chat"
  | "complaint_status"
  | "system"
  | "reminder";

export interface Notification {
  id: number;
  title: string;
  content: string;
  notification_type: NotificationType;
  is_read: boolean;
  is_important: boolean;
  action_url?: string;
  created_at: string;
  read_at?: string;
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
}

export interface NotificationContextType extends NotificationState {
  markAsRead: (notificationId: number) => void;
  markAllAsRead: () => void;
  addNotification: (
    notification: Omit<Notification, "id" | "created_at" | "is_read">,
  ) => void;
  removeNotification: (notificationId: number) => void;
  clearOldNotifications: (daysOld?: number) => void;
  refreshNotifications: () => void;
}

// Notification display configuration
export const NOTIFICATION_CONFIG = {
  TYPES: {
    new_message: {
      icon: "MessageCircle",
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      title: "رسالة جديدة",
    },
    new_chat: {
      icon: "MessageSquare",
      color: "text-green-500",
      bgColor: "bg-green-50",
      title: "محادثة جديدة",
    },
    complaint_status: {
      icon: "FileText",
      color: "text-orange-500",
      bgColor: "bg-orange-50",
      title: "تحديث الشكوى",
    },
    system: {
      icon: "Settings",
      color: "text-gray-500",
      bgColor: "bg-gray-50",
      title: "إشعار النظام",
    },
    reminder: {
      icon: "Clock",
      color: "text-purple-500",
      bgColor: "bg-purple-50",
      title: "تذكير",
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
