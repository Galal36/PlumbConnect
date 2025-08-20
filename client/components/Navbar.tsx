import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Wrench, Menu, MessageCircle } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuthContext } from "@/contexts/AuthContext";
import NotificationDropdown from "@/components/notifications/NotificationDropdown";
import { useState } from "react";

export default function Navbar() {
  const { isAuthenticated, isPlumber, logout, user, isLoading } = useAuthContext();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    // Redirect user to home page after logout
    window.location.href = "/";
  };

  // Function to determine if a link is active
  const isActiveLink = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="glass-effect shadow-lg border-b border-border/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="premium-gradient rounded-xl p-3 shadow-lg">
              <Wrench className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold premium-text-gradient">
              فني صحي الكويت
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {/* Basic links available to all users */}
            <Link
              to="/posts"
              className={`transition-colors ${
                isActiveLink("/posts")
                  ? "text-primary font-semibold"
                  : "text-gray-300 hover:text-primary"
              }`}
            >
              البوستات
            </Link>
            <Link
              to="/plumbers"
              className={`transition-colors ${
                isActiveLink("/plumbers")
                  ? "text-primary font-semibold"
                  : "text-gray-300 hover:text-primary"
              }`}
            >
              الفنيين الصحيين
            </Link>
            <Link
              to="/articles"
              className={`transition-colors ${
                isActiveLink("/articles")
                  ? "text-primary font-semibold"
                  : "text-gray-300 hover:text-primary"
              }`}
            >
              المقالات
            </Link>

            {/* Links for authenticated users */}
            {isAuthenticated && (
              <>
                <Link
                  to="/chat"
                  className={`flex items-center gap-2 transition-colors ${
                    isActiveLink("/chat")
                      ? "text-primary font-semibold"
                      : "text-gray-300 hover:text-primary"
                  }`}
                >
                  <MessageCircle className="h-4 w-4" />
                  المحادثات
                </Link>
                <Link
                  to="/services"
                  className={`flex items-center gap-2 transition-colors ${
                    isActiveLink("/services")
                      ? "text-primary font-semibold"
                      : "text-gray-300 hover:text-primary"
                  }`}
                >
                  <Wrench className="h-4 w-4" />
                  الخدمات
                </Link>
                <Link
                  to="/profile"
                  className={`transition-colors ${
                    isActiveLink("/profile")
                      ? "text-primary font-semibold"
                      : "text-gray-300 hover:text-primary"
                  }`}
                >
                  الملف الشخصي
                </Link>
                <Link
                  to="/complain"
                  className={`transition-colors ${
                    isActiveLink("/complain")
                      ? "text-primary font-semibold"
                      : "text-gray-300 hover:text-primary"
                  }`}
                >
                  شكوى
                </Link>

                {/* Admin complaints management */}
                {user?.role === 'admin' && (
                  <Link
                    to="/complaints"
                    className={`transition-colors ${
                      isActiveLink("/complaints")
                        ? "text-primary font-semibold"
                        : "text-gray-300 hover:text-primary"
                    }`}
                  >
                    إدارة الشكاوى
                  </Link>
                )}
              </>
            )}

            {/* Display user information */}
            {isAuthenticated && !isLoading && user && user.name ? (
              <div className="flex items-center gap-3">
                {/* Notifications */}
                <NotificationDropdown />

                <Link
                  to="/profile"
                  className="flex items-center gap-3 hover:opacity-80 transition-opacity group"
                >
                  <div className="text-end">
                    <p className="text-white font-medium text-sm group-hover:text-primary transition-colors">
                      {user.name || "مستخدم"}
                    </p>
                    <p className="text-gray-300 text-xs">
                      {isPlumber ? "فني صحي" : "مستخدم"}
                    </p>
                  </div>
                  <Avatar
                    className={`h-8 w-8 ring-2 transition-all group-hover:scale-105 ${
                      isPlumber
                        ? "ring-primary/20 hover:ring-primary/40"
                        : "ring-gray-400/20 hover:ring-gray-400/40"
                    }`}
                  >
                    {/* Only show image for plumbers */}
                    {isPlumber && user.avatar && (
                      <AvatarImage src={user.avatar} alt={user.name || "مستخدم"} />
                    )}
                    <AvatarFallback
                      className={`text-white text-sm font-semibold ${
                        isPlumber ? "bg-primary" : "bg-gray-600"
                      }`}
                    >
                      {user.name ? user.name.charAt(0) : "?"}
                    </AvatarFallback>
                  </Avatar>
                </Link>
              </div>
            ) : null}

            {/* Login/Logout buttons */}
            <div className="flex items-center gap-2">
              {isLoading ? (
                <div className="text-gray-400 text-sm">جاري التحميل...</div>
              ) : !isAuthenticated ? (
                <>
                  <Button size="sm" variant="outline" asChild>
                    <Link to="/login">تسجيل دخول</Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link to="/register">حساب جديد</Link>
                  </Button>
                </>
              ) : isAuthenticated ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleLogout}
                  className="hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors"
                >
                  تسجيل خروج
                </Button>
              ) : null}
            </div>
          </nav>

          {/* Mobile menu dropdown */}
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button size="sm" variant="outline">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col space-y-4 mt-6">
                  {/* Basic links available to all users */}
                  <Link
                    to="/posts"
                    className={`transition-colors p-2 rounded-md ${
                      isActiveLink("/posts")
                        ? "text-primary font-semibold bg-primary/10"
                        : "text-gray-300 hover:text-primary hover:bg-gray-800"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    البوستات
                  </Link>
                  <Link
                    to="/plumbers"
                    className={`transition-colors p-2 rounded-md ${
                      isActiveLink("/plumbers")
                        ? "text-primary font-semibold bg-primary/10"
                        : "text-gray-300 hover:text-primary hover:bg-gray-800"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    الفنيين الصحيين
                  </Link>
                  <Link
                    to="/articles"
                    className={`transition-colors p-2 rounded-md ${
                      isActiveLink("/articles")
                        ? "text-primary font-semibold bg-primary/10"
                        : "text-gray-300 hover:text-primary hover:bg-gray-800"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    المقالات
                  </Link>

                  {/* Links for authenticated users */}
                  {isAuthenticated && (
                    <>
                      <Link
                        to="/chat"
                        className={`flex items-center gap-2 transition-colors p-2 rounded-md ${
                          isActiveLink("/chat")
                            ? "text-primary font-semibold bg-primary/10"
                            : "text-gray-300 hover:text-primary hover:bg-gray-800"
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <MessageCircle className="h-4 w-4" />
                        المحادثات
                      </Link>
                      <Link
                        to="/services"
                        className={`flex items-center gap-2 transition-colors p-2 rounded-md ${
                          isActiveLink("/services")
                            ? "text-primary font-semibold bg-primary/10"
                            : "text-gray-300 hover:text-primary hover:bg-gray-800"
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Wrench className="h-4 w-4" />
                        الخدمات
                      </Link>
                      <Link
                        to="/profile"
                        className={`transition-colors p-2 rounded-md ${
                          isActiveLink("/profile")
                            ? "text-primary font-semibold bg-primary/10"
                            : "text-gray-300 hover:text-primary hover:bg-gray-800"
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        الملف الشخصي
                      </Link>
                      <Link
                        to="/complain"
                        className={`transition-colors p-2 rounded-md ${
                          isActiveLink("/complain")
                            ? "text-primary font-semibold bg-primary/10"
                            : "text-gray-300 hover:text-primary hover:bg-gray-800"
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        شكوى
                      </Link>

                      {/* Admin complaints management in mobile */}
                      {user?.role === 'admin' && (
                        <Link
                          to="/complaints"
                          className={`transition-colors p-2 rounded-md ${
                            isActiveLink("/complaints")
                              ? "text-primary font-semibold bg-primary/10"
                              : "text-gray-300 hover:text-primary hover:bg-gray-800"
                          }`}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          إدارة الشكاوى
                        </Link>
                      )}

                      {/* User information and links */}
                      {!isLoading && user && user.name ? (
                        <div className="border-t border-gray-700 pt-4 mt-4">
                          {/* Notifications in mobile menu */}
                          <div className="p-2 mb-2">
                            <NotificationDropdown />
                          </div>

                          <Link
                            to="/profile"
                            className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-800 transition-colors"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <Avatar className="h-8 w-8">
                              {/* Only show image for plumbers */}
                              {isPlumber && user.avatar && (
                                <AvatarImage src={user.avatar} alt={user.name || "مستخدم"} />
                              )}
                              <AvatarFallback
                                className={`text-white text-sm font-semibold ${
                                  isPlumber ? "bg-primary" : "bg-gray-600"
                                }`}
                              >
                                {user.name ? user.name.charAt(0) : "?"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="text-end">
                              <p className="text-white font-medium text-sm">
                                {user.name || "مستخدم"}
                              </p>
                              <p className="text-gray-300 text-xs">
                                {isPlumber ? "فني صحي" : "مستخدم"}
                              </p>
                            </div>
                          </Link>
                        </div>
                      ) : null}
                    </>
                  )}

                  {/* Login/Logout buttons */}
                  <div className="border-t border-gray-700 pt-4 mt-4 space-y-2">
                    {isLoading ? (
                      <div className="text-gray-400 text-sm text-center p-2">جاري التحميل...</div>
                    ) : !isAuthenticated ? (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full"
                          asChild
                        >
                          <Link
                            to="/login"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            تسجيل دخول
                          </Link>
                        </Button>
                        <Button size="sm" className="w-full" asChild>
                          <Link
                            to="/register"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            حساب جديد
                          </Link>
                        </Button>
                      </>
                    ) : isAuthenticated ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          handleLogout();
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors"
                      >
                        تسجيل خروج
                      </Button>
                    ) : null}
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
