import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Edit, Camera, Save, AlertCircle, Lock } from "lucide-react";
import { useState, useCallback, useEffect } from "react";
import { isValidPhone, validateImage, formatError } from "@/utils";
import { VALIDATION_RULES } from "@/constants";
import ChangePasswordDialog from "@/components/ChangePasswordDialog";
import { realApiService } from "@/services/realApi";

interface EditProfileFormProps {
  onClose: () => void;
  currentProfile: {
    name: string;
    email: string;
    phone: string;
    bio: string;
    city: string;
    image: string;
  };
  onSave: (updatedProfile: any) => void;
  userRole?: "client" | "plumber" | "admin"; // Add user role prop
}

interface ValidationErrors {
  name?: string;
  phone?: string;
  bio?: string;
  city?: string;
  image?: string;
  general?: string;
}

export default function EditProfileForm({
  onClose,
  currentProfile,
  onSave,
  userRole = "client", // Default to client if not provided
}: EditProfileFormProps) {
  const [profileData, setProfileData] = useState({
    name: currentProfile.name,
    email: currentProfile.email,
    phone: currentProfile.phone,
    bio: currentProfile.bio,
    city: currentProfile.city,
    image: currentProfile.image,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showChangePasswordDialog, setShowChangePasswordDialog] =
    useState(false);
  const [locations, setLocations] = useState<Array<{id: number, city: string}>>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(true);

  // Load locations on component mount
  useEffect(() => {
    const loadLocations = async () => {
      try {
        const locationsData = await realApiService.getLocations();
        setLocations(locationsData);
      } catch (error) {
        console.error('Failed to load locations:', error);
        // Fallback to hardcoded Kuwait cities if API fails
        setLocations([
          { id: 1, city: "الكويت" },
          { id: 2, city: "حولي" },
          { id: 3, city: "الفروانية" },
          { id: 4, city: "الأحمدي" },
          { id: 5, city: "الجهراء" },
          { id: 6, city: "مبارك الكبير" },
          { id: 7, city: "العاصمة" },
          { id: 8, city: "السالمية" },
          { id: 9, city: "الفحيحيل" },
          { id: 10, city: "جليب الشيوخ" },
          { id: 11, city: "الفنطاس" },
          { id: 12, city: "المنقف" },
        ]);
      } finally {
        setIsLoadingLocations(false);
      }
    };

    loadLocations();
  }, []);

  const validateForm = useCallback((): boolean => {
    const newErrors: ValidationErrors = {};

    // Name validation
    if (!profileData.name.trim()) {
      newErrors.name = "يرجى إدخال الاسم";
    } else if (
      profileData.name.trim().length < VALIDATION_RULES.NAME_MIN_LENGTH
    ) {
      newErrors.name = `يجب أن يكون الاسم ${VALIDATION_RULES.NAME_MIN_LENGTH} أحرف على الأقل`;
    } else if (
      profileData.name.trim().length > VALIDATION_RULES.NAME_MAX_LENGTH
    ) {
      newErrors.name = `يجب أن يكون الاسم ${VALIDATION_RULES.NAME_MAX_LENGTH} حرف أو أقل`;
    }

    // Phone validation
    if (!profileData.phone.trim()) {
      newErrors.phone = "يرجى إدخال رقم الهاتف";
    } else if (!isValidPhone(profileData.phone)) {
      newErrors.phone = "يرجى إدخال رقم هاتف كويتي صحيح (مثال: +965 12345678)";
    }

    // Bio validation (optional but if provided should be reasonable)
    if (profileData.bio.trim().length > 300) {
      newErrors.bio = "يجب أن يكون الوصف 300 حرف أو أقل";
    }

    // City validation
    if (!profileData.city) {
      newErrors.city = "يرجى اختيار المدينة";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [profileData]);

  const handleInputChange = useCallback(
    (field: keyof typeof profileData, value: string) => {
      setProfileData((prev) => ({ ...prev, [field]: value }));
      // Clear field error when user starts typing
      if (errors[field as keyof ValidationErrors]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    },
    [errors],
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
        // Find the selected location
        const selectedLocation = locations.find(loc => loc.city === profileData.city);
        if (!selectedLocation) {
          throw new Error("الرجاء اختيار مدينة صحيحة");
        }

        // Prepare profile data for API (only supported fields)
        const updateData: any = {
          name: profileData.name.trim(),
          phone: profileData.phone,
          location_id: selectedLocation.id,
        };

        // Add image file if it's been uploaded
        if (imageFile) {
          updateData.image = imageFile;
        }

        // Call the real API
        console.log('Sending update data:', updateData);
        const updatedUser = await realApiService.updateProfile(updateData);
        console.log('Received updated user:', updatedUser);
        
        // Call the onSave callback with updated data (including bio from local state)
        onSave({
          ...profileData,
          name: updatedUser.name,
          phone: updatedUser.phone,
          city: updatedUser.location.city,
          image: updatedUser.image || profileData.image,
        });
        
        onClose();
      } catch (error) {
        console.error('Profile update error:', error);
        setErrors({ general: formatError(error) });
      } finally {
        setIsSubmitting(false);
      }
    },
    [profileData, validateForm, onSave, onClose, locations],
  );

  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        // Validate image
        const validationError = validateImage(file);
        if (validationError) {
          setErrors((prev) => ({ ...prev, image: validationError }));
          return;
        }

        // Clear any previous image error
        setErrors((prev) => ({ ...prev, image: undefined }));

        // Store the actual file for upload
        setImageFile(file);

        // Also update the preview
        const reader = new FileReader();
        reader.onload = (e) => {
          setProfileData((prev) => ({
            ...prev,
            image: (e.target?.result as string) || "/placeholder.svg",
          }));
        };
        reader.readAsDataURL(file);
      }
    },
    [],
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6" dir="rtl">
      {errors.general && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errors.general}</AlertDescription>
        </Alert>
      )}
      {/* Profile Picture */}
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <Avatar className="w-24 h-24 border-4 border-primary/20">
            <AvatarImage src={profileData.image} alt={profileData.name} />
            <AvatarFallback className="text-lg">
              {profileData.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          {/* Only show image upload for plumbers */}
          {userRole === "plumber" && (
            <>
              <label
                htmlFor="profile-image"
                className="absolute bottom-0 right-0 bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center cursor-pointer hover:bg-primary/80 transition-colors"
              >
                <Camera className="h-4 w-4" />
              </label>
              <input
                id="profile-image"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />
            </>
          )}
        </div>
        {userRole === "plumber" && errors.image && (
          <p className="text-sm text-destructive text-center">{errors.image}</p>
        )}
        {userRole === "plumber" ? (
          <p className="text-sm text-gray-500 text-center">
            اضغط على أيقونة الكاميرا لتغيير الصورة
          </p>
        ) : (
          <p className="text-sm text-gray-500 text-center">
            الصور الشخصية متاحة للمختصين الفنيين فقط
          </p>
        )}
      </div>

      {/* Name Field */}
      <div className="space-y-2">
        <Label htmlFor="name">الاسم</Label>
        <Input
          id="name"
          value={profileData.name}
          onChange={(e) => handleInputChange("name", e.target.value)}
          placeholder="أدخل اسمك الكامل"
          className={`text-end ${errors.name ? "border-destructive" : ""}`}
          dir="rtl"
          aria-describedby={errors.name ? "name-error" : undefined}
          maxLength={VALIDATION_RULES.NAME_MAX_LENGTH}
        />
        {errors.name && (
          <p id="name-error" className="text-sm text-destructive">
            {errors.name}
          </p>
        )}
        <p className="text-xs text-muted-foreground text-start">
          {profileData.name.length}/{VALIDATION_RULES.NAME_MAX_LENGTH}
        </p>
      </div>

      {/* Email Field (Read-only) */}
      <div className="space-y-2">
        <Label htmlFor="email">البريد الإلكتروني</Label>
        <Input
          id="email"
          value={profileData.email}
          className="text-end bg-gray-100 cursor-not-allowed"
          disabled
          readOnly
        />
        <p className="text-sm text-gray-500">لا يمكن تعديل البريد الإلكتروني</p>
      </div>

      {/* Phone Field */}
      <div className="space-y-2">
        <Label htmlFor="phone">رقم الهاتف</Label>
        <Input
          id="phone"
          value={profileData.phone}
          onChange={(e) => handleInputChange("phone", e.target.value)}
          placeholder="+965 12345678"
          className={`text-end ${errors.phone ? "border-destructive" : ""}`}
          aria-describedby={errors.phone ? "phone-error" : undefined}
          dir="ltr"
        />
        {errors.phone && (
          <p id="phone-error" className="text-sm text-destructive">
            {errors.phone}
          </p>
        )}
      </div>

      {/* Bio Field */}
      <div className="space-y-2">
        <Label htmlFor="bio">الوصف الشخصي</Label>
        <Textarea
          id="bio"
          value={profileData.bio}
          onChange={(e) => handleInputChange("bio", e.target.value)}
          placeholder="اكتب وصفاً مختصراً عن خبراتك ومهاراتك..."
          className={`text-end resize-none min-h-[80px] ${errors.bio ? "border-destructive" : ""}`}
          dir="rtl"
          maxLength={300}
          aria-describedby={errors.bio ? "bio-error" : undefined}
        />
        {errors.bio && (
          <p id="bio-error" className="text-sm text-destructive">
            {errors.bio}
          </p>
        )}
        <p className="text-sm text-gray-500">
          {profileData.bio.length}/300 حرف
        </p>
      </div>

      {/* City Field */}
      <div className="space-y-2">
        <Label htmlFor="city">المدينة</Label>
        <Select
          value={profileData.city}
          onValueChange={(value) => handleInputChange("city", value)}
        >
          <SelectTrigger
            className={`text-end ${errors.city ? "border-destructive" : ""}`}
          >
            <SelectValue placeholder="اختر المدينة" />
          </SelectTrigger>
          <SelectContent>
            {locations.map((location) => (
              <SelectItem key={location.id} value={location.city}>
                {location.city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.city && (
          <p className="text-sm text-destructive">{errors.city}</p>
        )}
      </div>

      {/* Change Password Section */}
      <div className="border-t pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowChangePasswordDialog(true)}
          className="w-full"
          disabled={isSubmitting}
        >
          <Lock className="h-4 w-4 ms-2" />
          تغيير كلمة السر
        </Button>
      </div>

      <DialogFooter className="flex flex-row-reverse gap-2">
        <Button
          type="submit"
          disabled={
            isSubmitting ||
            !profileData.name.trim() ||
            !profileData.phone.trim() ||
            !profileData.city
          }
        >
          <Save className="h-4 w-4 ms-2" />
          {isSubmitting ? "جاري الحفظ..." : "حفظ التغييرات"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isSubmitting}
        >
          إلغاء
        </Button>
      </DialogFooter>

      {/* Change Password Dialog */}
      <ChangePasswordDialog
        open={showChangePasswordDialog}
        onOpenChange={setShowChangePasswordDialog}
      />
    </form>
  );
}
