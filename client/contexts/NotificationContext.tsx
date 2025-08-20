import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useAuthContext } from "./AuthContext";
import { AuthContext } from "./AuthContext";
import { generateId, formatError } from "@/utils";
import type {
  Notification,
  NotificationState,
  NotificationContextType,
  NotificationType,
} from "@/types/notifications";
import mockNotifications from "@/data/mockNotifications.json";

// Action types for the notification reducer
type NotificationAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_NOTIFICATIONS"; payload: Notification[] }
  | { type: "ADD_NOTIFICATION"; payload: Notification }
  | { type: "MARK_AS_READ"; payload: string }
  | { type: "MARK_ALL_AS_READ" }
  | { type: "REMOVE_NOTIFICATION"; payload: string }
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
      const unreadCount = notifications.filter((n) => !n.isRead).length;
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
      const unreadCount = notifications.filter((n) => !n.isRead).length;
      return { ...state, notifications, unreadCount };
    }

    case "MARK_AS_READ": {
      const notifications = state.notifications.map((notification) =>
        notification.id === action.payload
          ? { ...notification, isRead: true, readAt: new Date().toISOString() }
          : notification,
      );
      const unreadCount = notifications.filter((n) => !n.isRead).length;
      return { ...state, notifications, unreadCount };
    }

    case "MARK_ALL_AS_READ": {
      const notifications = state.notifications.map((notification) => ({
        ...notification,
        isRead: true,
        readAt: notification.readAt || new Date().toISOString(),
      }));
      return { ...state, notifications, unreadCount: 0 };
    }

    case "REMOVE_NOTIFICATION": {
      const notifications = state.notifications.filter(
        (n) => n.id !== action.payload,
      );
      const unreadCount = notifications.filter((n) => !n.isRead).length;
      return { ...state, notifications, unreadCount };
    }

    case "CLEAR_OLD_NOTIFICATIONS": {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - action.payload);
      const notifications = state.notifications.filter(
        (n) => new Date(n.createdAt) >= cutoffDate,
      );
      const unreadCount = notifications.filter((n) => !n.isRead).length;
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
  const authContext = useContext(AuthContext);
  const user = authContext?.user || null;
  const isAuthenticated = authContext?.isAuthenticated || false;

  // Load notifications for the current user
  const loadNotifications = useCallback(async () => {
    if (!isAuthenticated || !user) {
      dispatch({ type: "SET_NOTIFICATIONS", payload: [] });
      return;
    }

    try {
      dispatch({ type: "SET_LOADING", payload: true });

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Filter mock notifications for current user and cast to proper types
      const userNotifications: Notification[] = mockNotifications.notifications
        .filter((notification) => notification.userId === user.id)
        .map((notification) => ({
          ...notification,
          type: notification.type as NotificationType,
        }));

      dispatch({ type: "SET_NOTIFICATIONS", payload: userNotifications });
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: formatError(error) });
    }
  }, [isAuthenticated, user]);

  // Load notifications when user changes
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Mark notification as read
  const markAsRead = useCallback((notificationId: string) => {
    dispatch({ type: "MARK_AS_READ", payload: notificationId });

    // TODO: In real app, make API call to mark as read
    // await notificationApi.markAsRead(notificationId);
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    dispatch({ type: "MARK_ALL_AS_READ" });

    // TODO: In real app, make API call to mark all as read
    // await notificationApi.markAllAsRead();
  }, []);

  // Add new notification (for real-time updates)
  const addNotification = useCallback(
    (notificationData: Omit<Notification, "id" | "createdAt" | "isRead">) => {
      const newNotification: Notification = {
        ...notificationData,
        id: generateId(),
        createdAt: new Date().toISOString(),
        isRead: false,
      };

      dispatch({ type: "ADD_NOTIFICATION", payload: newNotification });
    },
    [],
  );

  // Remove notification
  const removeNotification = useCallback((notificationId: string) => {
    dispatch({ type: "REMOVE_NOTIFICATION", payload: notificationId });

    // TODO: In real app, make API call to remove notification
    // await notificationApi.removeNotification(notificationId);
  }, []);

  // Clear old notifications
  const clearOldNotifications = useCallback((daysOld: number = 30) => {
    dispatch({ type: "CLEAR_OLD_NOTIFICATIONS", payload: daysOld });

    // TODO: In real app, make API call to clear old notifications
    // await notificationApi.clearOldNotifications(daysOld);
  }, []);

  const contextValue: NotificationContextType = {
    ...state,
    markAsRead,
    markAllAsRead,
    addNotification,
    removeNotification,
    clearOldNotifications,
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
