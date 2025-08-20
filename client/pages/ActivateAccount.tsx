import { useState, useEffect } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { realApiService } from "@/services/realApi";
import { ROUTES } from "@/constants";

export default function ActivateAccount() {
  const { uidb64, token } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const activateAccount = async () => {
      if (!uidb64 || !token) {
        setError("رابط التفعيل غير صحيح");
        setIsLoading(false);
        return;
      }

      try {
        await realApiService.activateAccount(uidb64, token);
        setIsSuccess(true);
      } catch (error: any) {
        console.error('Activation error:', error);
        setError(error.message || "حدث خطأ أثناء تفعيل الحساب");
      } finally {
        setIsLoading(false);
      }
    };

    activateAccount();
  }, [uidb64, token]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4" dir="rtl">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-16 w-16 text-blue-500 mx-auto mb-4 animate-spin" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              جاري تفعيل الحساب...
            </h2>
            <p className="text-gray-600">
              يرجى الانتظار بينما نقوم بتفعيل حسابك
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4" dir="rtl">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              تم تفعيل الحساب بنجاح!
            </h2>
            <p className="text-gray-600 mb-6">
              يمكنك الآن تسجيل الدخول إلى حسابك
            </p>
            <Button asChild className="w-full">
              <Link to={ROUTES.LOGIN}>تسجيل الدخول</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4" dir="rtl">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              فشل في تفعيل الحساب
            </h2>
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link to={ROUTES.REGISTER}>إنشاء حساب جديد</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link to={ROUTES.LOGIN}>تسجيل الدخول</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <Navigate to={ROUTES.HOME} replace />;
} 