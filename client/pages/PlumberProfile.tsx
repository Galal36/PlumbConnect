import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthContext } from "../contexts/AuthContext";
import EditProfileForm from "../components/EditProfileForm";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Clock, CheckCircle, XCircle, User, Phone, MapPin, Star, BookOpen } from "lucide-react";
import { toast } from "sonner";
import realApiService from "../services/realApi";
import Navbar from "../components/Navbar";

interface Article {
  id: string;
  title: string;
  description: string;
  image?: string;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
  ai_review_score?: number;
  ai_review_summary?: string;
  ai_review_concerns?: {
    safety: string[];
    inappropriate: boolean;
  };
}

const PlumberProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser, login } = useAuthContext();
  const [plumber, setPlumber] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoadingArticles, setIsLoadingArticles] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  
  // Check if the current user is viewing their own profile
  const isOwner = currentUser && plumber && currentUser.id === plumber.id;

  // Fetch plumber data when component mounts
  useEffect(() => {
    const fetchPlumberData = async () => {
      try {
        setIsLoading(true);
        
        // If no ID is provided in URL but user is a plumber, show their own profile
        if (!id && currentUser?.role === "plumber") {
          setPlumber(currentUser);
          setIsLoading(false);
          return;
        }
        
        // If ID is provided, fetch that specific plumber
        if (id) {
          const plumberData = await realApiService.getUser(id);
          setPlumber(plumberData);
        } else {
          toast.error("معرف السباك غير صحيح");
          navigate("/plumbers");
        }
      } catch (error) {
        console.error('Error fetching plumber data:', error);
        toast.error("فشل في تحميل بيانات السباك");
        navigate("/plumbers");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlumberData();
  }, [id, navigate, currentUser]);

  useEffect(() => {
    if (isOwner && plumber) {
      fetchUserArticles();
    }
  }, [isOwner, plumber]);

  const fetchUserArticles = async () => {
    try {
      setIsLoadingArticles(true);
      const data = await realApiService.getArticles();
      
      // Filter articles to show only the current plumber's articles
      if (Array.isArray(data)) {
        const userArticles = data.filter(article => article.user?.id === plumber?.id);
        setArticles(userArticles);
      } else if (data && typeof data === 'object' && 'results' in data && Array.isArray((data as any).results)) {
        const userArticles = (data as any).results.filter((article: any) => article.user?.id === plumber?.id);
        setArticles(userArticles);
      } else if (data && typeof data === 'object' && 'data' in data && Array.isArray((data as any).data)) {
        const userArticles = (data as any).data.filter((article: any) => article.user?.id === plumber?.id);
        setArticles(userArticles);
      } else {
        setArticles([]);
      }
    } catch (error) {
      console.error('Error fetching user articles:', error);
      toast.error("فشل في تحميل المقالات");
      setArticles([]);
    } finally {
      setIsLoadingArticles(false);
    }
  };

  const handleSaveProfile = (updatedUser: any) => {
    login(updatedUser);
    setIsEditing(false);
    toast.success("تم تحديث الملف الشخصي بنجاح");
  };

  const handleDeleteArticle = async (articleId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المقال؟')) {
      try {
        await realApiService.deleteArticle(articleId);
        toast.success("تم حذف المقال بنجاح");
        // Refresh articles list
        fetchUserArticles();
    } catch (error) {
        console.error('Error deleting article:', error);
        toast.error("فشل في حذف المقال");
      }
    }
  };

  const getStatusBadge = (isApproved: boolean) => {
    if (isApproved) {
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          <CheckCircle className="w-3 h-3 mr-1" />
          معتمد
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
          <Clock className="w-3 h-3 mr-1" />
          في الانتظار
        </Badge>
      );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!plumber) {
    return <div>Plumber not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900" dir="rtl">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">الملف الشخصي</h1>
            <p className="text-gray-300">إدارة معلوماتك الشخصية والمقالات</p>
          </div>
          {isOwner && (
            <Button
              onClick={() => setIsEditing(true)}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              تعديل الملف الشخصي
            </Button>
          )}
        </div>
        <Card className="mb-8">
          <CardHeader className="text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                {plumber?.image ? (
                  <img
                    src={plumber.image}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-4 border-primary/20"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center border-4 border-primary/20">
                    <span className="text-3xl font-bold text-white">
                      {plumber?.name ? plumber.name.charAt(0).toUpperCase() : 'U'}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{plumber?.name}</h2>
                <p className="text-gray-300">{plumber?.email}</p>
                <p className="text-gray-400 text-sm">{plumber?.phone || 'لا يوجد رقم هاتف'}</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Profile Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">الملف الشخصي</TabsTrigger>
            {isOwner && <TabsTrigger value="articles">المقالات</TabsTrigger>}
            <TabsTrigger value="experience">الخبرات المهنية</TabsTrigger>
            <TabsTrigger value="contact">معلومات الاتصال</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <User className="w-5 h-5 mr-2" />
                  المعلومات الشخصية
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">الاسم</label>
                    <p className="text-white text-lg">{plumber?.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">البريد الإلكتروني</label>
                    <p className="text-white text-lg">{plumber?.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">رقم الهاتف</label>
                    <p className="text-white text-lg">{plumber?.phone || 'غير محدد'}</p>
            </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">الموقع</label>
                    <p className="text-white text-lg">{plumber?.location?.city || 'غير محدد'}</p>
                    </div>
                    </div>
                  </CardContent>
                </Card>
          </TabsContent>

          {/* Articles Tab - Only for owner */}
          {isOwner && (
            <TabsContent value="articles" className="mt-6">
            <Card>
              <CardHeader>
            <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center text-white">
                    <BookOpen className="w-5 h-5 mr-2" />
                    المقالات المنشورة
                  </CardTitle>
                  <Button 
                    onClick={fetchUserArticles} 
                    variant="outline" 
                    size="sm"
                    disabled={isLoadingArticles}
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    تحديث
                </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingArticles ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-white">جاري تحميل المقالات...</p>
            </div>
                ) : articles.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-white mb-2">
                      لا توجد مقالات
                      </h3>
                    <p className="text-gray-300">لم تقم بنشر أي مقالات بعد</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {articles.map((article) => (
                      <div key={article.id} className="border border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow bg-gray-800">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-lg font-semibold text-white">{article.title}</h3>
                          {getStatusBadge(article.is_approved)}
                        </div>
                        <p className="text-gray-300 mb-3 line-clamp-3">{article.description}</p>
                        <div className="flex items-center justify-between text-sm text-gray-400">
                          <span>تاريخ النشر: {formatDate(article.created_at)}</span>
                          {article.ai_review_score && (
                            <div className="flex items-center">
                              <Star className="w-4 h-4 text-yellow-500 mr-1" />
                              <span>تقييم الذكاء الاصطناعي: {article.ai_review_score}/2</span>
                            </div>
                          )}
                        </div>
                        {article.ai_review_summary && (
                          <div className="mt-3 p-3 bg-gray-700 rounded-lg">
                            <h4 className="font-medium text-white mb-2">ملخص المراجعة:</h4>
                            <p className="text-gray-300 text-sm">{article.ai_review_summary}</p>
                    </div>
                        )}
                        {isOwner && (
                          <div className="mt-4 flex space-x-2 space-x-reverse">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteArticle(article.id)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-900/20 border-red-600"
                            >
                              حذف المقال
                      </Button>
                    </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                  </CardContent>
                </Card>
            </TabsContent>
          )}

          {/* Experience Tab */}
          <TabsContent value="experience" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-white">الخبرات المهنية</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">محتوى الخبرات المهنية سيتم إضافته هنا</p>
                  </CardContent>
                </Card>
          </TabsContent>

          {/* Contact Tab */}
          <TabsContent value="contact" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-white">معلومات الاتصال</CardTitle>
              </CardHeader>
              <CardContent>
            <div className="space-y-4">
                          <div className="flex items-center">
                    <Phone className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-white text-lg">{plumber?.phone || 'غير محدد'}</span>
                          </div>
                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-white text-lg">{plumber?.location?.city || 'غير محدد'}</span>
                  </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
        </Tabs>

        {/* Edit Profile Dialog */}
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-end">
                تعديل الملف الشخصي
              </DialogTitle>
            </DialogHeader>
            <EditProfileForm
              onClose={() => setIsEditing(false)}
              currentProfile={{
                name: plumber?.name || '',
                email: plumber?.email || '',
                phone: plumber?.phone || '',
                bio: '', // User doesn't have bio field
                city: plumber?.location?.city || '',
                image: plumber?.image || '', // Use image field from plumber
              }}
              onSave={handleSaveProfile}
              userRole="plumber"
            />
          </DialogContent>
        </Dialog>
        </div>
      </div>
    </div>
  );
};

export default PlumberProfile;
