const API_BASE_URL = 'http://localhost:8001/api';

export interface Notification {
  id: number;
  title: string;
  content: string;
  notification_type: 'new_message' | 'new_chat' | 'complaint_status' | 'system' | 'reminder';
  is_read: boolean;
  is_important: boolean;
  action_url?: string;
  created_at: string;
  read_at?: string;
}

export interface NotificationStats {
  total_notifications: number;
  unread_notifications: number;
  important_notifications: number;
  notifications_by_type: {
    [key: string]: number;
  };
}

class NotificationsApiService {
  private getAuthHeaders() {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  // Get all notifications for the current user
  async getNotifications(params?: {
    is_read?: boolean;
    notification_type?: string;
    is_important?: boolean;
  }): Promise<Notification[]> {
    const queryParams = new URLSearchParams();
    
    if (params?.is_read !== undefined) {
      queryParams.append('is_read', params.is_read.toString());
    }
    if (params?.notification_type) {
      queryParams.append('notification_type', params.notification_type);
    }
    if (params?.is_important !== undefined) {
      queryParams.append('is_important', params.is_important.toString());
    }

    const url = `${API_BASE_URL}/notifications/${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch notifications');
    }

    const data = await response.json();
    return data.results || data;
  }

  // Get a specific notification by ID
  async getNotification(id: number): Promise<Notification> {
    const response = await fetch(`${API_BASE_URL}/notifications/${id}/`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch notification');
    }

    return response.json();
  }

  // Mark a notification as read
  async markAsRead(id: number): Promise<Notification> {
    const response = await fetch(`${API_BASE_URL}/notifications/${id}/`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ is_read: true }),
    });

    if (!response.ok) {
      throw new Error('Failed to mark notification as read');
    }

    return response.json();
  }

  // Mark all notifications as read
  async markAllAsRead(): Promise<{ message: string; updated_count: number }> {
    const response = await fetch(`${API_BASE_URL}/notifications/mark-all-read/`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to mark all notifications as read');
    }

    return response.json();
  }

  // Delete a notification
  async deleteNotification(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/notifications/${id}/`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to delete notification');
    }
  }

  // Get notification statistics
  async getNotificationStats(): Promise<NotificationStats> {
    const response = await fetch(`${API_BASE_URL}/notifications/stats/`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch notification stats');
    }

    return response.json();
  }

  // Get unread notifications count
  async getUnreadCount(): Promise<number> {
    const stats = await this.getNotificationStats();
    return stats.unread_notifications;
  }

  // Get notification type display name in Arabic
  getNotificationTypeDisplayName(type: string): string {
    const typeNames: { [key: string]: string } = {
      'new_message': 'رسالة جديدة',
      'new_chat': 'محادثة جديدة',
      'complaint_status': 'تحديث الشكوى',
      'system': 'إشعار النظام',
      'reminder': 'تذكير',
    };
    return typeNames[type] || type;
  }

  // Get notification type icon
  getNotificationTypeIcon(type: string): string {
    const typeIcons: { [key: string]: string } = {
      'new_message': '💬',
      'new_chat': '💭',
      'complaint_status': '📋',
      'system': '⚙️',
      'reminder': '⏰',
    };
    return typeIcons[type] || '📢';
  }
}

export default new NotificationsApiService();
