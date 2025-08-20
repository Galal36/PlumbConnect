import { useState } from "react";
import { User2, MapPin, Phone, Image as ImageIcon, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AuthUser } from "@/hooks/useAuthApi";

interface EditProfileDialogProps {
  user: AuthUser;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProfileUpdate: () => void;
}

// Mock locations
const mockLocations = [
  { id: 1, city: "الكويت العاصمة" },
  { id: 2, city: "حولي" },
  { id: 3, city: "الفروانية" },
  { id: 4, city: "الأحمدي" },
  { id: 5, city: "الجهراء" },
  { id: 6, city: "مبارك الكبير" },
];

export function EditProfileDialog({
  user,
  open,
  onOpenChange,
  onProfileUpdate,
}: EditProfileDialogProps) {
  const [formData, setFormData] = useState({
    name: user.name,
    phone: `+965 ${Math.floor(Math.random() * 90000000) + 10000000}`, // Mock phone
    location_id: 1, // Default to Kuwait City
  });
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(user.image || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setValidationErrors((prev) => ({
          ...prev,
          image: "يجب أن يكون حجم الصورة أقل من 5 ميجابايت",
        }));
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        setValidationErrors((prev) => ({
          ...prev,
          image: "يجب أن يكون الملف صورة",
        }));
        return;
      }

      setImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Clear image error
      if (validationErrors.image) {
        setValidationErrors((prev) => ({ ...prev, image: "" }));
      }
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(user.image || "");
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      errors.name = "الاسم مطلوب";
    } else if (formData.name.trim().length < 2) {
      errors.name = "يجب أن يكون الاسم حرفين على الأقل";
    } else if (formData.name.trim().length > 50) {
      errors.name = "يجب أن يكون الاسم 50 حرف أو أقل";
    }

    if (!formData.phone.trim()) {
      errors.phone = "رقم الهاتف مطلوب";
    } else if (!/^\+965\s\d{8}$/.test(formData.phone)) {
      errors.phone = "رقم الهاتف غير صحيح (مثال: +965 12345678)";
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
    setSuccess(false);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // In real implementation, call the update profile API
      console.log("Updating profile:", {
        ...formData,
        image: image || undefined,
      });

      setSuccess(true);

      // Call the callback after a short delay to show success message
      setTimeout(() => {
        onProfileUpdate();
        onOpenChange(false);
      }, 1000);
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("فشل في تحديث الملف الشخصي. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User2 className="h-5 w-5" />
            تعديل الملف الشخصي
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Image */}
          <div className="space-y-3">
            <Label>الصورة الشخصية</Label>
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={imagePreview} />
                <AvatarFallback className="text-lg">
                  {formData.name.charAt(0)}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-2">
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  aria-label="اختيار صورة شخصية"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById("image")?.click()}
                  className="gap-2"
                >
                  <ImageIcon className="h-4 w-4" />
                  اختيار صورة
                </Button>

                {imagePreview !== (user.image || "") && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={removeImage}
                    className="gap-2"
                  >
                    <X className="h-4 w-4" />
                    إزالة
                  </Button>
                )}
              </div>
            </div>
            {validationErrors.image && (
              <p className="text-sm text-destructive">
                {validationErrors.image}
              </p>
            )}
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">الاسم *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className={validationErrors.name ? "border-destructive" : ""}
              placeholder="أدخل اسمك الكامل"
              maxLength={50}
            />
            {validationErrors.name && (
              <p className="text-sm text-destructive">
                {validationErrors.name}
              </p>
            )}
            <p className="text-xs text-muted-foreground text-start">
              {formData.name.length}/50
            </p>
          </div>

          {/* Email (Read-only) */}
          <div className="space-y-2">
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input
              id="email"
              value={user.email}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              لا يمكن تعديل البريد الإلكتروني
            </p>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">رقم الهاتف *</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              className={validationErrors.phone ? "border-destructive" : ""}
              placeholder="+965 12345678"
              dir="ltr"
            />
            {validationErrors.phone && (
              <p className="text-sm text-destructive">
                {validationErrors.phone}
              </p>
            )}
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">المنطقة *</Label>
            <Select
              value={formData.location_id.toString()}
              onValueChange={(value) => handleInputChange("location_id", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر المنطقة" />
              </SelectTrigger>
              <SelectContent>
                {mockLocations.map((location) => (
                  <SelectItem key={location.id} value={location.id.toString()}>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {location.city}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Success Message */}
          {success && (
            <Alert className="border-green-200 bg-green-50 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>تم تحديث الملف الشخصي بنجاح!</AlertDescription>
            </Alert>
          )}

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              إلغاء
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || success}
              className="gap-2"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : success ? (
                <CheckCircle className="h-4 w-4" />
              ) : null}
              {isSubmitting
                ? "جاري الحفظ..."
                : success
                  ? "تم الحفظ"
                  : "حفظ التغييرات"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
