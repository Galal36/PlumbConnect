import { memo } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthContext } from "@/contexts/AuthContext";
import { ROUTES } from "@/constants";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import type { BaseProps } from "@/types";

interface PrivateRouteProps extends BaseProps {
  requireAuth?: boolean;
  allowedRoles?: string[];
}

const PrivateRoute = memo(function PrivateRoute({
  children,
  requireAuth = true,
  allowedRoles = [],
}: PrivateRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuthContext();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Redirect to login if authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  // Check role-based access
  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return <>{children}</>;
});

export default PrivateRoute;
