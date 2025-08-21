// Chatbot API Service
const API_BASE_URL = 'http://localhost:8001/api/chatbot';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
};

// TypeScript interfaces
export interface ChatBotMessage {
  id: number;
  message_type: 'user' | 'bot' | 'system';
  content: string;
  ai_model?: string;
  tokens_used: number;
  response_time: number;
  created_at: string;
}

export interface ChatBotConversation {
  id: number;
  session_id: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  messages: ChatBotMessage[];
  message_count: number;
}

export interface ChatBotMessageCreate {
  content: string;
  session_id?: string;
  ai_model?: string;
}

export interface ChatBotSendResponse {
  session_id: string;
  user_message: ChatBotMessage;
  bot_response: ChatBotMessage;
  success: boolean;
}

export interface ChatBotStats {
  total_conversations: number;
  active_conversations: number;
  total_messages: number;
  user_messages: number;
  bot_responses: number;
  total_tokens_used: number;
  average_response_time: number;
}

export interface NewConversationResponse {
  session_id: string;
  conversation: ChatBotConversation;
}

class ChatBotApiService {
  // Get all conversations for the current user
  async getConversations(isActive?: boolean): Promise<ChatBotConversation[]> {
    const queryParams = new URLSearchParams();
    if (isActive !== undefined) {
      queryParams.append('is_active', isActive.toString());
    }
    
    const url = queryParams.toString() ? `${API_BASE_URL}/conversations/?${queryParams}` : `${API_BASE_URL}/conversations/`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return data.results || data;
  }

  // Get a specific conversation by ID
  async getConversation(id: number): Promise<ChatBotConversation> {
    const response = await fetch(`${API_BASE_URL}/conversations/${id}/`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    return handleResponse(response);
  }

  // Create a new conversation
  async createNewConversation(): Promise<NewConversationResponse> {
    const response = await fetch(`${API_BASE_URL}/conversations/new/`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    
    return handleResponse(response);
  }

  // Send a message to the chatbot
  async sendMessage(messageData: ChatBotMessageCreate): Promise<ChatBotSendResponse> {
    const response = await fetch(`${API_BASE_URL}/send/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(messageData),
    });
    
    return handleResponse(response);
  }

  // End a conversation
  async endConversation(id: number): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/conversations/${id}/end/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    
    return handleResponse(response);
  }

  // Get chatbot statistics
  async getStats(): Promise<ChatBotStats> {
    const response = await fetch(`${API_BASE_URL}/stats/`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    return handleResponse(response);
  }
}

export const chatbotApiService = new ChatBotApiService();
