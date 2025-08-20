import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Wrench,
  Image as ImageIcon,
  X,
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useState, useRef, useCallback } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useAuthContext } from "@/contexts/AuthContext";
import { validatePost, validateImage, formatError } from "@/utils";
import { VALIDATION_RULES } from "@/constants";
import { postsApiService } from "@/services/postsApi"; // ✅ تم الاستيراد

interface ValidationErrors {
  content?: string;
  images?: string;
  general?: string;
}

export default function AddPost() {
  const { isAuthenticated, isLoading } = useAuthContext();
  const [content, setContent] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const validateForm = useCallback((): boolean => {
    const newErrors: ValidationErrors = {};

    const contentError = validatePost(content);
    if (contentError) {
      newErrors.content = contentError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [content]);

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

      setErrors((prev) => ({ ...prev, images: undefined }));

      const newImages = [...images, ...validFiles];
      setImages(newImages);

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
        const formData = new FormData();
        formData.append("statement", content);
        images.forEach((image) => {
          formData.append("image", image);
        });

        // ✅ الاستدعاء الفعلي للـ API
        await postsApiService.createPost(formData);

        setIsSubmitted(true);
        setTimeout(() => {
          navigate("/posts");
        }, 2000);
      } catch (error) {
        setErrors({ general: formatError(error) });
      } finally {
        setIsSubmitting(false);
      }
    },
    [content, images, validateForm, navigate],
  );

  if (isSubmitted) {
    return (
      <div
        className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4"
        dir="rtl"
      >
        <Card className="w-full max-w-md premium-card-gradient">
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">
              تم نشر البوست!
            </h2>
            <p className="text-gray-300 mb-6">
              تم نشر بوستك بنجاح. سيتم توجيهك إلى صفحة البوستات قريباً.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900" dir="rtl">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            إنشاء بوست جديد
          </h1>
          <p className="text-gray-300">شارك خبرتك أو اطرح سؤالاً للمجتمع</p>
        </div>

        <Card className="premium-card-gradient">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <span>محتوى البوست</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {errors.general && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.general}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="content">المحتوى *</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  className={`text-end min-h-[150px] ${errors.content ? "border-destructive" : ""}`}
                  placeholder="اكتب محتوى البوست هنا... شارك خبرتك، اطرح سؤالاً، أو احك عن تجربتك"
                  aria-describedby={
                    errors.content ? "content-error" : undefined
                  }
                />
                {errors.content && (
                  <p id="content-error" className="text-sm text-destructive">
                    {errors.content}
                  </p>
                )}
                <div className="flex justify-between text-sm text-gray-400">
                  <span
                    className={
                      content.length < VALIDATION_RULES.POST_MIN_LENGTH
                        ? "text-orange-400"
                        : ""
                    }
                  >
                    {content.length} حرف
                  </span>
                  <span>
                    الحد الأدنى: {VALIDATION_RULES.POST_MIN_LENGTH} أحرف
                  </span>
                </div>
              </div>

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

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">
                  إرشادات النشر:
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• احترم الآخرين وكن مهذباً في التعامل</li>
                  <li>• شارك محتوى مفيد ومناسب للمجتمع</li>
                  <li>• لا تنشر معلومات شخصية حساسة</li>
                  <li>• تأكد من صحة المعلومات قبل النشر</li>
                </ul>
              </div>

              <div className="flex items-center justify-between pt-6 border-t">
                <Button variant="outline" asChild>
                  <Link to="/posts">إلغاء</Link>
                </Button>
                <div className="flex items-center gap-3">
                  <Button type="button" variant="ghost">
                    حفظ كمسودة
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      isSubmitting ||
                      content.length < VALIDATION_RULES.POST_MIN_LENGTH
                    }
                    className="min-w-[120px]"
                  >
                    {isSubmitting ? "جاري النشر..." : "نشر البوست"}
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