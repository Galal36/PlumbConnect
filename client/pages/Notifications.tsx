import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Wrench,
  Bell,
  MessageCircle,
  Star,
  UserPlus,
  CheckCircle,
  X,
  Clock,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";

interface Notification {
  id: string;
  userId: string;
  content: string;
  type: "message" | "review" | "service" | "system" | "follow";
  isRead: boolean;
  createdAt: string;
  relatedUser?: {
    name: string;
    avatar: string;
  };
  actionUrl?: string;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      userId: "current",
      content: "قام أحمد الراشد بتقييمك بـ 5 نجوم",
      type: "review",
      isRead: false,
      createdAt: "2025-01-20T10:30:00",
      relatedUser: {
        name: "أحمد الراشد",
        avatar: "/placeholder.svg",
      },
      actionUrl: "/profile",
    },
    {
      id: "2",
      userId: "current",
      content: "لديك رسالة جديدة من فاطمة الكندري",
      type: "message",
      isRead: false,
      createdAt: "2025-01-20T09:15:00",
      relatedUser: {
        name: "فاطمة الكندري",
        avatar: "/placeholder.svg",
      },
      actionUrl: "/chat/2",
    },
    {
      id: "3",
      userId: "current",
      content: "تم تأكيد إكمال الخدمة بنجاح",
      type: "service",
      isRead: true,
      createdAt: "2025-01-19T16:45:00",
      actionUrl: "/services/3",
    },
    {
      id: "4",
      userId: "current",
      content: "محمد العجمي بدأ في متابعة ملفك الشخصي",
      type: "follow",
      isRead: true,
      createdAt: "2025-01-19T14:20:00",
      relatedUser: {
        name: "محمد العجمي",
        avatar: "/placeholder.svg",
      },
      actionUrl: "/plumber/3",
    },
    {
      id: "5",
      userId: "current",
      content: 'تم نشر مقالك "دليل صيانة السخانات" بنجاح',
      type: "system",
      isRead: true,
      createdAt: "2025-01-18T11:30:00",
      actionUrl: "/articles/5",
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = (notificationId: string) => {
    setNotifications(
      notifications.map((notification) =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification,
      ),
    );
  };

  const markAllAsRead = () => {
    setNotifications(
      notifications.map((notification) => ({ ...notification, isRead: true })),
    );
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(notifications.filter((n) => n.id !== notificationId));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "message":
        return <MessageCircle className="h-5 w-5 text-blue-500" />;
      case "review":
        return <Star className="h-5 w-5 text-yellow-500" />;
      case "service":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "follow":
        return <UserPlus className="h-5 w-5 text-purple-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-400" />;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor(
      (now.getTime() - time.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 1) return "منذ قليل";
    if (diffInHours < 24) return `منذ ${diffInHours} ساعة`;
    return `منذ ${Math.floor(diffInHours / 24)} يوم`;
  };

  return (
    <div className="min-h-screen bg-gray-900" dir="rtl">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">الإشعارات</h1>
            <p className="text-gray-300">
              {unreadCount > 0
                ? `لديك ${unreadCount} إشعار غير مقروء`
                : "جميع الإشعارات مقروءة"}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button onClick={markAllAsRead}>
              <CheckCircle className="h-4 w-4 ms-2" />
              قراءة الكل
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`premium-card-gradient transition-all duration-200 ${
                !notification.isRead
                  ? "ring-2 ring-primary/20 bg-primary/5"
                  : ""
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Notification Icon */}
                  <div className="flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* User Avatar (if exists) */}
                  {notification.relatedUser && (
                    <Avatar className="w-10 h-10 flex-shrink-0">
                      <AvatarImage src={notification.relatedUser.avatar} />
                      <AvatarFallback>
                        {notification.relatedUser.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-white ${!notification.isRead ? "font-semibold" : ""}`}
                    >
                      {notification.content}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-400">
                      <Clock className="h-3 w-3" />
                      <span>{formatTimeAgo(notification.createdAt)}</span>
                      {!notification.isRead && (
                        <Badge
                          variant="secondary"
                          className="bg-primary/10 text-primary text-xs"
                        >
                          جديد
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {notification.actionUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        onClick={() => markAsRead(notification.id)}
                      >
                        <Link to={notification.actionUrl}>عرض</Link>
                      </Button>
                    )}
                    {!notification.isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                      >
                        قراءة
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteNotification(notification.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {notifications.length === 0 && (
          <div className="text-center py-12">
            <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              لا توجد إشعارات
            </h3>
            <p className="text-gray-300">ستظهر إشعاراتك هنا عند توفرها</p>
          </div>
        )}
      </div>
    </div>
  );
}
