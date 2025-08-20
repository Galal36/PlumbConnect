import { useState } from "react";
import { Plus, Image as ImageIcon, X, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { postsApiService } from "@/services/postsApi"; // Corrected import
import { useAuthContext } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import type { Post } from "@/types"; // Import Post type

interface CreatePostDialogProps {
  onPostCreated?: (post: Post) => void;
}

export function CreatePostDialog({ onPostCreated }: CreatePostDialogProps) {
  const { isAuthenticated, user } = useAuthContext();
  const [open, setOpen] = useState(false);
  const [statement, setStatement] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});

  // If user is not authenticated, show login prompt
  if (!isAuthenticated) {
    return (
      <div className="w-full mb-6 p-4 bg-card border border-border rounded-lg">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">انضم للمناقشة</h3>
          <p className="text-muted-foreground mb-4">
            سجل دخول لتتمكن من إنشاء منشورات جديدة ومشاركة تجاربك
          </p>
          <div className="flex gap-2 justify-center">
            <Button asChild>
              <Link to="/login">تسجيل دخول</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/register">حساب جديد</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview("");
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!statement.trim()) {
      errors.statement = "يرجى كتابة نص المنشور";
    } else if (statement.trim().length < 10) {
      errors.statement = "يجب أن يكون نص المنشور 10 أحرف على الأقل";
    } else if (statement.trim().length > 500) {
      errors.statement = "يجب أن يكون نص المنشور 500 حرف أو أقل";
    }

    if (image && image.size > 5 * 1024 * 1024) {
      // 5MB limit
      errors.image = "يجب أن يكون حجم الصورة أقل من 5 ميجابايت";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("statement", statement.trim());
      if (image) {
        formData.append("image", image);
      }
      
      const newPost = await postsApiService.createPost(formData);

      if (onPostCreated) {
        onPostCreated(newPost);
      }

      // Reset form
      setStatement("");
      setImage(null);
      setImagePreview("");
      setOpen(false);
    } catch (error) {
      console.error("Error creating post:", error);
      setError("فشل في إنشاء المنشور. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full mb-6">
          <Plus className="h-4 w-4 ms-2" />
          إنشاء منشور جديد
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>إنشاء منشور جديد</DialogTitle>
        </DialogHeader>

        <div className="space-y-4" dir="rtl">
          {/* User Info */}
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback>{user?.name?.charAt(0) || "م"}</AvatarFallback>
            </Avatar>
            <div>
              <h4 className="text-sm font-medium">{user?.name || "مستخدم"}</h4>
              <p className="text-xs text-muted-foreground">
                {user?.role === "plumber"
                  ? "فني صحي"
                  : user?.role === "admin"
                    ? "مدير"
                    : "مستخدم"}
              </p>
            </div>
          </div>

          {/* Statement Input */}
          <div className="space-y-2">
            <Label htmlFor="statement">نص المنشور</Label>
            <Textarea
              id="statement"
              placeholder="اكتب سؤالك أو تجربتك هنا..."
              value={statement}
              onChange={(e) => {
                setStatement(e.target.value);
                if (validationErrors.statement) {
                  setValidationErrors((prev) => ({ ...prev, statement: "" }));
                }
              }}
              className={`min-h-[120px] resize-none text-end ${
                validationErrors.statement ? "border-destructive" : ""
              }`}
              dir="rtl"
              aria-describedby={
                validationErrors.statement ? "statement-error" : undefined
              }
              required
            />
            {validationErrors.statement && (
              <p id="statement-error" className="text-sm text-destructive mt-1">
                {validationErrors.statement}
              </p>
            )}
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="image">صورة (اختيارية)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  handleImageChange(e);
                  if (validationErrors.image) {
                    setValidationErrors((prev) => ({ ...prev, image: "" }));
                  }
                }}
                className="hidden"
                aria-describedby={
                  validationErrors.image ? "image-error" : undefined
                }
                aria-label="اختيار صورة للمنشور"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("image")?.click()}
                className="flex items-center gap-2"
              >
                <ImageIcon className="h-4 w-4" />
                اختر صورة
              </Button>
            </div>
          </div>

          {/* Image Preview */}
          {imagePreview && (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg"
              />
              <Button
                variant="destructive"
                size="sm"
                onClick={removeImage}
                className="absolute top-2 left-2"
                aria-label="إزالة الصورة"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Character Count */}
          <div className="text-end text-sm text-muted-foreground">
            {statement.length}/500 حرف
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              إلغاء
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!statement.trim() || isSubmitting}
            >
              {isSubmitting ? "جاري النشر..." : "نشر"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 