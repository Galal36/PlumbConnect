import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function LoadingSpinner({
  className = "",
  size = "md",
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <Loader2 className={`animate-spin ${sizeClasses[size]} ${className}`} />
  );
}

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({
  message = "جاري التحميل...",
}: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 space-y-4">
      <LoadingSpinner size="lg" className="text-primary" />
      <p className="text-gray-400 text-sm">{message}</p>
    </div>
  );
}

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  message = "حدث خطأ أثناء تحميل البيانات",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 space-y-4">
      <div className="text-red-500 text-center">
        <p className="font-semibold">خطأ</p>
        <p className="text-sm text-gray-400 mt-1">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors text-sm"
        >
          إعادة المحاولة
        </button>
      )}
    </div>
  );
}
