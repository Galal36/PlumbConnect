import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BookOpen,
  Image as ImageIcon,
  X,
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Clock,
} from "lucide-react";
import { useState, useRef, useCallback } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useAuthContext } from "@/contexts/AuthContext";
import { validateImage, formatError } from "@/utils";
import { VALIDATION_RULES } from "@/constants";
import { realApiService } from "@/services/realApi";

interface ValidationErrors {
  title?: string;
  content?: string;
  images?: string;
  general?: string;
}

export default function AddArticle() {
  const { isAuthenticated, isLoading, isPlumber } = useAuthContext();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Redirect to login if not authenticated, or to articles if not a plumber
  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to articles page if user is authenticated but not a plumber
  if (!isLoading && isAuthenticated && !isPlumber) {
    return <Navigate to="/articles" replace />;
  }

  const validateForm = useCallback((): boolean => {
    const newErrors: ValidationErrors = {};

    // Title validation
    if (!title.trim()) {
      newErrors.title = "يرجى إدخال عنوان المقال";
    } else if (title.trim().length < 5) {
      newErrors.title = "يجب أن يكون العنوان 5 أحرف على الأقل";
    } else if (title.trim().length > 100) {
      newErrors.title = "يجب أن يكون العنوان 100 حرف أو أقل";
    }

    // Content validation
    if (!content.trim()) {
      newErrors.content = "يرجى إدخال محتوى المقال";
    } else if (content.trim().length < 100) {
      newErrors.content = "يجب أن يكون المحتوى 100 حرف على الأقل";
    } else if (content.trim().length > 5000) {
      newErrors.content = "يجب أن يكون المحتوى 5000 حرف أو أقل";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [title, content]);

  const handleTitleChange = useCallback(
    (value: string) => {
      setTitle(value);
      if (errors.title) {
        setErrors((prev) => ({ ...prev, title: undefined }));
      }
    },
    [errors.title],
  );

  const handleContentChange = useCallback(
    (value: string) => {
      setContent(value);
      if (errors.content) {
        setErrors((prev) => ({ ...prev, content: undefined }));
      }
    },
    [errors.content],
  );

  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      const maxImages = 5;
      const validationErrors: string[] = [];

      if (images.length + files.length > maxImages) {
        setErrors((prev) => ({
          ...prev,
          images: `يمكنك رفع ${maxImages} صور كحد أقصى`,
        }));
        return;
      }

      // Validate each file
      const validFiles: File[] = [];
      for (const file of files) {
        const validationError = validateImage(file);
        if (validationError) {
          validationErrors.push(`${file.name}: ${validationError}`);
        } else {
          validFiles.push(file);
        }
      }

      if (validationErrors.length > 0) {
        setErrors((prev) => ({ ...prev, images: validationErrors.join("\n") }));
        return;
      }

      // Clear any previous image errors
      setErrors((prev) => ({ ...prev, images: undefined }));

      const newImages = [...images, ...validFiles];
      setImages(newImages);

      // Create previews
      const newPreviews = [...imagePreviews];
      validFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          newPreviews.push(e.target?.result as string);
          setImagePreviews([...newPreviews]);
        };
        reader.readAsDataURL(file);
      });
    },
    [images, imagePreviews],
  );

  const removeImage = useCallback(
    (index: number) => {
      const newImages = images.filter((_, i) => i !== index);
      const newPreviews = imagePreviews.filter((_, i) => i !== index);
      setImages(newImages);
      setImagePreviews(newPreviews);
      // Clear image errors if any
      if (errors.images) {
        setErrors((prev) => ({ ...prev, images: undefined }));
      }
    },
    [images, imagePreviews, errors.images],
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) {
        return;
      }

      setIsSubmitting(true);
      setErrors({});

      try {
        // Use real API to create article
        const articleData = {
          title: title.trim(),
          description: content.trim(),
          image: images.length > 0 ? images[0] : undefined,
        };

        await realApiService.createArticle(articleData);
        setIsSubmitted(true);
        
        // Show success message for 3 seconds then redirect
        setTimeout(() => {
          navigate("/articles");
        }, 3000);
      } catch (error) {
        console.error('Error creating article:', error);
        setErrors({ general: formatError(error) });
      } finally {
        setIsSubmitting(false);
      }
    },
    [title, content, images, validateForm, navigate],
  );

  if (isSubmitted) {
    return (
      <div
        className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4"
        dir="rtl"
      >
        <Card className="w-full max-w-md premium-card-gradient">
          <CardContent className="p-8 text-center">
            <Clock className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">
              تم إرسال المقال!
            </h2>
            <p className="text-gray-300 mb-6">
              تم إرسال مقالك بنجاح. سيتم مراجعته من قبل فريق الإدارة والذكاء الاصطناعي قبل النشر.
            </p>
            <p className="text-sm text-gray-400 mb-6">
              ستتلقى إشعاراً عند الموافقة على المقال.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900" dir="rtl">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            كتابة مقال جديد
          </h1>
          <p className="text-gray-300">
            شارك معرفتك وخبرتك مع مجتمع الفنيين الصحيين
          </p>
        </div>

        <Card className="premium-card-gradient">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              <span>تفاصيل المقال</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {errors.general && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.general}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6" dir="rtl">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">عنوان المقال *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className={`text-end ${errors.title ? "border-destructive" : ""}`}
                  placeholder="اكتب عنواناً جذاباً ووصفياً للمقال"
                  dir="rtl"
                  aria-describedby={errors.title ? "title-error" : undefined}
                />
                {errors.title && (
                  <p id="title-error" className="text-sm text-destructive">
                    {errors.title}
                  </p>
                )}
                <div className="flex justify-between text-sm text-gray-400">
                  <span className={title.length < 5 ? "text-orange-400" : ""}>
                    {title.length} حرف
                  </span>
                  <span>الحد الأدنى: 5 أحرف</span>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-2">
                <Label htmlFor="content">محتوى المقال *</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  className={`text-end min-h-[300px] ${errors.content ? "border-destructive" : ""}`}
                  dir="rtl"
                  aria-describedby={
                    errors.content ? "content-error" : undefined
                  }
                  placeholder="اكتب محتوى المقال هنا... شارك معرفتك، خبرتك، أو نصائحك المهنية بالتفصيل"
                />
                {errors.content && (
                  <p id="content-error" className="text-sm text-destructive">
                    {errors.content}
                  </p>
                )}
                <div className="flex justify-between text-sm text-gray-400">
                  <span
                    className={content.length < 100 ? "text-orange-400" : ""}
                  >
                    {content.length} حرف
                  </span>
                  <span>الحد الأدنى: 100 حرف</span>
                </div>
              </div>

              {/* Image Upload */}
              <div className="space-y-4">
                <Label>الصور (اختياري)</Label>
                {errors.images && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="whitespace-pre-line">
                      {errors.images}
                    </AlertDescription>
                  </Alert>
                )}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <div className="flex flex-col items-center">
                    <Upload className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-300 mb-2">
                      اسحب الصور هنا أو اضغط للاختيار
                    </p>
                    <p className="text-sm text-gray-400 mb-4">
                      PNG, JPG, GIF حتى 5 صور (حجم أقصى 5MB لكل صورة)
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <ImageIcon className="h-4 w-4 ms-2" />
                      اختيار الصور
                    </Button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>

                {/* Image Previews */}
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        <img
                          src={preview}
                          alt={`معاينة ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -left-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Guidelines */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">
                  إرشادات كتابة المقالات:
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• اكتب مقالاً مفيداً ومفصلاً يساعد القراء</li>
                  <li>• استخدم لغة واضحة ومفهومة</li>
                  <li>• أضف الصور التوضيحية عند الحاجة</li>
                  <li>• تأكد من دقة المعلومات الفنية</li>
                  <li>• اختر عنواناً جذاباً ووصفياً</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-6 border-t">
                <Button variant="outline" asChild>
                  <Link to="/articles">إلغاء</Link>
                </Button>
                <div className="flex items-center gap-3">
                  <Button type="button" variant="ghost">
                    حفظ كمسودة
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      isSubmitting ||
                      title.length < 5 ||
                      content.length < 100 ||
                      false
                    }
                    className="min-w-[120px]"
                  >
                    {isSubmitting ? "جاري النشر..." : "نشر المقال"}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
