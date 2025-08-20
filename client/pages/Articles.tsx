import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Wrench,
  Plus,
  Search,
  BookOpen,
  Calendar,
  User,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { ROUTES } from "@/constants";
import { useAuthContext } from "@/contexts/AuthContext";
import SEOHead from "@/components/SEOHead";
import { generateSEOConfig } from "@/hooks/useSEO";
import LazyImage from "@/components/LazyImage";
import DropdownMenu, { createEditDeleteItems } from "@/components/DropdownMenu";
import ConfirmDialog from "@/components/ConfirmDialog";
import EditArticleDialog from "@/components/EditArticleDialog";
import { realApiService, Article } from "@/services/realApi";
import { toast } from "sonner";

export default function Articles() {
  const { isAuthenticated, isPlumber, isAdmin, user } = useAuthContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approvingArticles, setApprovingArticles] = useState<Set<string>>(new Set());
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [articleToEdit, setArticleToEdit] = useState<Article | null>(null);

  // Debug: Log articles state changes
  useEffect(() => {
    console.log('Articles state updated:', articles);
    console.log('Articles type:', typeof articles);
    console.log('Is array:', Array.isArray(articles));
  }, [articles]);

  const seoConfig = generateSEOConfig({
    title: "مقالات السباكة - دليلك الشامل",
    description:
      "دليلك الشامل لكل ما يخص السباكة والصيانة. مقالات من خبراء الفنيين الصحيين في الكويت لتعليمك أفضل الطرق للصيانة والإصلاح.",
    keywords:
      "مقالات سباكة، دليل السباكة، صيانة سخان الماء، إصلاح الحنفيات، مشاكل المجاري، فني صحي الكويت",
    url: "/articles",
    type: "website",
  });

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Check if user is authenticated
        if (!isAuthenticated) {
          console.log('User not authenticated, skipping articles fetch');
          setArticles([]);
          return;
        }
        
        // Check if we have a valid user
        if (!user) {
          console.log('No user data, skipping articles fetch');
          setArticles([]);
          return;
        }
        
        // Small delay to ensure authentication state is stable
        await new Promise(resolve => setTimeout(resolve, 100));
        
        console.log('Fetching articles for user:', user.id, 'Role:', user.role);
        const data = await realApiService.getArticles();
        console.log('Articles API response:', data); // Debug log
        
        // Ensure data is an array
        if (Array.isArray(data)) {
          console.log('Setting articles array:', data);
          setArticles(data);
        } else if (data && typeof data === 'object' && 'results' in data && Array.isArray((data as any).results)) {
          // Handle paginated response
          console.log('Setting articles from results:', (data as any).results);
          setArticles((data as any).results);
        } else if (data && typeof data === 'object' && 'data' in data && Array.isArray((data as any).data)) {
          // Handle nested data response
          console.log('Setting articles from data:', (data as any).data);
          setArticles((data as any).data);
        } else {
          console.error('Unexpected articles response structure:', data);
          setArticles([]);
          setError("Unexpected data format from server");
        }
      } catch (err) {
        console.error('Error fetching articles:', err);
        setError("Failed to fetch articles");
        setArticles([]); // Ensure articles is always an array
        toast.error("Failed to fetch articles");
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, [isAuthenticated, user]);

  const filteredArticles = (articles || []).filter((article) => {
    // Handle admin filters
    if (searchQuery === "pending") {
      return !article.is_approved;
    }
    if (searchQuery === "approved") {
      return article.is_approved;
    }
    
    // Handle search query
    if (searchQuery) {
      const matchesSearch =
        article.title.includes(searchQuery) ||
        article.description.includes(searchQuery);
      return matchesSearch;
    }
    
    return true;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ar-KW");
  };

  const handleDeleteArticle = async () => {
    if (!articleToDelete) return;

    setIsDeleting(true);
    try {
      await realApiService.deleteArticle(articleToDelete);
      setArticles((prev) => prev.filter((article) => article.id !== articleToDelete));
      toast.success("Article deleted successfully");
    } catch (error) {
      toast.error("Failed to delete article");
      console.error("Error deleting article:", error);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
      setArticleToDelete(null);
    }
  };

  const handleEditArticle = (article: Article) => {
    setArticleToEdit(article);
    setShowEditDialog(true);
  };

  const handleSaveEditedArticle = async (updatedArticle: Article) => {
    try {
      // Update the article in the backend
      const savedArticle = await realApiService.updateArticle(updatedArticle.id, {
        title: updatedArticle.title,
        description: updatedArticle.description,
      });
      
      // Update the local state
      setArticles(prev => 
        prev.map(article => 
          article.id === updatedArticle.id ? savedArticle : article
        )
      );
      
      toast.success("تم تحديث المقال بنجاح");
      setShowEditDialog(false);
      setArticleToEdit(null);
    } catch (error) {
      toast.error("فشل في تحديث المقال");
      console.error("Error updating article:", error);
    }
  };

  const handleApproveArticle = async (articleId: string, isApproved: boolean) => {
    try {
      setApprovingArticles(prev => new Set(prev).add(articleId));
      await realApiService.approveArticle(articleId, isApproved);
      setArticles((prev) =>
        prev.map((article) =>
          article.id === articleId
            ? { ...article, is_approved: isApproved }
            : article
        )
      );
      toast.success(`Article ${isApproved ? 'approved' : 'rejected'} successfully`);
    } catch (error) {
      toast.error("Failed to update article status");
      console.error("Error updating article:", error);
    } finally {
      setApprovingArticles(prev => {
        const newSet = new Set(prev);
        newSet.delete(articleId);
        return newSet;
      });
    }
  };

  return (
    <>
      <SEOHead config={seoConfig} />
      <div className="min-h-screen bg-gray-900" dir="rtl">
        <Navbar />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                مقالات السباكة
              </h1>
              <p className="text-gray-300">
                دليلك الشامل لكل ما يخص السباكة والصيانة
              </p>
            </div>
            {/* Only show Add Article button for authenticated plumbers */}
            {isAuthenticated && isPlumber && (
              <Button asChild className="shadow-lg">
                <Link to={ROUTES.ADD_ARTICLE}>
                  <Plus className="h-4 w-4 ms-2" />
                  كتابة مقال
                </Link>
              </Button>
            )}
            {/* Refresh button for admins */}
            {isAuthenticated && isAdmin && (
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="shadow-lg"
              >
                <RefreshCw className="h-4 w-4 ms-2" />
                تحديث
              </Button>
            )}
          </div>

          {/* Search and Filter */}
          <Card className="premium-card-gradient mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      type="text"
                      placeholder="ابحث في المقالات..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="text-end pe-10"
                    />
                  </div>
                </div>
                {/* Admin Filter */}
                {isAdmin && (
                  <div className="flex gap-2">
                    <Button
                      variant={searchQuery === "" ? "default" : "outline"}
                      onClick={() => setSearchQuery("")}
                      size="sm"
                    >
                      الكل
                    </Button>
                    <Button
                      variant={searchQuery === "pending" ? "default" : "outline"}
                      onClick={() => setSearchQuery("pending")}
                      size="sm"
                    >
                      <Clock className="h-4 w-4 ms-1" />
                      في الانتظار
                    </Button>
                    <Button
                      variant={searchQuery === "approved" ? "default" : "outline"}
                      onClick={() => setSearchQuery("approved")}
                      size="sm"
                    >
                      <CheckCircle className="h-4 w-4 ms-1" />
                      معتمد
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Articles Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
              <div className="col-span-full text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-300">جاري تحميل المقالات...</p>
              </div>
            ) : error ? (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-300">{error}</p>
              </div>
            ) : !Array.isArray(articles) ? (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-300">خطأ في تحميل المقالات</p>
              </div>
            ) : filteredArticles.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">
                  لا توجد مقالات
                </h3>
                <p className="text-gray-300">جرب تغيير كلمات البحث أو الفئة</p>
              </div>
            ) : (
              filteredArticles.map((article) => (
                <Card
                  key={article.id}
                  className="premium-card-gradient hover:shadow-2xl transition-all duration-300 hover:scale-105"
                >
                  <CardContent className="p-0">
                    <div className="relative">
                      <LazyImage
                        src={article.image || "/placeholder.svg"}
                        alt={`صورة مقال ${article.title} - دليل من خبير فني صحي في الكويت`}
                        className="w-full h-48 object-cover rounded-t-lg"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-6">
                      {/* Status Badge */}
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-semibold text-white line-clamp-2 flex-1">
                            {article.title}
                          </h3>
                          {article.is_approved ? (
                            <Badge variant="default" className="bg-green-600">
                              <CheckCircle className="h-3 w-3 ms-1" />
                              معتمد
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-yellow-600">
                              <Clock className="h-3 w-3 ms-1" />
                              في الانتظار
                            </Badge>
                          )}
                        </div>
                        {user?.id === article.user.id && (
                          <DropdownMenu
                            items={createEditDeleteItems(
                              () => handleEditArticle(article),
                              () => {
                                setArticleToDelete(article.id);
                                setShowDeleteDialog(true);
                              },
                            )}
                          />
                        )}
                      </div>
                      <p className="text-gray-300 mb-4 line-clamp-3">
                        {article.description}
                      </p>

                      {/* AI Review Information for Admins */}
                      {isAdmin && article.ai_review_summary && (
                        <div className="mb-4 p-3 bg-blue-900/20 rounded-lg border border-blue-700/30">
                          <h4 className="text-sm font-semibold text-blue-300 mb-2">AI Review</h4>
                          <p className="text-xs text-blue-200 mb-2">{article.ai_review_summary}</p>
                          {article.ai_review_score && (
                            <p className="text-xs text-blue-300">
                              Score: {article.ai_review_score}/10
                            </p>
                          )}
                          {article.ai_review_concerns && (
                            <div className="mt-2">
                              {article.ai_review_concerns.safety.length > 0 && (
                                <p className="text-xs text-yellow-300">
                                  Safety concerns: {article.ai_review_concerns.safety.join(', ')}
                                </p>
                              )}
                              {article.ai_review_concerns.inappropriate && (
                                <p className="text-xs text-red-300">⚠️ Inappropriate content detected</p>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Admin Approval Buttons */}
                      {isAdmin && !article.is_approved && (
                        <div className="flex gap-2 mb-4">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleApproveArticle(article.id, true)}
                            disabled={approvingArticles.has(article.id)}
                          >
                            {approvingArticles.has(article.id) ? (
                              <Clock className="h-4 w-4 ms-1 animate-spin" />
                            ) : (
                              <CheckCircle className="h-4 w-4 ms-1" />
                            )}
                            اعتماد
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleApproveArticle(article.id, false)}
                            disabled={approvingArticles.has(article.id)}
                          >
                            {approvingArticles.has(article.id) ? (
                              <Clock className="h-4 w-4 ms-1 animate-spin" />
                            ) : (
                              <XCircle className="h-4 w-4 ms-1" />
                            )}
                            رفض
                          </Button>
                        </div>
                      )}

                      {/* Author Info */}
                      <div className="flex items-center gap-3 mb-4">
                        <Link
                          to={`/plumber/${article.user.id}`}
                          className="hover:opacity-80 transition-opacity"
                        >
                          <Avatar className="w-8 h-8 cursor-pointer hover:ring-2 hover:ring-primary/40 transition-all">
                            <AvatarImage src={article.user.image} />
                            <AvatarFallback>
                              {article.user.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        </Link>
                        <div className="flex-1">
                          <Link
                            to={`/plumber/${article.user.id}`}
                            className="text-sm font-semibold text-white hover:text-primary transition-colors cursor-pointer"
                          >
                            {article.user.name}
                          </Link>
                          <p className="text-xs text-gray-400">
                            {formatDate(article.created_at)}
                          </p>
                        </div>
                      </div>

                      <Button className="w-full" asChild>
                        <Link to={`/articles/${article.id}`}>
                          <BookOpen className="h-4 w-4 ms-2" />
                          قراءة المقال
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Load More */}
          {filteredArticles.length > 0 && (
            <div className="text-center mt-8">
              <Button variant="outline" className="min-w-[200px]">
                تحميل المزيد
              </Button>
            </div>
          )}

          {/* Delete Confirmation Dialog */}
          <ConfirmDialog
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
            title="حذف المقال"
            description="هل أنت متأكد من رغبتك في حذف هذا المقال؟ لا يمكن التراجع عن هذا الإجراء."
            onConfirm={handleDeleteArticle}
            isLoading={isDeleting}
          />

          {/* Edit Article Dialog */}
          {articleToEdit && (
            <EditArticleDialog
              open={showEditDialog}
              onOpenChange={setShowEditDialog}
              article={{
                id: articleToEdit.id,
                title: articleToEdit.title,
                description: articleToEdit.description,
                publishDate: articleToEdit.created_at,
              }}
              onSave={handleSaveEditedArticle}
            />
          )}
        </div>
      </div>
    </>
  );
}
