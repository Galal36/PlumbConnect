import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useAuthContext } from "./AuthContext";
import { formatError } from "@/utils";
import type {
  Notification,
  NotificationState,
  NotificationContextType,
  NotificationType,
} from "@/types/notifications";
import notificationsApi from "@/services/notificationsApi";

// Action types for the notification reducer
type NotificationAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_NOTIFICATIONS"; payload: Notification[] }
  | { type: "ADD_NOTIFICATION"; payload: Notification }
  | { type: "MARK_AS_READ"; payload: number }
  | { type: "MARK_ALL_AS_READ" }
  | { type: "REMOVE_NOTIFICATION"; payload: number }
  | { type: "CLEAR_OLD_NOTIFICATIONS"; payload: number };

// Initial state
const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
};

// Notification reducer
function notificationReducer(
  state: NotificationState,
  action: NotificationAction,
): NotificationState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };

    case "SET_ERROR":
      return { ...state, error: action.payload, isLoading: false };

    case "SET_NOTIFICATIONS": {
      const notifications = action.payload;
      const unreadCount = notifications.filter((n) => !n.is_read).length;
      return {
        ...state,
        notifications,
        unreadCount,
        isLoading: false,
        error: null,
      };
    }

    case "ADD_NOTIFICATION": {
      const newNotification = action.payload;
      const notifications = [newNotification, ...state.notifications];
      const unreadCount = notifications.filter((n) => !n.is_read).length;
      return { ...state, notifications, unreadCount };
    }

    case "MARK_AS_READ": {
      const notifications = state.notifications.map((notification) =>
        notification.id === action.payload
          ? { ...notification, is_read: true, read_at: new Date().toISOString() }
          : notification,
      );
      const unreadCount = notifications.filter((n) => !n.is_read).length;
      return { ...state, notifications, unreadCount };
    }

    case "MARK_ALL_AS_READ": {
      const notifications = state.notifications.map((notification) => ({
        ...notification,
        is_read: true,
        read_at: notification.read_at || new Date().toISOString(),
      }));
      return { ...state, notifications, unreadCount: 0 };
    }

    case "REMOVE_NOTIFICATION": {
      const notifications = state.notifications.filter(
        (n) => n.id !== action.payload,
      );
      const unreadCount = notifications.filter((n) => !n.is_read).length;
      return { ...state, notifications, unreadCount };
    }

    case "CLEAR_OLD_NOTIFICATIONS": {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - action.payload);
      const notifications = state.notifications.filter(
        (n) => new Date(n.created_at) >= cutoffDate,
      );
      const unreadCount = notifications.filter((n) => !n.is_read).length;
      return { ...state, notifications, unreadCount };
    }

    default:
      return state;
  }
}

// Create the context
const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

// Provider component
interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  // Get auth context - but handle gracefully if not available
  const { user, isAuthenticated } = useAuthContext();

  // Load notifications for the current user
  const loadNotifications = useCallback(async () => {
    if (!isAuthenticated || !user) {
      dispatch({ type: "SET_NOTIFICATIONS", payload: [] });
      return;
    }

    try {
      dispatch({ type: "SET_LOADING", payload: true });

      const notifications = await notificationsApi.getNotifications();
      dispatch({ type: "SET_NOTIFICATIONS", payload: notifications });
    } catch (error) {
      console.error('Failed to load notifications:', error);
      dispatch({ type: "SET_ERROR", payload: formatError(error) });
    }
  }, [isAuthenticated, user]);

  // Load notifications when user changes
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: number) => {
    try {
      await notificationsApi.markAsRead(notificationId);
      dispatch({ type: "MARK_AS_READ", payload: notificationId });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      dispatch({ type: "SET_ERROR", payload: formatError(error) });
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationsApi.markAllAsRead();
      dispatch({ type: "MARK_ALL_AS_READ" });
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      dispatch({ type: "SET_ERROR", payload: formatError(error) });
    }
  }, []);

  // Add new notification (for real-time updates)
  const addNotification = useCallback(
    (notificationData: Omit<Notification, "id" | "created_at" | "is_read">) => {
      const newNotification: Notification = {
        ...notificationData,
        id: Date.now(), // Temporary ID for local notifications
        created_at: new Date().toISOString(),
        is_read: false,
      };

      dispatch({ type: "ADD_NOTIFICATION", payload: newNotification });
    },
    [],
  );

  // Remove notification
  const removeNotification = useCallback(async (notificationId: number) => {
    try {
      await notificationsApi.deleteNotification(notificationId);
      dispatch({ type: "REMOVE_NOTIFICATION", payload: notificationId });
    } catch (error) {
      console.error('Failed to remove notification:', error);
      dispatch({ type: "SET_ERROR", payload: formatError(error) });
    }
  }, []);

  // Clear old notifications
  const clearOldNotifications = useCallback((daysOld: number = 30) => {
    dispatch({ type: "CLEAR_OLD_NOTIFICATIONS", payload: daysOld });
  }, []);

  // Refresh notifications from API
  const refreshNotifications = useCallback(() => {
    loadNotifications();
  }, [loadNotifications]);

  const contextValue: NotificationContextType = {
    ...state,
    markAsRead,
    markAllAsRead,
    addNotification,
    removeNotification,
    clearOldNotifications,
    refreshNotifications,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
}

// Hook to use notification context
export function useNotificationContext() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotificationContext must be used within a NotificationProvider",
    );
  }
  return context;
}
