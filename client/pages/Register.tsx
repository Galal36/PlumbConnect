import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Wrench, Mail, CheckCircle, AlertCircle } from "lucide-react";
import { useState, useCallback, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import {
  isValidEmail,
  isValidPhone,
  validatePassword,
  getPasswordStrength,
  formatError,
} from "@/utils";
import { VALIDATION_RULES, ROUTES } from "@/constants";
import { realApiService, type Location } from "@/services/realApi";

interface RegisterFormData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  city: string;
  role: string;
}

interface ValidationErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  city?: string;
  role?: string;
  general?: string;
}

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterFormData>({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    city: "",
    role: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(true);

  // Load locations on component mount
  useEffect(() => {
    const loadLocations = async () => {
      try {
        const locationsData = await realApiService.getLocations();
        console.log('Locations loaded from API:', locationsData);
        setLocations(Array.isArray(locationsData) ? locationsData : []);
      } catch (error) {
        console.error('Failed to load locations:', error);
        // Fallback to hardcoded Kuwait cities if API fails
        const fallbackLocations = [
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
        ];
        console.log('Using fallback locations:', fallbackLocations);
        setLocations(fallbackLocations);
      } finally {
        setIsLoadingLocations(false);
      }
    };

    loadLocations();
  }, []);

  const validateForm = useCallback((): boolean => {
    const newErrors: ValidationErrors = {};

    // Full Name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = "يرجى إدخال الاسم الكامل";
    } else if (
      formData.fullName.trim().length < VALIDATION_RULES.NAME_MIN_LENGTH
    ) {
      newErrors.fullName = `يجب أن يكون الاسم ${VALIDATION_RULES.NAME_MIN_LENGTH} أحرف على الأقل`;
    } else if (
      formData.fullName.trim().length > VALIDATION_RULES.NAME_MAX_LENGTH
    ) {
      newErrors.fullName = `يجب أن يكون الاسم ${VALIDATION_RULES.NAME_MAX_LENGTH} حرف أو أقل`;
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "يرجى إدخال البريد الإلكتروني";
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = "يرجى إدخال بريد إلكتروني صحيح";
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = "يرجى إدخال رقم الهاتف";
    } else if (!isValidPhone(formData.phone)) {
      newErrors.phone = "يرجى إدخال رقم هاتف كويتي صحيح (مثال: +965 12345678)";
    }

    // City validation
    if (!formData.city) {
      newErrors.city = "يرجى اختيار المدينة";
    }

    // Role validation
    if (!formData.role) {
      newErrors.role = "يرجى اختيار نوع الحساب";
    }

    // Password validation
    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      newErrors.password = passwordError;
    }

    // Confirm password validation
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "يرجى تأكيد كلمة المرور";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "كلمات المرور غير متطابقة";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) {
        return;
      }

      setIsLoading(true);
      setErrors({});

      try {
        // Find the selected location
        const selectedLocation = locations.find(loc => loc.city === formData.city);
        if (!selectedLocation) {
          throw new Error("الرجاء اختيار مدينة صحيحة");
        }

        // Prepare registration data
        const registrationData = {
          name: formData.fullName.trim(), // Remove leading/trailing spaces
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          location_id: selectedLocation.id,
          role: (formData.role === "user" ? "client" : formData.role) as "client" | "plumber" // Map 'user' to 'client'
        };

        console.log('Sending registration data:', registrationData);

        // Call the registration API
        await realApiService.register(registrationData);
        
        // Redirect to email confirmation page with email
        navigate(ROUTES.EMAIL_CONFIRMATION, {
          state: { email: formData.email }
        });
      } catch (error) {
        console.error('Registration error:', error);
        setErrors({ general: formatError(error) });
      } finally {
        setIsLoading(false);
      }
    },
    [formData, validateForm],
  );

  const handleInputChange = useCallback(
    (field: keyof RegisterFormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      // Clear field error when user starts typing
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    },
    [errors],
  );



  return (
    <div className="min-h-screen bg-gray-900" dir="rtl">
      <Navbar />

      <div className="py-12 px-4">
        <Card className="w-full max-w-md mx-auto premium-card-gradient">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-white">
              إنشاء حساب جديد
            </CardTitle>
            <p className="text-gray-300">انضم إلى منصة فني صحي الكويت</p>
          </CardHeader>
          <CardContent className="p-6">
            {errors.general && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.general}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName">الاسم الكامل</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) =>
                    handleInputChange("fullName", e.target.value)
                  }
                  className={`text-end ${errors.fullName ? "border-destructive" : ""}`}
                  placeholder="أدخل اسمك الكامل"
                  aria-describedby={
                    errors.fullName ? "fullName-error" : undefined
                  }
                />
                {errors.fullName && (
                  <p id="fullName-error" className="text-sm text-destructive">
                    {errors.fullName}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={`text-end ${errors.email ? "border-destructive" : ""}`}
                  placeholder="example@email.com"
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
                {errors.email && (
                  <p id="email-error" className="text-sm text-destructive">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">رقم الهاتف (الكويت)</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className={`text-end ${errors.phone ? "border-destructive" : ""}`}
                  placeholder="+965 12345678"
                  aria-describedby={errors.phone ? "phone-error" : undefined}
                />
                {errors.phone && (
                  <p id="phone-error" className="text-sm text-destructive">
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* City */}
              <div className="space-y-2">
                <Label htmlFor="city">المدينة</Label>
                <Select
                  value={formData.city}
                  onValueChange={(value) => handleInputChange("city", value)}
                  disabled={isLoadingLocations}
                >
                  <SelectTrigger
                    className={`text-end ${errors.city ? "border-destructive" : ""}`}
                  >
                    <SelectValue placeholder={isLoadingLocations ? "جاري التحميل..." : "اختر مدينتك"} />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(locations) && locations.map((location) => (
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

              {/* Role */}
              <div className="space-y-2">
                <Label htmlFor="role">نوع الحساب</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => handleInputChange("role", value)}
                >
                  <SelectTrigger
                    className={`text-end ${errors.role ? "border-destructive" : ""}`}
                  >
                    <SelectValue placeholder="اختر نوع حسابك" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">مستخدم عادي</SelectItem>
                    <SelectItem value="plumber">مختص فني صحي</SelectItem>
                  </SelectContent>
                </Select>
                {errors.role && (
                  <p className="text-sm text-destructive">{errors.role}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">كلمة المرور</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  className={`text-end ${errors.password ? "border-destructive" : ""}`}
                  placeholder="أدخل كلمة مرور قوية (6 أحرف على الأقل)"
                  aria-describedby={
                    errors.password ? "password-error" : undefined
                  }
                />
                {errors.password && (
                  <p id="password-error" className="text-sm text-destructive">
                    {errors.password}
                  </p>
                )}

                {/* Password strength indicator */}
                {formData.password && (
                  <div className="space-y-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((level) => {
                        const strength = getPasswordStrength(formData.password);
                        const isActive = level <= strength;
                        const getColor = () => {
                          if (!isActive) return "bg-gray-200";
                          if (strength <= 2) return "bg-red-500";
                          if (strength === 3) return "bg-yellow-500";
                          return "bg-green-500";
                        };

                        return (
                          <div
                            key={level}
                            className={`h-2 w-full rounded ${getColor()}`}
                          />
                        );
                      })}
                    </div>
                    <p className="text-xs text-gray-500">
                      قوة كلمة المرور:{" "}
                      {getPasswordStrength(formData.password) <= 2
                        ? "ضعيفة"
                        : getPasswordStrength(formData.password) === 3
                          ? "متوسطة"
                          : "قوية"}
                    </p>
                    <div className="text-xs text-gray-500 space-y-1">
                      <p>متطلبات كلمة المرور:</p>
                      <ul className="list-disc list-inside mr-4 space-y-1">
                        <li>6 أحرف ع��ى الأقل</li>
                        <li>حرف كبير وصغير</li>
                        <li>رقم واحد على الأقل</li>
                        <li>رمز خاص (!@#$%^&*)</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleInputChange("confirmPassword", e.target.value)
                  }
                  className={`text-end ${errors.confirmPassword ? "border-destructive" : ""}`}
                  placeholder="أعد إدخال كلمة المرور"
                  aria-describedby={
                    errors.confirmPassword ? "confirmPassword-error" : undefined
                  }
                />
                {errors.confirmPassword && (
                  <p
                    id="confirmPassword-error"
                    className="text-sm text-destructive"
                  >
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full mt-6"
                disabled={isLoading}
              >
                {isLoading ? "جاري إنشاء الحساب..." : "إنشاء الحساب"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-300">
                لديك حساب؟
                <Link to="/login" className="text-primary hover:underline">
                  سجل دخول
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
