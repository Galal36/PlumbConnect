import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import LoadingSpinner from "./components/ui/LoadingSpinner";
import ErrorBoundary from "./components/ErrorBoundary";
import PrivateRoute from "./components/guards/PrivateRoute";
import PublicRoute from "./components/guards/PublicRoute";
import SEOChecker from "./components/SEOChecker";
import { ROUTES, USER_ROLES } from "./constants";

// Lazy load components for better performance
const Index = lazy(() => import("./pages/Index"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
// Import directly without lazy loading to fix the issue
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ActivateAccount from "./pages/ActivateAccount";
import EmailConfirmation from "./pages/EmailConfirmation";
const Posts = lazy(() => import("./pages/Posts"));
const AddPost = lazy(() => import("./pages/AddPost"));
const AddArticle = lazy(() => import("./pages/AddArticle"));
const ViewArticle = lazy(() => import("./pages/ViewArticle"));
const ViewPost = lazy(() => import("./pages/ViewPost"));
const PlumbersList = lazy(() => import("./pages/PlumbersList"));
const PlumberProfile = lazy(() => import("./pages/PlumberProfile"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const Chat = lazy(() => import("./pages/Chat"));
const Articles = lazy(() => import("./pages/Articles"));
const Services = lazy(() => import("./pages/Services"));
const Complain = lazy(() => import("./pages/Complain"));
const ComplaintsList = lazy(() => import("./pages/ComplaintsList"));
const Notifications = lazy(() => import("./pages/Notifications"));
const PlumberDashboard = lazy(() => import("./pages/PlumberDashboard"));
const HowToChoose = lazy(() => import("./pages/HowToChoose"));
const HowToChoosePlumber = lazy(() => import("./pages/HowToChoosePlumber"));
const HowCanWeHelpYou = lazy(() => import("./pages/HowCanWeHelpYou"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ErrorBoundary>
                <Suspense fallback={<LoadingSpinner fullScreen />}>
                  <Routes>
                    {/* Public Routes */}
                    <Route
                      path={ROUTES.HOME}
                      element={
                        <PublicRoute>
                          <Index />
                        </PublicRoute>
                      }
                    />
                    <Route
                      path={ROUTES.LOGIN}
                      element={
                        <PublicRoute redirectIfAuthenticated>
                          <Login />
                        </PublicRoute>
                      }
                    />
                    <Route
                      path={ROUTES.REGISTER}
                      element={
                        <PublicRoute redirectIfAuthenticated>
                          <Register />
                        </PublicRoute>
                      }
                    />
                    <Route
                      path={ROUTES.FORGOT_PASSWORD}
                      element={
                        <PublicRoute>
                          <ForgotPassword />
                        </PublicRoute>
                      }
                    />
                    <Route
                      path={ROUTES.RESET_PASSWORD}
                      element={
                        <PublicRoute>
                          <ResetPassword />
                        </PublicRoute>
                      }
                    />
                    <Route
                      path="/activate/:uidb64/:token"
                      element={
                        <PublicRoute>
                          <ActivateAccount />
                        </PublicRoute>
                      }
                    />
                    <Route
                      path={ROUTES.EMAIL_CONFIRMATION}
                      element={
                        <PublicRoute>
                          <EmailConfirmation />
                        </PublicRoute>
                      }
                    />
                    <Route
                      path={ROUTES.POSTS}
                      element={
                        <PublicRoute>
                          <Posts />
                        </PublicRoute>
                      }
                    />
                    <Route
                      path="/posts/:id"
                      element={
                        <PublicRoute>
                          <ViewPost />
                        </PublicRoute>
                      }
                    />
                    <Route
                      path={ROUTES.PLUMBERS}
                      element={
                        <PublicRoute>
                          <PlumbersList />
                        </PublicRoute>
                      }
                    />
                    <Route
                      path="/plumber/:id"
                      element={
                        <PublicRoute>
                          <PlumberProfile />
                        </PublicRoute>
                      }
                    />
                    <Route
                      path="/profile/:id"
                      element={
                        <PublicRoute>
                          <PlumberProfile />
                        </PublicRoute>
                      }
                    />
                    <Route
                      path={ROUTES.ARTICLES}
                      element={
                        <PublicRoute>
                          <Articles />
                        </PublicRoute>
                      }
                    />
                    <Route
                      path="/articles/:id"
                      element={
                        <PublicRoute>
                          <ViewArticle />
                        </PublicRoute>
                      }
                    />
                    <Route
                      path={ROUTES.SERVICES}
                      element={
                        <PrivateRoute>
                          <Services />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path={ROUTES.HOW_TO_CHOOSE}
                      element={
                        <PublicRoute>
                          <HowToChoose />
                        </PublicRoute>
                      }
                    />
                    <Route
                      path={ROUTES.HOW_CAN_WE_HELP}
                      element={
                        <PublicRoute>
                          <HowCanWeHelpYou />
                        </PublicRoute>
                      }
                    />
                    <Route
                      path="/how-to-choose-plumber"
                      element={
                        <PublicRoute>
                          <HowToChoosePlumber />
                        </PublicRoute>
                      }
                    />

                    {/* Private Routes - Require Authentication */}
                    <Route
                      path={ROUTES.PROFILE}
                      element={
                        <PrivateRoute>
                          <ProfilePage />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path={ROUTES.ADD_POST}
                      element={
                        <PrivateRoute>
                          <AddPost />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path={ROUTES.ADD_ARTICLE}
                      element={
                        <PrivateRoute>
                          <AddArticle />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path={ROUTES.CHAT}
                      element={
                        <PrivateRoute>
                          <Chat />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/chat/:chatId"
                      element={
                        <PrivateRoute>
                          <Chat />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path={ROUTES.COMPLAIN}
                      element={
                        <PrivateRoute>
                          <Complain />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path={ROUTES.COMPLAINTS}
                      element={
                        <PrivateRoute>
                          <ComplaintsList />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path={ROUTES.NOTIFICATIONS}
                      element={
                        <PrivateRoute>
                          <Notifications />
                        </PrivateRoute>
                      }
                    />

                    {/* Plumber-Only Routes */}
                    <Route
                      path={ROUTES.PLUMBER_DASHBOARD}
                      element={
                        <PrivateRoute
                          allowedRoles={[USER_ROLES.PLUMBER, USER_ROLES.ADMIN]}
                        >
                          <PlumberDashboard />
                        </PrivateRoute>
                      }
                    />

                    {/* Catch-all route - Must be last */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </ErrorBoundary>
              <SEOChecker />
            </BrowserRouter>
          </TooltipProvider>
        </NotificationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
