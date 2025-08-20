import { useState, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";
import AuthLayout from "@/layouts/AuthLayout";
import PublicRoute from "@/components/guards/PublicRoute";
import { ROUTES } from "@/constants";
import { isValidEmail, formatError } from "@/utils";
import type { User } from "@/types";
import SEOHead from "@/components/SEOHead";
import { generateSEOConfig } from "@/hooks/useSEO";
import { realApiService } from "@/services/realApi";

interface LoginFormData {
  email: string;
  password: string;
}

interface ValidationErrors {
  email?: string;
  password?: string;
  general?: string;
}

export default function Login() {
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthContext();

  const seoConfig = generateSEOConfig({
    title: "تسجيل الدخول - فني صحي الكويت",
    description:
      "سجل دخولك إلى منصة فني صحي الكويت. احصل على أفضل خدمات السباكة في الكويت وتفاعل مع فنيين موثوقين.",
    keywords: "تسجيل دخول، فني صحي الكويت، حساب فني صحي، منصة سباكة",
    url: "/login",
    type: "website",
    noindex: true,
  });

  const validateForm = useCallback((): boolean => {
    const newErrors: ValidationErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "يرجى إدخال البريد الإلكتروني";
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = "يرجى إدخال بريد إلكتروني صحيح";
    }

    if (!formData.password.trim()) {
      newErrors.password = "يرجى إدخال كلمة المرور";
    } else if (formData.password.length < 6) {
      newErrors.password = "يجب أن تكون كلمة المرور 6 أحرف على الأقل";
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
        // Call the real login API
        const authResponse = await realApiService.login({
          email: formData.email,
          password: formData.password,
        });

        // Store tokens
        localStorage.setItem('access_token', authResponse.access);
        localStorage.setItem('refresh_token', authResponse.refresh);

        // Get user data from the token
        const userResponse = await realApiService.getCurrentUser();
        
        // Convert backend user data to frontend format
        const user: User = {
          id: userResponse.id,
          name: userResponse.name,
          email: userResponse.email,
          phone: userResponse.phone,
          location: userResponse.location,
          avatar: userResponse.image || "/placeholder.svg",
          role: userResponse.role,
          status: userResponse.status,
          joinDate: new Date().toISOString().split('T')[0], // Use current date as fallback
        };

        login(user);

        // Redirect to intended page or home
        const from = location.state?.from?.pathname || ROUTES.HOME;
        navigate(from);
      } catch (error) {
        console.error('Login error:', error);
        setErrors({ general: formatError(error) });
      } finally {
        setIsLoading(false);
      }
    },
    [formData, validateForm, login, navigate, location],
  );

  const handleInputChange = useCallback(
    (field: keyof LoginFormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      // Clear field error when user starts typing
      if (errors[field as keyof ValidationErrors]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    },
    [errors],
  );



  return (
    <>
      <SEOHead config={seoConfig} />
      <PublicRoute redirectIfAuthenticated>
        <AuthLayout>
          <Card className="w-full max-w-md premium-card-gradient">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-white">
                تسجيل الدخول
              </CardTitle>
              <p className="text-gray-300">أهلاً بك مرة أخرى</p>
            </CardHeader>
            <CardContent className="p-6">
              {errors.general && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.general}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
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
                    placeholder="أدخل كلمة المرور"
                    aria-describedby={
                      errors.password ? "password-error" : undefined
                    }
                  />
                  {errors.password && (
                    <p id="password-error" className="text-sm text-destructive">
                      {errors.password}
                    </p>
                  )}
                </div>



                <div className="flex items-center justify-between text-sm">
                  <Link
                    to={ROUTES.FORGOT_PASSWORD}
                    className="text-primary hover:underline"
                  >
                    نسيت كلمة المرور؟
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-full mt-6"
                  disabled={isLoading}
                >
                  {isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-300">
                  ليس لديك حساب؟
                  <Link
                    to={ROUTES.REGISTER}
                    className="text-primary hover:underline"
                  >
                    إنشاء حساب جديد
                  </Link>
                </p>
              </div>


            </CardContent>
          </Card>
        </AuthLayout>
      </PublicRoute>
    </>
  );
}
