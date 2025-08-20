import { memo } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNotificationContext } from "@/contexts/NotificationContext";
import { cn } from "@/lib/utils";

interface NotificationIconProps {
  onClick: () => void;
  className?: string;
}

const NotificationIcon = memo(function NotificationIcon({
  onClick,
  className = "",
}: NotificationIconProps) {
  const { unreadCount } = useNotificationContext();

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={onClick}
        className={cn(
          "relative p-2 hover:bg-gray-800 transition-colors",
          className,
        )}
        aria-label={`الإشعارات${unreadCount > 0 ? ` - ${unreadCount} غير مقروء` : ""}`}
      >
        <Bell className="h-5 w-5 text-gray-300 hover:text-primary transition-colors" />

        {/* Unread badge */}
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs font-semibold min-w-[1.25rem]"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </Badge>
        )}
      </Button>
    </div>
  );
});

export default NotificationIcon;
