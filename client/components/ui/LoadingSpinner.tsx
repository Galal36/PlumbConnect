import { memo } from "react";
import { Loader2 } from "lucide-react";
import type { BaseProps } from "@/types";

interface LoadingSpinnerProps extends BaseProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  fullScreen?: boolean;
}

const LoadingSpinner = memo(function LoadingSpinner({
  size = "md",
  text = "جاري التحميل...",
  fullScreen = false,
  className = "",
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  const containerClasses = fullScreen
    ? "min-h-screen bg-background flex items-center justify-center"
    : "flex items-center justify-center py-8";

  return (
    <div className={`${containerClasses} ${className}`}>
      <div className="text-center">
        <Loader2
          className={`${sizeClasses[size]} animate-spin mx-auto text-primary`}
        />
        {text && <p className="mt-2 text-muted-foreground text-sm">{text}</p>}
      </div>
    </div>
  );
});

export default LoadingSpinner;
