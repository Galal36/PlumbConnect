import { memo, useState } from "react";
import { MoreHorizontal, Check, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import NotificationIcon from "./NotificationIcon";
import NotificationItem from "./NotificationItem";
import { useNotificationContext } from "@/contexts/NotificationContext";
import { NOTIFICATION_CONFIG } from "@/types/notifications";

const NotificationDropdown = memo(function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAllAsRead,
    clearOldNotifications,
  } = useNotificationContext();

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleClearOld = () => {
    clearOldNotifications(NOTIFICATION_CONFIG.AUTO_CLEANUP_DAYS);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div>
          <NotificationIcon
            onClick={() => setIsOpen(!isOpen)}
            className="cursor-pointer"
          />
        </div>
      </PopoverTrigger>

      <PopoverContent
        className="w-80 md:w-96 p-0 bg-white border border-gray-200 shadow-lg rounded-lg"
        align="end"
        side="bottom"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900">الإشعارات</h3>
            {unreadCount > 0 && (
              <Badge variant="default" className="text-xs">
                {unreadCount} جديد
              </Badge>
            )}
          </div>

          {/* Actions dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {unreadCount > 0 && (
                <>
                  <DropdownMenuItem onClick={handleMarkAllAsRead}>
                    <Check className="h-4 w-4 me-2" />
                    تحديد الكل كمقروء
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem
                onClick={handleClearOld}
                className="text-gray-600"
              >
                <Trash2 className="h-4 w-4 me-2" />
                مسح الإشعارات القديمة
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Content */}
        <div className="max-h-96 min-h-[200px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <LoadingSpinner size="sm" text="جاري تحميل الإشعارات..." />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-32 text-center p-4">
              <div>
                <p className="text-red-500 text-sm mb-2">
                  خطأ في تحميل الإشعارات
                </p>
                <p className="text-xs text-gray-500">{error}</p>
              </div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-center p-4">
              <div>
                <p className="text-gray-500 text-sm mb-1">لا توجد إشعارات</p>
                <p className="text-xs text-gray-400">
                  ستظهر الإشعارات الجديدة هنا
                </p>
              </div>
            </div>
          ) : (
            <ScrollArea className="h-96">
              <div className="group">
                {notifications.map((notification) => (
                  <div key={notification.id} className="group">
                    <NotificationItem
                      notification={notification}
                      onClose={() => setIsOpen(false)}
                    />
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs text-gray-600 hover:text-gray-800"
              onClick={() => setIsOpen(false)}
            >
              عرض جميع الإشعارات
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
});

export default NotificationDropdown;
