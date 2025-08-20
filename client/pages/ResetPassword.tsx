import { useState, useCallback, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Eye,
  EyeOff,
} from "lucide-react";
import AuthLayout from "@/layouts/AuthLayout";
import PublicRoute from "@/components/guards/PublicRoute";
import { ROUTES } from "@/constants";
import { formatError } from "@/utils";
import { realApiService } from "@/services/realApi";

interface ResetPasswordFormData {
  new_password: string;
  confirm_password: string;
}

interface ValidationErrors {
  new_password?: string;
  confirm_password?: string;
  general?: string;
}

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ResetPasswordFormData>({
    new_password: "",
    confirm_password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetTokens, setResetTokens] = useState<{
    uidb64: string;
    token: string;
  } | null>(null);

  useEffect(() => {
    const uidb64 = searchParams.get("uid");
    const token = searchParams.get("token");

    if (!uidb64 || !token) {
      setErrors({
        general: "رابط إعادة تعيين كلمة المرور غير صحيح أو منتهي الصلاحية",
      });
      return;
    }

    setResetTokens({ uidb64, token });
  }, [searchParams]);

  const validateForm = useCallback((): boolean => {
    const newErrors: ValidationErrors = {};

    if (!formData.new_password.trim()) {
      newErrors.new_password = "يرجى إدخال كلمة المرور الجديدة";
    } else if (formData.new_password.length < 8) {
      newErrors.new_password = "يجب أن تكون كلمة المرور 8 أحرف على الأقل";
    }

    if (!formData.confirm_password.trim()) {
      newErrors.confirm_password = "يرجى تأكيد كلمة المرور";
    } else if (formData.new_password !== formData.confirm_password) {
      newErrors.confirm_password = "كلمات المرور غير متطابقة";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!resetTokens) {
        setErrors({
          general: "رابط إعادة تعيين كلمة المرور غير صحيح أو منتهي الصلاحية",
        });
        return;
      }

      if (!validateForm()) {
        return;
      }

      setIsLoading(true);
      setErrors({});

      try {
        await realApiService.confirmPasswordReset(
          resetTokens.uidb64,
          resetTokens.token,
          formData.new_password
        );

        setIsPasswordReset(true);
      } catch (error) {
        setErrors({ general: formatError(error) });
      } finally {
        setIsLoading(false);
      }
    },
    [formData, validateForm, resetTokens],
  );

  const handleInputChange = useCallback(
    (field: keyof ResetPasswordFormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    },
    [errors],
  );

  const handleGoToLogin = useCallback(() => {
    navigate(ROUTES.LOGIN);
  }, [navigate]);

  if (isPasswordReset) {
    return (
      <PublicRoute>
        <AuthLayout>
          <Card className="w-full max-w-md premium-card-gradient">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <CardTitle className="text-2xl font-bold text-white">
                تم التغيير بنجاح
              </CardTitle>
              <p className="text-gray-300">تم تغيير كلمة المرور بنجاح</p>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <p className="text-gray-300">
                  تم تغيير كلمة المرور الخاصة بك بنجاح. يمكنك الآن تسجيل الدخول
                  باستخدام كلمة المرور الجديدة.
                </p>

                <Button onClick={handleGoToLogin} className="w-full">
                  <ArrowRight className="nav-icon h-4 w-4 ml-2" />
                  تسجيل الدخول الآن
                </Button>
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
              تعيين كلمة مرور جديدة
            </CardTitle>
            <p className="text-gray-300">اختر كلمة مرور قوية وآمنة لحسابك</p>
          </CardHeader>
          <CardContent className="p-6">
            {errors.general && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.general}</AlertDescription>
              </Alert>
            )}

            {!resetTokens ? (
              <div className="text-center space-y-4">
                <p className="text-gray-300">
                  رابط إعادة تعيين كلمة المرور غير صحيح أو منتهي الصلاحية
                </p>
                <Link to={ROUTES.FORGOT_PASSWORD}>
                  <Button variant="outline" className="w-full">
                    طلب رابط جديد
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new_password">كلمة المرور الجديدة</Label>
                  <div className="relative">
                    <Input
                      id="new_password"
                      type={showPassword ? "text" : "password"}
                      value={formData.new_password}
                      onChange={(e) =>
                        handleInputChange("new_password", e.target.value)
                      }
                      className={`text-end pr-10 ${errors.new_password ? "border-destructive" : ""}`}
                      placeholder="أدخل كلمة المرور الجديدة"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.new_password && (
                    <p className="text-sm text-destructive">
                      {errors.new_password}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm_password">تأكيد كلمة المرور</Label>
                  <div className="relative">
                    <Input
                      id="confirm_password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirm_password}
                      onChange={(e) =>
                        handleInputChange("confirm_password", e.target.value)
                      }
                      className={`text-end pr-10 ${errors.confirm_password ? "border-destructive" : ""}`}
                      placeholder="أعد إدخال كلمة المرور"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.confirm_password && (
                    <p className="text-sm text-destructive">
                      {errors.confirm_password}
                    </p>
                  )}
                </div>

                <div className="text-xs text-gray-400 space-y-1">
                  <p>متطلبات كلمة المرور:</p>
                  <ul className="list-disc list-inside space-y-1 mr-4">
                    <li>8 أحرف على الأقل</li>
                    <li>يُفضل استخدام أحرف كبيرة وصغيرة</li>
                    <li>يُفضل استخدام أرقام ورموز</li>
                  </ul>
                </div>

                <Button
                  type="submit"
                  className="w-full mt-6"
                  disabled={isLoading || !resetTokens}
                >
                  {isLoading
                    ? "جاري تغيير كلمة المرور..."
                    : "تغيير كلمة المرور"}
                </Button>
              </form>
            )}

            <div className="mt-6 text-center">
              <Link
                to={ROUTES.LOGIN}
                className="text-sm text-gray-400 hover:text-primary"
              >
                العودة لتسجيل الدخول
              </Link>
            </div>
          </CardContent>
        </Card>
      </AuthLayout>
    </PublicRoute>
  );
}
