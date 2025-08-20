// Chat API Service for Real-time Chat Functionality
import { formatError } from "@/utils";

const API_BASE_URL = 'http://localhost:8001/api';

// Types for Chat API
export interface Chat {
  id: number;
  sender: {
    id: number;
    name: string;
    email: string;
    role: string;
    image?: string;
  };
  receiver: {
    id: number;
    name: string;
    email: string;
    role: string;
    image?: string;
  };
  created_at: string;
  updated_at: string;
  is_active: boolean;
  is_archived: boolean;
  last_message?: string;
  unread_count: number;
}

export interface Message {
  id: number;
  chat: number;
  sender: {
    id: number;
    name: string;
    email: string;
    role: string;
    image?: string;
  };
  content: string;
  message_type: 'text' | 'image' | 'file' | 'link' | 'system';
  image?: string;
  file?: string;
  is_read: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateChatRequest {
  receiver_id: number;
}

export interface SendMessageRequest {
  chat_id: number;
  content: string;
  message_type?: 'text' | 'image' | 'file' | 'link';
  image?: File;
  file?: File;
}

export interface ApiError {
  message: string;
  status?: number;
}

// Helper function to handle API responses
async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.detail || errorData.message || `HTTP ${response.status}: ${response.statusText}`;
    throw new Error(errorMessage);
  }
  return response.json();
}

// Helper function to get auth headers
function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
}

// Helper function to get auth headers for form data
function getAuthHeadersFormData(): HeadersInit {
  const token = localStorage.getItem('access_token');
  return {
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
}

class ChatApiService {
  private baseUrl = API_BASE_URL;

  // Helper method to make authenticated requests
  private async makeAuthenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
    const token = localStorage.getItem('access_token');

    if (!token) {
      throw new Error('Authentication required. Please login first.');
    }

    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    };

    const response = await fetch(url, { ...options, headers });

    if (response.status === 401) {
      // Token might be expired, redirect to login
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_data');
      window.location.href = '/login';
      throw new Error('Session expired. Please login again.');
    }

    return response;
  }

  // Get all chats for the current user
  async getChats(): Promise<Chat[]> {
    try {
      const response = await this.makeAuthenticatedRequest(`${this.baseUrl}/chats/`);
      const data = await handleApiResponse<{ results: Chat[] }>(response);
      return data.results || [];
    } catch (error) {
      console.error('Failed to fetch chats:', error);
      throw new Error(formatError(error));
    }
  }

  // Get or create a chat with a specific user
  async getOrCreateChat(receiverId: number): Promise<Chat> {
    try {
      const response = await this.makeAuthenticatedRequest(`${this.baseUrl}/chats/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ receiver_id: receiverId }),
      });
      return await handleApiResponse<Chat>(response);
    } catch (error) {
      console.error('Failed to create/get chat:', error);
      throw new Error(formatError(error));
    }
  }

  // Get a specific chat by ID
  async getChat(chatId: number): Promise<Chat> {
    try {
      const response = await this.makeAuthenticatedRequest(`${this.baseUrl}/chats/${chatId}/`);
      return await handleApiResponse<Chat>(response);
    } catch (error) {
      console.error('Failed to fetch chat:', error);
      throw new Error(formatError(error));
    }
  }

  // Get messages for a specific chat
  async getChatMessages(chatId: number): Promise<Message[]> {
    try {
      const response = await this.makeAuthenticatedRequest(`${this.baseUrl}/chat-messages/?chat=${chatId}`);
      const data = await handleApiResponse<{ results: Message[] }>(response);
      return data.results || [];
    } catch (error) {
      console.error('Failed to fetch chat messages:', error);
      throw new Error(formatError(error));
    }
  }

  // Send a text message
  async sendMessage(chatId: number, content: string): Promise<Message> {
    try {
      const response = await this.makeAuthenticatedRequest(`${this.baseUrl}/chat-messages/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat: chatId,
          content: content,
          message_type: 'text',
        }),
      });
      return await handleApiResponse<Message>(response);
    } catch (error) {
      console.error('Failed to send message:', error);
      throw new Error(formatError(error));
    }
  }

  // Send a message with file/image
  async sendMessageWithFile(chatId: number, content: string, file: File, messageType: 'image' | 'file'): Promise<Message> {
    try {
      const formData = new FormData();
      formData.append('chat', chatId.toString());
      formData.append('content', content);
      formData.append('message_type', messageType);
      formData.append(messageType, file);

      const response = await fetch(`${this.baseUrl}/chat-messages/`, {
        method: 'POST',
        headers: getAuthHeadersFormData(),
        body: formData,
      });
      return await handleApiResponse<Message>(response);
    } catch (error) {
      console.error('Failed to send message with file:', error);
      throw new Error(formatError(error));
    }
  }

  // Mark messages as read
  async markMessagesAsRead(chatId: number): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/chat-messages/mark_read/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ chat_id: chatId }),
      });
      await handleApiResponse<{ message: string }>(response);
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
      throw new Error(formatError(error));
    }
  }

  // Delete a message
  async deleteMessage(messageId: number): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/chat-messages/${messageId}/`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error(`Failed to delete message: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to delete message:', error);
      throw new Error(formatError(error));
    }
  }

  // Archive a chat
  async archiveChat(chatId: number): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/chats/${chatId}/archive/`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      await handleApiResponse<{ message: string }>(response);
    } catch (error) {
      console.error('Failed to archive chat:', error);
      throw new Error(formatError(error));
    }
  }
}

// Export singleton instance
export const chatApiService = new ChatApiService();
export default chatApiService;
