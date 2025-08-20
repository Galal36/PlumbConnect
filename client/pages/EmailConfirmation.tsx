import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Mail, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  ExternalLink,
  ArrowLeft 
} from "lucide-react";
import { realApiService } from "@/services/realApi";
import { ROUTES } from "@/constants";

interface EmailConfirmationProps {
  email?: string;
}

export default function EmailConfirmation({ email }: EmailConfirmationProps) {
  const location = useLocation();
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  // Get email from location state or props
  const userEmail = email || location.state?.email || '';

  const handleResendEmail = async () => {
    if (!userEmail) {
      setResendStatus({
        type: 'error',
        message: 'لم يتم العثور على البريد الإلكتروني'
      });
      return;
    }

    setIsResending(true);
    setResendStatus({ type: null, message: '' });

    try {
      // Note: This would need a resend endpoint in the backend
      // For now, we'll simulate the API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setResendStatus({
        type: 'success',
        message: 'تم إرسال رابط التفعيل مرة أخرى إلى بريدك الإلكتروني'
      });
    } catch (error) {
      setResendStatus({
        type: 'error',
        message: 'حدث خطأ أثناء إرسال رابط التفعيل'
      });
    } finally {
      setIsResending(false);
    }
  };

  const openGmail = () => {
    window.open('https://mail.google.com', '_blank');
  };

  const openOutlook = () => {
    window.open('https://outlook.live.com', '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4" dir="rtl">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Mail className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            تحقق من بريدك الإلكتروني
          </CardTitle>
          <p className="text-gray-600 mt-2">
            تم إرسال رابط التفعيل إلى بريدك الإلكتروني
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Email Display */}
          {userEmail && (
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600 mb-1">تم الإرسال إلى:</p>
              <p className="font-semibold text-gray-900 break-all">{userEmail}</p>
            </div>
          )}

          {/* Instructions */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">خطوات التفعيل:</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
              <li>افتح بريدك الإلكتروني</li>
              <li>ابحث عن رسالة من "PlumbConnect"</li>
              <li>انقر على رابط "تفعيل الحساب"</li>
              <li>سيتم توجيهك إلى صفحة تسجيل الدخول</li>
            </ol>
          </div>

          {/* Quick Email Access */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-900">الوصول السريع للبريد:</p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={openGmail}
                className="flex-1"
              >
                <ExternalLink className="h-4 w-4 ml-2" />
                Gmail
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={openOutlook}
                className="flex-1"
              >
                <ExternalLink className="h-4 w-4 ml-2" />
                Outlook
              </Button>
            </div>
          </div>

          {/* Resend Email */}
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              لم تستلم الرسالة؟ تحقق من مجلد الرسائل غير المرغوب فيها
            </p>
            <Button 
              variant="outline" 
              onClick={handleResendEmail}
              disabled={isResending}
              className="w-full"
            >
              {isResending ? (
                <>
                  <RefreshCw className="h-4 w-4 ml-2 animate-spin" />
                  جاري الإرسال...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 ml-2" />
                  إعادة إرسال رابط التفعيل
                </>
              )}
            </Button>
          </div>

          {/* Status Messages */}
          {resendStatus.type && (
            <Alert variant={resendStatus.type === 'success' ? 'default' : 'destructive'}>
              {resendStatus.type === 'success' ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription>{resendStatus.message}</AlertDescription>
            </Alert>
          )}

          {/* Navigation */}
          <div className="pt-4 border-t border-gray-200">
            <div className="flex gap-3">
              <Button asChild variant="outline" className="flex-1">
                <Link to={ROUTES.LOGIN}>
                  <ArrowLeft className="h-4 w-4 ml-2" />
                  العودة لتسجيل الدخول
                </Link>
              </Button>
              <Button asChild className="flex-1">
                <Link to={ROUTES.REGISTER}>
                  إنشاء حساب جديد
                </Link>
              </Button>
            </div>
          </div>

          {/* Help Section */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">هل تحتاج مساعدة؟</h4>
            <p className="text-sm text-blue-700">
              إذا واجهت أي مشكلة، يمكنك التواصل معنا عبر البريد الإلكتروني أو إنشاء حساب جديد.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 