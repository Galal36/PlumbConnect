import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Eye, EyeOff, Lock, Check, Mail } from "lucide-react";
import { DialogFooter } from "@/components/ui/dialog";
import { realApiService } from "@/services/realApi";
import { useAuthContext } from "@/contexts/AuthContext";

interface ChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ChangePasswordDialog({ open, onOpenChange }: ChangePasswordDialogProps) {
  const { logout } = useAuthContext();
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [isForgotPasswordLoading, setIsForgotPasswordLoading] = useState(false);
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false);
  const [forgotPasswordError, setForgotPasswordError] = useState<string | null>(null);

  const handleSubmit = async () => {
    // First, check if old password is provided
    if (!passwords.currentPassword.trim()) {
      setError("يرجى إدخال كلمة المرور الحالية");
      return;
    }

    // Then check if new password is provided
    if (!passwords.newPassword.trim()) {
      setError("يرجى إدخال كلمة المرور الجديدة");
      return;
    }

    // Check if new password meets length requirement
    if (passwords.newPassword.length < 8) {
      setError("كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل");
      return;
    }

    // Finally check if passwords match
    if (passwords.newPassword !== passwords.confirmPassword) {
      setError("كلمة المرور الجديدة وتأكيدها غير متطابقين");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Add timeout to prevent slow loading
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 5000); // 5 seconds timeout
      });

      const passwordChangePromise = realApiService.changePassword({
        old_password: passwords.currentPassword,
        new_password: passwords.newPassword,
      });

      // Race between timeout and actual request
      await Promise.race([passwordChangePromise, timeoutPromise]);

      setSuccess(true);

      setTimeout(() => {
        setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setSuccess(false);
        onOpenChange(false);
        logout(); // Logout user after password change
      }, 2000);
    } catch (error: any) {
      console.error('Password change error:', error);
      console.log('Error message:', error.message);
      console.log('Error object:', error);
      
      // The handleApiResponse function already provides Arabic error messages
      // Just use the error message directly
      let errorMessage = error.message || "حدث خطأ أثناء تغيير كلمة المرور";
      
      // Handle timeout specifically
      if (error.message && error.message.toLowerCase().includes('timeout')) {
        errorMessage = "انتهت مهلة الطلب. يرجى المحاولة مرة أخرى";
      }
      
      console.log('Final error message:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail || !forgotPasswordEmail.includes('@')) {
      setForgotPasswordError("يرجى إدخال بريد إلكتروني صحيح");
      return;
    }

    setIsForgotPasswordLoading(true);
    setForgotPasswordError(null);

    try {
      await realApiService.requestPasswordReset(forgotPasswordEmail);
      setForgotPasswordSuccess(true);
      
      setTimeout(() => {
        setShowForgotPassword(false);
        setForgotPasswordEmail("");
        setForgotPasswordSuccess(false);
      onOpenChange(false);
      }, 3000);
    } catch (error: any) {
      console.error('Forgot password error:', error);
      setForgotPasswordError(error.message || "حدث خطأ أثناء إرسال طلب إعادة تعيين كلمة المرور");
    } finally {
      setIsForgotPasswordLoading(false);
    }
  };

  const resetForm = () => {
    setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setError(null);
    setSuccess(false);
    setShowForgotPassword(false);
    setForgotPasswordEmail("");
    setForgotPasswordSuccess(false);
    setForgotPasswordError(null);
  };

  if (showForgotPassword) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-right">نسيت كلمة المرور؟</DialogTitle>
            <DialogDescription className="text-right">
              أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="forgot-email" className="text-right block">البريد الإلكتروني</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="forgot-email"
                  type="email"
                  placeholder="أدخل بريدك الإلكتروني"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  className="pl-10 text-right"
                />
              </div>
            </div>

            {forgotPasswordError && (
              <div className="flex items-center space-x-2 text-sm text-red-600 bg-red-50 p-3 rounded-md">
                <AlertCircle className="h-4 w-4" />
                <span>{forgotPasswordError}</span>
              </div>
            )}

            {forgotPasswordSuccess && (
              <div className="flex items-center space-x-2 text-sm text-green-600 bg-green-50 p-3 rounded-md">
                <Check className="h-4 w-4" />
                <span>تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني</span>
              </div>
            )}
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowForgotPassword(false)}
              disabled={isForgotPasswordLoading}
            >
              رجوع
            </Button>
            <Button
              type="button"
              onClick={handleForgotPassword}
              disabled={isForgotPasswordLoading || !forgotPasswordEmail}
            >
              {isForgotPasswordLoading ? "جاري الإرسال..." : "إرسال رابط إعادة التعيين"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-right">تغيير كلمة المرور</DialogTitle>
          <DialogDescription className="text-right">
            أدخل كلمة المرور الحالية وكلمة المرور الجديدة
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password" className="text-right block">كلمة المرور الحالية</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="current-password"
                type={showPasswords.current ? "text" : "password"}
                placeholder="أدخل كلمة المرور الحالية"
                value={passwords.currentPassword}
                onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                className="pl-10 text-right"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1 h-6 w-6 p-0"
                onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
              >
                {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-password" className="text-right block">كلمة المرور الجديدة</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="new-password"
                type={showPasswords.new ? "text" : "password"}
                placeholder="أدخل كلمة المرور الجديدة"
                value={passwords.newPassword}
                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                className="pl-10 text-right"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1 h-6 w-6 p-0"
                onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
              >
                {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password" className="text-right block">تأكيد كلمة المرور الجديدة</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="confirm-password"
                type={showPasswords.confirm ? "text" : "password"}
                placeholder="أعد إدخال كلمة المرور الجديدة"
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                className="pl-10 text-right"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1 h-6 w-6 p-0"
                onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
              >
                {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Forgot Password Link */}
          <div className="text-center">
            <Button
              type="button"
              variant="link"
              className="text-sm text-blue-600 hover:text-blue-800"
              onClick={() => setShowForgotPassword(true)}
            >
              نسيت كلمة المرور الحالية؟
            </Button>
          </div>

          {error && (
            <div className="flex items-center space-x-2 text-sm text-red-600 bg-red-50 p-3 rounded-md">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center space-x-2 text-sm text-green-600 bg-green-50 p-3 rounded-md">
              <Check className="h-4 w-4" />
              <span>تم تغيير كلمة المرور بنجاح! سيتم تسجيل خروجك تلقائياً</span>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
            type="button"
              variant="outline"
            onClick={() => {
              resetForm();
              onOpenChange(false);
            }}
              disabled={isLoading}
            >
              إلغاء
            </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || !passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword}
          >
            {isLoading ? "جاري التغيير..." : "تغيير كلمة المرور"}
          </Button>
          </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
