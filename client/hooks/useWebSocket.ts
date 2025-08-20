import { useEffect, useRef, useState } from 'react';
import { Message } from '@/services/chatApi';

interface UseWebSocketProps {
  chatId: number | null;
  onMessageReceived: (message: Message) => void;
  token: string | null;
}

export const useWebSocket = ({ chatId, onMessageReceived, token }: UseWebSocketProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = () => {
    if (!chatId || !token) return;

    try {
      // Close existing connection
      if (wsRef.current) {
        wsRef.current.close();
      }

      // Create WebSocket URL with authentication token as query parameter
      const wsUrl = `ws://localhost:8001/ws/chat/${chatId}/?token=${encodeURIComponent(token)}`;

      // Create new WebSocket connection
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected to chat:', chatId);
        setIsConnected(true);
        setConnectionError(null);
        reconnectAttempts.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.message) {
            onMessageReceived(data.message);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        
        // Attempt to reconnect if not a normal closure
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          console.log(`Attempting to reconnect in ${delay}ms...`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connect();
          }, delay);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionError('فشل في الاتصال بالخادم');
      };

    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      setConnectionError('فشل في إنشاء الاتصال');
    }
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'Component unmounting');
      wsRef.current = null;
    }
    
    setIsConnected(false);
    setConnectionError(null);
    reconnectAttempts.current = 0;
  };

  const sendMessage = (content: string, messageType: string = 'text') => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        content,
        message_type: messageType
      }));
      return true;
    }
    return false;
  };

  // Connect when chatId or token changes
  useEffect(() => {
    if (chatId && token) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [chatId, token]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  return {
    isConnected,
    connectionError,
    sendMessage,
    connect,
    disconnect
  };
};
