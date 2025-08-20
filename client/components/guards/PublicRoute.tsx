import { memo } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthContext } from "@/contexts/AuthContext";
import { ROUTES } from "@/constants";
import type { BaseProps } from "@/types";

interface PublicRouteProps extends BaseProps {
  redirectIfAuthenticated?: boolean;
}

const PublicRoute = memo(function PublicRoute({
  children,
  redirectIfAuthenticated = false,
}: PublicRouteProps) {
  const { isAuthenticated, isLoading } = useAuthContext();
  const location = useLocation();

  // Don't redirect while loading
  if (isLoading) {
    return <>{children}</>;
  }

  // Redirect authenticated users away from auth pages
  if (redirectIfAuthenticated && isAuthenticated) {
    const from = location.state?.from?.pathname || ROUTES.HOME;
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
});

export default PublicRoute;
