import { useAuthContext } from "@/contexts/AuthContext";
import Profile from "./Profile";
import PlumberProfile from "./PlumberProfile";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wrench, User, ArrowRightLeft } from "lucide-react";
import { Link } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";

export default function ProfilePage() {
  const {
    user,
    isAuthenticated,
    isPlumber,
    isUser,
    switchToPlumberAccount,
    switchToUserAccount,
  } = useAuthContext();
  const navigate = useNavigate();

  // If not authenticated, show login prompt
  if (!isAuthenticated || !user) {
    return (
      <MainLayout className="bg-gray-900" showNavbar={true}>
      <div className="min-h-screen bg-gray-900" dir="rtl">
        {/* Header */}
        <header className="glass-effect shadow-lg border-b border-border/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <Link
                to="/"
                className="flex items-center gap-2"
              >
                <div className="premium-gradient rounded-xl p-3 shadow-lg">
                  <Wrench className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold premium-text-gradient">
                  فني صحي الكويت
                </span>
              </Link>
            </div>
          </div>
        </header>

        <div className="max-w-md mx-auto px-4 py-20">
          <Card className="premium-card-gradient text-center">
            <CardContent className="p-8">
              <div className="premium-gradient rounded-full p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">
                تسجيل الدخول مطلوب
              </h2>
              <p className="text-gray-300 mb-6">
                يجب تسجيل الدخول أولاً لعرض الملف الشخصي
              </p>
              <div className="space-y-3">
                <Button className="w-full" asChild>
                  <Link to="/login">تسجيل الدخول</Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/register">إنشاء حساب جديد</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </MainLayout>
    );
  }

  // Show appropriate profile based on user role
  if (isPlumber) {
    return (
      <MainLayout className="bg-gray-900" showNavbar={true}>
        <PlumberProfile />
      </MainLayout>
    );
  }

  // Show profile for all authenticated users (including regular users)
  return (
    <MainLayout className="bg-gray-900" showNavbar={true}>
      <Profile />
    </MainLayout>
  );
}
