import { useState, useEffect } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PostCard } from "@/components/PostCard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import EditProfileForm from "@/components/EditProfileForm";
import Navbar from "@/components/Navbar";

import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { postsApiService } from "@/services/postsApi";
import { formatError } from "@/utils";
import type { Post } from "@/types";
import { Edit, MapPin, Mail, Phone, Calendar, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
  const { user, isAuthenticated, isLoading, login } = useAuthContext();
  const { toast } = useToast();
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Redirect if not authenticated
  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Show loading state while checking authentication
  if (isLoading) {
    return <LoadingSpinner fullScreen text="جاري التحميل..." />;
  }

  // Show loading if user data is not available yet
  if (!user) {
    return <LoadingSpinner fullScreen text="جاري تحميل بيانات المستخدم..." />;
  }

  // Load user posts
  useEffect(() => {
    const loadUserPosts = async () => {
      try {
        setIsLoadingPosts(true);
        const allPosts = await postsApiService.getAllPosts();
        // Filter posts by current user's email since we're using email as identifier
        const filteredPosts = allPosts.filter(
          (post) => post.user.email === user?.email,
        );
        setUserPosts(filteredPosts);
      } catch (error) {
        console.error("Error loading user posts:", error);
      } finally {
        setIsLoadingPosts(false);
      }
    };

    if (user) {
      loadUserPosts();
    }
  }, [user]);

  const handleProfileUpdate = (updatedProfile: any) => {
    // Update the user in the auth context with the new data
    const updatedUser = {
      ...user,
      name: updatedProfile.name,
      phone: updatedProfile.phone,
      location: {
        ...(user?.location || {}),
        city: updatedProfile.city,
      },
      avatar: updatedProfile.image || user?.avatar,
    };
    
    // Update the auth context
    login(updatedUser);
    
    console.log('Profile updated:', updatedProfile);
    setIsEditDialogOpen(false);
    
    // Show success message
    toast({
      title: "تم التحديث بنجاح",
      description: "تم تحديث الملف الشخصي بنجاح",
    });
  };

  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ar-KW", {
      year: "numeric",
      month: "long",
    });
  };

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-900" dir="rtl">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <Avatar className="w-24 h-24 border-4 border-primary/20">
                <AvatarImage src={user?.avatar} alt={user?.name || "مستخدم"} />
                <AvatarFallback className="text-2xl font-bold">
                  {user?.name?.charAt(0) || "م"}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">
                      {user?.name || "مستخدم"}
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant={
                          user?.role === "plumber" ? "default" : "secondary"
                        }
                      >
                        {user?.role === "plumber"
                          ? "مختص فني صحي"
                          : user?.role === "admin"
                            ? "مدير"
                            : "مستخدم"}
                      </Badge>
                      {user?.role === "plumber" && (
                        <Badge
                          variant="outline"
                          className="text-green-600 border-green-600"
                        >
                          متحقق ✓
                        </Badge>
                      )}
                    </div>
                  </div>

                  <Dialog
                    open={isEditDialogOpen}
                    onOpenChange={setIsEditDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        تعديل الملف الشخصي
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="text-end">
                          تعديل الملف الشخصي
                        </DialogTitle>
                      </DialogHeader>
                      <EditProfileForm
                        onClose={() => setIsEditDialogOpen(false)}
                        currentProfile={{
                          name: user?.name || "",
                          email: user?.email || "",
                          phone: user?.phone || "",
                          bio: "",
                          city: user?.location?.city || "",
                          image: user?.avatar || "",
                        }}
                        onSave={handleProfileUpdate}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span className="text-sm text-blue-500">{user?.email || "غير محدد"}</span>
              </div>

              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span className="text-sm">{user?.phone || "غير محدد"}</span>
              </div>

              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">{user.location?.city || "غير محدد"}</span>
              </div>

              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">
                  انضم في {user?.joinDate ? formatJoinDate(user.joinDate) : "غير محدد"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Posts Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold">منشوراتي</h2>
            <Badge variant="outline">{userPosts.length}</Badge>
          </div>

          <Separator />

          {isLoadingPosts ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">
                جاري تحميل المنشورات...
              </p>
            </div>
          ) : userPosts.length > 0 ? (
            <div className="space-y-6">
              {userPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onPostUpdate={(updatedPost) => {
                    setUserPosts((prev) =>
                      prev.map((p) =>
                        p.id === updatedPost.id ? updatedPost : p,
                      ),
                    );
                  }}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12">
                <div className="text-center space-y-4">
                  <User className="h-12 w-12 text-muted-foreground mx-auto" />
                  <h3 className="text-lg font-medium">لا توجد منشورات بعد</h3>
                  <p className="text-muted-foreground">
                    لم تقم بنشر أي منشورات حتى الآن. ابدأ بمشاركة أسئلتك أو
                    خبراتك مع المجتمع.
                  </p>
                  <Button variant="outline" asChild>
                    <a href="/posts">تصفح المنشورات</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
