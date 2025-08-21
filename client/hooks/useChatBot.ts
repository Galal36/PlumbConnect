import { useState, useCallback } from 'react';
import { chatbotApiService, ChatBotMessage, ChatBotSendResponse } from '@/services/chatbotApi';
import { toast } from 'sonner';

interface UseChatBotReturn {
  messages: ChatBotMessage[];
  isLoading: boolean;
  sessionId: string | null;
  isInitialized: boolean;
  sendMessage: (content: string) => Promise<void>;
  initializeChat: () => Promise<void>;
  clearChat: () => void;
  endConversation: () => Promise<void>;
}

export function useChatBot(): UseChatBotReturn {
  const [messages, setMessages] = useState<ChatBotMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const initializeChat = useCallback(async () => {
    if (isInitialized) return;

    try {
      setIsLoading(true);
      const response = await chatbotApiService.createNewConversation();
      setSessionId(response.session_id);
      setMessages(response.conversation.messages);
      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize chatbot:', error);
      toast.error('فشل في تهيئة المساعد الذكي');
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    setIsLoading(true);

    try {
      const response: ChatBotSendResponse = await chatbotApiService.sendMessage({
        content: content.trim(),
        session_id: sessionId || undefined,
      });

      // Update session ID if it's a new conversation
      if (!sessionId) {
        setSessionId(response.session_id);
      }

      // Add both user message and bot response to the messages
      setMessages(prev => [...prev, response.user_message, response.bot_response]);

    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('فشل في إرسال الرسالة');
      
      // Add user message even if bot response failed
      const tempUserMessage: ChatBotMessage = {
        id: Date.now(),
        message_type: 'user',
        content: content.trim(),
        tokens_used: 0,
        response_time: 0,
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, tempUserMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, sessionId]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setSessionId(null);
    setIsInitialized(false);
  }, []);

  const endConversation = useCallback(async () => {
    if (!sessionId) return;

    try {
      // Find the conversation ID (we need to get it from the backend)
      const conversations = await chatbotApiService.getConversations(true);
      const currentConversation = conversations.find(conv => conv.session_id === sessionId);
      
      if (currentConversation) {
        await chatbotApiService.endConversation(currentConversation.id);
        toast.success('تم إنهاء المحادثة بنجاح');
      }
      
      clearChat();
    } catch (error) {
      console.error('Failed to end conversation:', error);
      toast.error('فشل في إنهاء المحادثة');
    }
  }, [sessionId, clearChat]);

  return {
    messages,
    isLoading,
    sessionId,
    isInitialized,
    sendMessage,
    initializeChat,
    clearChat,
    endConversation,
  };
}
