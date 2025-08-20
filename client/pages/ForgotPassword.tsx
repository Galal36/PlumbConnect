import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, ArrowRight } from "lucide-react";
import AuthLayout from "@/layouts/AuthLayout";
import PublicRoute from "@/components/guards/PublicRoute";
import { ROUTES } from "@/constants";
import { isValidEmail, formatError } from "@/utils";
import { realApiService } from "@/services/realApi";

interface ForgotPasswordFormData {
  email: string;
}

interface ValidationErrors {
  email?: string;
  general?: string;
}

export default function ForgotPassword() {
  const [formData, setFormData] = useState<ForgotPasswordFormData>({
    email: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isEmailSent, setIsEmailSent] = useState(false);

  const validateForm = useCallback((): boolean => {
    const newErrors: ValidationErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "يرجى إدخال البريد الإلكتروني";
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = "يرجى إدخال بريد إلكتروني صحيح";
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
        // Use real API service
        await realApiService.requestPasswordReset(formData.email.trim());
        setIsEmailSent(true);
      } catch (error) {
        setErrors({ general: formatError(error) });
      } finally {
        setIsLoading(false);
      }
    },
    [formData, validateForm],
  );

  const handleInputChange = useCallback(
    (value: string) => {
      setFormData({ email: value });
      if (errors.email) {
        setErrors((prev) => ({ ...prev, email: undefined }));
      }
    },
    [errors],
  );

  if (isEmailSent) {
    return (
      <PublicRoute>
        <AuthLayout>
          <Card className="w-full max-w-md premium-card-gradient">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <CardTitle className="text-2xl font-bold text-white">
                تم الإرسال بنجاح
              </CardTitle>
              <p className="text-gray-300">تحقق من بريدك الإلكتروني</p>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <p className="text-gray-300">
                  تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني:
                </p>
                <p className="font-semibold text-white break-all">
                  {formData.email}
                </p>
                <p className="text-sm text-gray-400">
                  يرجى فحص بريدك الإلكتروني (بما في ذلك مجلد الرسائل غير المرغوب
                  فيها) واتباع التعليمات لإعادة تعيين كلمة المرور.
                </p>

                <div className="pt-4">
                  <Button
                    onClick={() => setIsEmailSent(false)}
                    variant="outline"
                    className="w-full mb-3"
                  >
                    إرسال رابط آخر
                  </Button>

                  <Link to={ROUTES.LOGIN}>
                    <Button variant="ghost" className="w-full">
                      <ArrowRight className="nav-icon h-4 w-4 ml-2" />
                      العودة لتسجيل الدخول
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </AuthLayout>
      </PublicRoute>
    );
  }

  return (
    <PublicRoute>
      <AuthLayout>
        <Card className="w-full max-w-md premium-card-gradient">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-white">
              نسيت كلمة المرور؟
            </CardTitle>
            <p className="text-gray-300">
              لا تقلق، سنرسل لك رابط إعادة تعيين كلمة المرور
            </p>
          </CardHeader>
          <CardContent className="p-6">
            {errors.general && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.general}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange(e.target.value)}
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

              <Button
                type="submit"
                className="w-full mt-6"
                disabled={isLoading}
              >
                {isLoading ? "جاري الإرسال..." : "إرسال رابط إعادة التعيين"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-300">
                تذكرت كلمة المرور؟
                <Link
                  to={ROUTES.LOGIN}
                  className="text-primary hover:underline mr-1"
                >
                  تسجيل الدخول
                </Link>
              </p>
            </div>

            <div className="mt-4 text-center">
              <Link
                to={ROUTES.REGISTER}
                className="text-sm text-gray-400 hover:text-primary"
              >
                ليس لديك حساب؟ إنشاء حساب جديد
              </Link>
            </div>
          </CardContent>
        </Card>
      </AuthLayout>
    </PublicRoute>
  );
}
