import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Send,
  Image as ImageIcon,
  MessageCircle,
  MoreVertical,
  Loader2,
  Wrench,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useAuthContext } from "@/contexts/AuthContext";
import { chatApiService, Chat as ChatType, Message } from "@/services/chatApi";
import { toast } from "sonner";
import { useWebSocket } from "@/hooks/useWebSocket";
import { formatError } from "@/utils";
import RequestServiceDialog from "@/components/RequestServiceDialog";

export default function Chat() {
  const { isAuthenticated, isLoading, user } = useAuthContext();
  const { chatId } = useParams();
  const [currentChatId, setCurrentChatId] = useState<number | null>(
    chatId ? parseInt(chatId) : null
  );

  // Redirect to login if not authenticated
  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // State management
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [chats, setChats] = useState<ChatType[]>([]);
  const [currentChat, setCurrentChat] = useState<ChatType | null>(null);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isRequestServiceDialogOpen, setIsRequestServiceDialogOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // WebSocket integration
  const handleNewMessage = (newMessage: Message) => {
    setMessages((prev) => {
      // Avoid duplicates by checking if message already exists
      const exists = prev.some(msg => msg.id === newMessage.id);
      if (exists) return prev;
      return [...prev, newMessage];
    });

    // Auto-scroll to new message
    setTimeout(() => {
      scrollToBottom();
    }, 100);
  };

  const { isConnected, connectionError, sendMessage: sendWebSocketMessage } = useWebSocket({
    chatId: currentChatId,
    onMessageReceived: handleNewMessage,
    token: localStorage.getItem('access_token')
  });

  // Load chats on component mount
  useEffect(() => {
    const loadChats = async () => {
      try {
        setIsLoadingChats(true);
        const userChats = await chatApiService.getChats();
        setChats(userChats);

        // If chatId is provided in URL, find and set the current chat
        if (chatId) {
          const targetChatId = parseInt(chatId);
          const targetChat = userChats.find(chat => chat.id === targetChatId);
          if (targetChat) {
            setCurrentChat(targetChat);
            setCurrentChatId(targetChatId);
            await loadMessages(targetChatId);
          } else {
            toast.error("المحادثة غير موجودة");
          }
        }
      } catch (error) {
        console.error("Failed to load chats:", error);
        toast.error("فشل في تحميل المحادثات");
      } finally {
        setIsLoadingChats(false);
      }
    };

    if (isAuthenticated && user) {
      loadChats();
    }
  }, [isAuthenticated, user, chatId]);

  // Load messages for a specific chat
  const loadMessages = async (chatId: number) => {
    try {
      setIsLoadingMessages(true);
      const chatMessages = await chatApiService.getChatMessages(chatId);
      setMessages(chatMessages);
    } catch (error) {
      console.error("Failed to load messages:", error);
      toast.error("فشل في تحميل الرسائل");
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // Handle chat selection
  const handleChatSelect = async (chat: ChatType) => {
    setCurrentChat(chat);
    setCurrentChatId(chat.id);
    await loadMessages(chat.id);

    // Scroll to bottom after messages are loaded
    setTimeout(() => {
      scrollToBottom();
    }, 300);

    // Update URL without page reload
    window.history.pushState({}, '', `/chat/${chat.id}`);
  };

  // Scroll to bottom function
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      // Use both scrollIntoView and direct scroll for better reliability
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });

      // Also try direct scroll on the parent container
      const scrollArea = messagesEndRef.current.closest('[data-radix-scroll-area-viewport]');
      if (scrollArea) {
        scrollArea.scrollTop = scrollArea.scrollHeight;
      }
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Scroll to bottom when chat changes and messages are loaded
  useEffect(() => {
    if (currentChatId && messages.length > 0 && !isLoadingMessages) {
      // Use a longer timeout to ensure DOM is fully rendered
      setTimeout(() => {
        scrollToBottom();
      }, 200);
    }
  }, [currentChatId, messages.length, isLoadingMessages]);

  // Force scroll to bottom when loading finishes
  useEffect(() => {
    if (!isLoadingMessages && messages.length > 0) {
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  }, [isLoadingMessages]);

  // Handle image selection
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error("يرجى اختيار ملف صورة صالح");
        return;
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("حجم الصورة يجب أن يكون أقل من 5 ميجابايت");
        return;
      }

      setSelectedImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Clear selected image
  const clearSelectedImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Send message function (updated to handle images)
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!message.trim() && !selectedImage) || !currentChatId || isSendingMessage) return;

    try {
      setIsSendingMessage(true);

      let newMessage;
      if (selectedImage) {
        // Send image message
        newMessage = await chatApiService.sendMessageWithFile(
          currentChatId,
          message.trim() || "صورة",
          selectedImage,
          'image'
        );
        // Add the image message to the UI immediately
        setMessages((prev) => [...prev, newMessage]);
        clearSelectedImage();
        setMessage(""); // Clear message input after sending image
      } else {
        // Send text message via WebSocket if connected, otherwise fallback to HTTP
        if (isConnected && sendWebSocketMessage(message.trim())) {
          // Message sent via WebSocket, it will be received back via onMessageReceived
          setMessage("");
          return; // Don't add to messages here, wait for WebSocket response
        } else {
          // Fallback to HTTP API
          newMessage = await chatApiService.sendMessage(currentChatId, message.trim());
          setMessages((prev) => [...prev, newMessage]);
          setMessage(""); // Clear message input after sending
        }
      }

      // Scroll to bottom after sending message
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("فشل في إرسال الرسالة");
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Get the other participant in the chat
  const getOtherParticipant = (chat: ChatType | null) => {
    if (!user || !chat || !chat.sender || !chat.receiver) return null;

    // For admins, show the first participant (sender) as the "other" participant
    if (user.role === 'admin') {
      return chat.sender;
    }

    // For regular users, show the actual other participant
    return chat.sender.id === user.id ? chat.receiver : chat.sender;
  };

  // Utility functions
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("ar-KW", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString("ar-KW", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isMessageFromCurrentUser = (message: Message) => {
    // For admins viewing chats, never show messages as "from current user"
    // This allows them to see the conversation flow properly
    if (user?.role === 'admin') {
      return false;
    }

    return user && message.sender && message.sender.id === user.id;
  };

  // Loading state
  if (isLoading || isLoadingChats) {
    return (
      <div className="min-h-screen bg-gray-900" dir="rtl">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-80px)] overflow-hidden">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-white">جاري تحميل المحادثات...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900" dir="rtl">
      <Navbar />

      <div className="flex h-[calc(100vh-80px)]">
        {/* Chat List Sidebar */}
        <div className="w-1/3 bg-gray-800 border-l border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-xl font-bold text-white">المحادثات</h2>
          </div>
          <ScrollArea className="flex-1 h-0">
            <div className="space-y-2 p-2">
              {chats.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">لا توجد محادثات بعد</p>
                </div>
              ) : (
                chats.map((chat) => {
                  const otherParticipant = getOtherParticipant(chat);
                  if (!otherParticipant) return null;

                  return (
                    <Card
                      key={chat.id}
                      className={`cursor-pointer hover:shadow-md transition-all ${
                        currentChatId === chat.id ? "ring-2 ring-primary" : ""
                      }`}
                      onClick={() => handleChatSelect(chat)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            {otherParticipant.role === "plumber" ? (
                              <Link
                                to={`/plumber/${otherParticipant.id}`}
                                className="hover:opacity-80 transition-opacity"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Avatar className="cursor-pointer hover:ring-2 hover:ring-primary/40 transition-all">
                                  <AvatarImage src={otherParticipant.image || "/placeholder.svg"} />
                                  <AvatarFallback>
                                    {otherParticipant.name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                              </Link>
                            ) : (
                              <Avatar>
                                <AvatarImage src={otherParticipant.image || "/placeholder.svg"} />
                                <AvatarFallback>
                                  {otherParticipant.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              {otherParticipant.role === "plumber" ? (
                                <Link
                                  to={`/plumber/${otherParticipant.id}`}
                                  className="font-semibold text-white truncate hover:text-primary transition-colors cursor-pointer"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {otherParticipant.name}
                                </Link>
                              ) : (
                                <h3 className="font-semibold text-white truncate">
                                  {otherParticipant.name}
                                </h3>
                              )}
                              {otherParticipant.role === "plumber" && (
                                <Badge
                                  variant="secondary"
                                  className="bg-primary/10 text-primary text-xs"
                                >
                                  فني صحي
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-300 truncate">
                              {chat.last_message || "لا توجد رسائل بعد"}
                            </p>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-xs text-gray-400">
                                {formatTime(chat.updated_at)}
                              </span>
                              {chat.unread_count > 0 && (
                                <Badge className="bg-primary text-white text-xs">
                                  {chat.unread_count}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {currentChat ? (
            <>
              {/* Chat Header */}
              <div className="bg-gray-800 border-b border-gray-700 p-4 sticky top-[80px] z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={getOtherParticipant(currentChat)?.image || "/placeholder.svg"} />
                      <AvatarFallback>
                        {getOtherParticipant(currentChat)?.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-white">
                        {user?.role === 'admin' && currentChat ?
                          `${currentChat.sender.name} ↔ ${currentChat.receiver.name}` :
                          getOtherParticipant(currentChat)?.name
                        }
                      </h3>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-gray-300">
                          {user?.role === 'admin' && currentChat ?
                            `${currentChat.sender.role === "plumber" ? "فني صحي" : "عميل"} ↔ ${currentChat.receiver.role === "plumber" ? "فني صحي" : "عميل"}` :
                            (getOtherParticipant(currentChat)?.role === "plumber" ? "فني صحي" : "عميل")
                          }
                        </p>
                        {/* User Online Status */}
                        <div className="flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${getOtherParticipant(currentChat)?.is_online ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                          <span className="text-xs text-gray-500">
                            {getOtherParticipant(currentChat)?.is_online ? 'متصل' : 'غير متصل'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Request Service Button - Only show for plumbers and not for admins */}
                    {user?.role !== 'admin' && getOtherParticipant(currentChat)?.role === "plumber" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsRequestServiceDialogOpen(true)}
                        className="bg-primary/10 border-primary text-primary hover:bg-primary hover:text-white"
                      >
                        <Wrench className="h-4 w-4 mr-1" />
                        طلب خدمة
                      </Button>
                    )}
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 flex flex-col min-h-0">
                <ScrollArea className="flex-1 p-4">
                  {isLoadingMessages ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto mb-2" />
                        <p className="text-gray-400 text-sm">جاري تحميل الرسائل...</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 min-h-full flex flex-col justify-end">
                      {messages.length === 0 ? (
                        <div className="text-center py-8 flex-1 flex items-center justify-center">
                          <div>
                            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-400">لا توجد رسائل بعد</p>
                            <p className="text-gray-500 text-sm mt-2">ابدأ المحادثة بإرسال رسالة</p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {messages.filter(msg => msg && msg.id).map((msg) => {
                            const isCurrentUser = isMessageFromCurrentUser(msg);
                            return (
                              <div
                                key={msg.id}
                                className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                              >
                                <div
                                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                                    isCurrentUser
                                      ? "bg-primary text-white"
                                      : "bg-gray-700 text-white"
                                  }`}
                                >
                                  {/* Show sender name for admins */}
                                  {user?.role === 'admin' && msg.sender && (
                                    <p className="text-xs font-semibold mb-1 text-gray-300">
                                      {msg.sender.name} ({msg.sender.role === 'plumber' ? 'فني صحي' : 'عميل'})
                                    </p>
                                  )}

                                  {/* Display image if message type is image */}
                                  {msg.message_type === 'image' && msg.image && (
                                    <div className="mb-2">
                                      <img
                                        src={msg.image}
                                        alt="Shared image"
                                        className="max-w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                        onClick={() => window.open(msg.image, '_blank')}
                                      />
                                    </div>
                                  )}

                                  {/* Display text content */}
                                  {msg.content && (
                                    <p className="text-sm">{msg.content}</p>
                                  )}

                                  <p
                                    className={`text-xs mt-1 ${
                                      isCurrentUser
                                        ? "text-white/70"
                                        : "text-gray-400"
                                    }`}
                                  >
                                    {formatTime(msg.created_at)}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                          <div ref={messagesEndRef} />
                        </div>
                      )}
                    </div>
                  )}
                </ScrollArea>
              </div>

              {/* Message Input - Hidden for admins */}
              {user?.role !== 'admin' && (
                <div className="bg-gray-800 border-t border-gray-700 p-4">
                {/* Image Preview */}
                {imagePreview && (
                  <div className="mb-4 relative inline-block">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-w-xs max-h-32 rounded-lg border border-gray-600"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={clearSelectedImage}
                      className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 p-0"
                    >
                      ×
                    </Button>
                  </div>
                )}

                <form
                  onSubmit={handleSendMessage}
                  className="flex items-center gap-2"
                >
                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />

                  {/* Image upload button */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white hover:bg-gray-700"
                    disabled={isSendingMessage}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImageIcon className="h-4 w-4" />
                  </Button>

                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={selectedImage ? "اكتب تعليق على الصورة (اختياري)..." : "اكتب رسالتك..."}
                    className="flex-1 text-end bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                    disabled={isSendingMessage}
                  />

                  <Button
                    type="submit"
                    size="sm"
                    disabled={isSendingMessage || (!message.trim() && !selectedImage)}
                  >
                    {isSendingMessage ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </form>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">
                  اختر محادثة
                </h3>
                <p className="text-gray-300">
                  اختر محا��ثة من القائمة لبدء المحادثة
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Request Service Dialog */}
        {currentChat && getOtherParticipant(currentChat)?.role === "plumber" && (
          <RequestServiceDialog
            isOpen={isRequestServiceDialogOpen}
            onClose={() => setIsRequestServiceDialogOpen(false)}
            plumberId={getOtherParticipant(currentChat)!.id}
            plumberName={getOtherParticipant(currentChat)!.name}
          />
        )}
      </div>
    </div>
  );
}
