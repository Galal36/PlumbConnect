import { useState, useEffect } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import {
  BookOpen,
  Calendar,
  User,
  ArrowLeft,
  Tag,
  Edit,
  Trash2,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import Navbar from "@/components/Navbar";
import { formatTimeAgo } from "@/utils";
import { ROUTES } from "@/constants";
import { useAuthContext } from "@/contexts/AuthContext";
import DropdownMenu, { createEditDeleteItems } from "@/components/DropdownMenu";
import ConfirmDialog from "@/components/ConfirmDialog";
import { realApiService } from "@/services/realApi";
import { toast } from "sonner";

export default function ViewArticle() {
  const { id } = useParams();
  const { user } = useAuthContext();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [article, setArticle] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if coming from plumber profile
  const isFromProfile = window.location.search.includes("from=profile");

  // Fetch article data when component mounts
  useEffect(() => {
    const fetchArticle = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        setError(null);
        const articleData = await realApiService.getArticle(id);
        console.log('Fetched article:', articleData);
        setArticle(articleData);
      } catch (err) {
        console.error('Error fetching article:', err);
        setError('فشل في تحميل المقال');
        toast.error('فشل في تحميل المقال');
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-white">جاري تحميل المقال...</p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gray-900" dir="rtl">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-8 mb-6">
            <h2 className="text-2xl font-bold text-white mb-4">لم يتم العثور على المقال</h2>
            <p className="text-gray-300 mb-6">{error || 'المقال غير موجود أو تم حذفه'}</p>
            <Button asChild>
              <Link to="/articles">العودة إلى المقالات</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isArticleOwner = user?.id === article.user?.id;

  const handleDeleteArticle = async () => {
    setIsDeleting(true);
    try {
      await realApiService.deleteArticle(article.id);
      toast.success('تم حذف المقال بنجاح');

      // Redirect to articles list after deletion
      if (isFromProfile) {
        // If coming from profile, go back to profile
        window.history.back();
      } else {
        window.location.href = "/articles";
      }
    } catch (error) {
      console.error("Error deleting article:", error);
      toast.error('فشل في حذف المقال');
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleEditArticle = () => {
    // Navigate to edit article page
    window.location.href = `/articles/${article.id}/edit`;
  };

  return (
    <div className="min-h-screen bg-gray-900" dir="rtl">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link
              to={
                isFromProfile ? `/plumber/${article.user?.id}` : ROUTES.ARTICLES
              }
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {isFromProfile ? "العودة للصفحة الشخصية" : "العودة إلى المقالات"}
            </Link>
          </Button>
        </div>

        {/* Article Header */}
        <Card className="premium-card-gradient mb-6">
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Title */}
              <h1 className="text-3xl font-bold text-white leading-tight">
                {article.title}
              </h1>

              {/* Author and Meta Info */}
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <Link
                    to={`/plumber/${article.user?.id}`}
                    className="hover:opacity-80 transition-opacity"
                  >
                    <Avatar className="h-10 w-10 cursor-pointer hover:ring-2 hover:ring-primary/40 transition-all">
                      <AvatarImage src={article.user?.image} />
                      <AvatarFallback>
                        {article.user?.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  <div>
                    <Link
                      to={`/plumber/${article.user?.id}`}
                      className="text-white font-medium hover:text-primary transition-colors cursor-pointer"
                    >
                      {article.user?.name}
                    </Link>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatTimeAgo(article.created_at)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Edit/Delete Options for Article Owner */}
                {isArticleOwner && (
                  <DropdownMenu
                    items={createEditDeleteItems(handleEditArticle, () =>
                      setShowDeleteDialog(true),
                    )}
                  />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Article Image */}
        {article.image && (
          <div className="mb-6">
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-64 md:h-80 object-cover rounded-lg"
            />
          </div>
        )}

        {/* Article Content */}
        <Card className="premium-card-gradient">
          <CardContent className="p-6">
            <div className="prose prose-invert max-w-none">
              <div className="text-gray-300 leading-relaxed whitespace-pre-line">
                {article.description}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          title="حذف المقال"
          description="هل أنت متأكد من رغبتك في حذف هذا المقال؟ لا يمكن التراجع عن هذا الإجراء."
          onConfirm={handleDeleteArticle}
          isLoading={isDeleting}
        />
      </div>
    </div>
  );
}
