import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { chatbotApiService } from "@/services/chatbotApi";
import { useChatBot } from "@/hooks/useChatBot";
import { useAuthContext } from "@/contexts/AuthContext";
import { Bot, MessageCircle, Send, Trash2, BarChart3 } from "lucide-react";
import { toast } from "sonner";

/**
 * ChatBot Test Component
 * This component is for testing and demonstrating the chatbot functionality
 * It can be used during development to test the chatbot integration
 */
export default function ChatBotTest() {
  const { isAuthenticated, user } = useAuthContext();
  const [testMessage, setTestMessage] = useState("");
  const [stats, setStats] = useState<any>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  
  const {
    messages,
    isLoading,
    sessionId,
    isInitialized,
    sendMessage,
    initializeChat,
    clearChat,
    endConversation,
  } = useChatBot();

  // Test API endpoints
  const testApiEndpoints = async () => {
    if (!isAuthenticated) {
      toast.error("يجب تسجيل الدخول أولاً");
      return;
    }

    try {
      // Test getting conversations
      const convs = await chatbotApiService.getConversations();
      setConversations(convs);
      toast.success(`تم جلب ${convs.length} محادثة`);

      // Test getting stats
      const statsData = await chatbotApiService.getStats();
      setStats(statsData);
      toast.success("تم جلب الإحصائيات بنجاح");

    } catch (error) {
      console.error("API test failed:", error);
      toast.error("فشل في اختبار API");
    }
  };

  // Send test message
  const sendTestMessage = async () => {
    if (!testMessage.trim()) return;
    
    try {
      await sendMessage(testMessage);
      setTestMessage("");
      toast.success("تم إرسال الرسالة بنجاح");
    } catch (error) {
      toast.error("فشل في إرسال الرسالة");
    }
  };

  if (!isAuthenticated) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            اختبار المساعد الذكي
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            يجب تسجيل الدخول لاستخدام المساعد الذكي
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            اختبار المساعد الذكي
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <Badge variant={isAuthenticated ? "default" : "secondary"}>
              {isAuthenticated ? "مسجل الدخول" : "غير مسجل"}
            </Badge>
            <Badge variant={isInitialized ? "default" : "secondary"}>
              {isInitialized ? "مهيأ" : "غير مهيأ"}
            </Badge>
            <Badge variant={sessionId ? "default" : "secondary"}>
              {sessionId ? `جلسة: ${sessionId.slice(0, 8)}...` : "لا توجد جلسة"}
            </Badge>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={initializeChat} disabled={isInitialized || isLoading}>
              تهيئة المحادثة
            </Button>
            <Button onClick={testApiEndpoints} variant="outline">
              <BarChart3 className="h-4 w-4 mr-2" />
              اختبار API
            </Button>
            <Button onClick={clearChat} variant="outline" disabled={!messages.length}>
              <Trash2 className="h-4 w-4 mr-2" />
              مسح المحادثة
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Message Input */}
      <Card>
        <CardHeader>
          <CardTitle>إرسال رسالة تجريبية</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              placeholder="اكتب رسالة تجريبية..."
              className="text-right"
              dir="rtl"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  sendTestMessage();
                }
              }}
            />
            <Button onClick={sendTestMessage} disabled={!testMessage.trim() || isLoading}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Messages Display */}
      {messages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>الرسائل ({messages.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.message_type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.message_type === 'user'
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <div className="flex-1">
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs opacity-70">
                            {new Date(message.created_at).toLocaleTimeString('ar-SA')}
                          </p>
                          {message.message_type === 'bot' && (
                            <Badge variant="outline" className="text-xs">
                              {message.ai_model || 'AI'}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>إحصائيات المساعد الذكي</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.total_conversations}</div>
                <div className="text-sm text-muted-foreground">إجمالي المحادثات</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.active_conversations}</div>
                <div className="text-sm text-muted-foreground">المحادثات النشطة</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.total_messages}</div>
                <div className="text-sm text-muted-foreground">إجمالي الرسائل</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.average_response_time?.toFixed(2) || 0}s</div>
                <div className="text-sm text-muted-foreground">متوسط وقت الاستجابة</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Conversations List */}
      {conversations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>المحادثات السابقة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {conversations.slice(0, 5).map((conv) => (
                <div key={conv.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <div className="font-medium">جلسة: {conv.session_id.slice(0, 8)}...</div>
                    <div className="text-sm text-muted-foreground">
                      {conv.message_count} رسالة - {new Date(conv.updated_at).toLocaleDateString('ar-SA')}
                    </div>
                  </div>
                  <Badge variant={conv.is_active ? "default" : "secondary"}>
                    {conv.is_active ? "نشط" : "منتهي"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
