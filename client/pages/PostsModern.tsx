import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { LoadingState, ErrorState } from "@/components/ui/loading";
import { MessageCircle, Flag, Plus, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import ReportForm from "@/components/ReportForm";
import { useExperiences, useCreateReport } from "@/hooks/useApi";
import { useAuthContext } from "@/contexts/AuthContext";

export default function PostsModern() {
  const { data: posts, loading, error, refetch } = useExperiences();
  const { createReport, loading: reportLoading } = useCreateReport();
  const { user } = useAuthContext();

  const handleReport = async (
    postId: string,
    authorName: string,
    reason: string,
    details: string,
  ) => {
    try {
      await createReport({
        type: "post",
        targetId: postId,
        targetAuthor: authorName,
        reason,
        details,
        reporterId: user?.id || "anonymous",
        status: "pending",
      });
    } catch (error) {
      console.error("Failed to create report:", error);
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const postTime = new Date(timestamp);
    const diffInHours = Math.floor(
      (now.getTime() - postTime.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 1) return "منذ قليل";
    if (diffInHours < 24) return `منذ ${diffInHours} ساعة`;
    return `منذ ${Math.floor(diffInHours / 24)} يوم`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900" dir="rtl">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingState message="جاري تحميل الأعمال..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900" dir="rtl">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ErrorState message={error.message} onRetry={refetch} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900" dir="rtl">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              أعمال الفنيين
            </h1>
            <p className="text-gray-300">اكتشف أعمال وخبرات الفنيين الصحيين</p>
          </div>
          <Button asChild className="shadow-lg">
            <Link to="/posts/new">
              <Plus className="h-4 w-4 ms-2" />
              عمل جديد
            </Link>
          </Button>
        </div>

        {/* Posts List */}
        <div className="space-y-6">
          {posts && posts.length > 0 ? (
            posts.map((post) => (
              <Card
                key={post.id}
                className="premium-card-gradient hover:shadow-xl transition-all duration-300"
              >
                <CardContent className="p-6">
                  {/* Post Header */}
                  <div className="flex items-start gap-3 mb-4">
                    <Link to={`/plumber/${post.userId}`}>
                      <Avatar className="w-12 h-12 hover:ring-2 hover:ring-primary/40 transition-all cursor-pointer">
                        <AvatarImage src="/placeholder.svg" />
                        <AvatarFallback>
                          {post.userName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/plumber/${post.userId}`}
                          className="font-semibold text-white hover:text-primary transition-colors"
                        >
                          {post.userName}
                        </Link>
                        <Badge
                          variant="secondary"
                          className="bg-primary/10 text-primary text-xs"
                        >
                          مختص فني صحي
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <Clock className="h-3 w-3" />
                        <span>{formatTimeAgo(post.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {post.title}
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      {post.description}
                    </p>
                  </div>

                  {/* Post Images */}
                  {post.images.length > 0 && (
                    <div className="mb-4">
                      {post.images.length === 1 ? (
                        <img
                          src={post.images[0]}
                          alt="صورة العمل"
                          className="w-full h-64 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          {post.images.slice(0, 4).map((image, index) => (
                            <div key={index} className="relative">
                              <img
                                src={image}
                                alt={`صورة ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg"
                              />
                              {index === 3 && post.images.length > 4 && (
                                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                                  <span className="text-white font-semibold">
                                    +{post.images.length - 4}
                                  </span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Post Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2 text-gray-400">
                        <MessageCircle className="h-5 w-5" />
                        <span className="text-sm">تفاصيل العمل</span>
                      </div>
                      <ReportForm
                        type="post"
                        targetId={post.id}
                        targetAuthor={post.userName}
                      >
                        <button className="flex items-center gap-2 text-gray-400 hover:text-red-500 transition-colors">
                          <Flag className="h-5 w-5" />
                          <span className="text-sm">بلاغ</span>
                        </button>
                      </ReportForm>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/experience/${post.id}`}>عرض التفاصيل</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg mb-4">
                لا توجد أعمال لعرضها حالياً
              </p>
              <Button asChild>
                <Link to="/posts/new">إضافة أول عمل</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Load More */}
        {posts && posts.length > 0 && (
          <div className="text-center mt-8">
            <Button
              variant="outline"
              className="min-w-[200px]"
              onClick={refetch}
            >
              تحديث البيانات
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
