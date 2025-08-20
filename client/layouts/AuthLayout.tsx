import { memo } from "react";
import { Link } from "react-router-dom";
import { Wrench } from "lucide-react";
import { APP_CONFIG, ROUTES } from "@/constants";
import type { BaseProps } from "@/types";

const AuthLayout = memo(function AuthLayout({
  children,
  className = "",
}: BaseProps) {
  return (
    <div
      className={`min-h-screen bg-gray-900 py-12 px-4 ${className}`}
      dir="rtl"
    >
      {/* Header */}
      <div className="flex justify-center mb-8">
        <Link
          to={ROUTES.HOME}
          className="flex items-center gap-3"
        >
          <div className="premium-gradient rounded-xl p-3 shadow-lg">
            <Wrench className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold premium-text-gradient">
            {APP_CONFIG.name}
          </span>
        </Link>
      </div>

      {/* Content */}
      <div className="flex justify-center">{children}</div>
    </div>
  );
});

export default AuthLayout;
