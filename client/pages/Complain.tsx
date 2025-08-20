import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, Wrench, AlertTriangle, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useAuthContext } from "@/contexts/AuthContext";
import { complaintsApiService, COMPLAINT_TYPES, ComplaintCreate, UserOption } from "@/services/complaintsApi";
import { toast } from "sonner";

export default function Complain() {
  const { isAuthenticated, isLoading, user } = useAuthContext();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    to_user_id: "",
    complaint_type: "",
    description: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  // Load users for dropdown
  useEffect(() => {
    const loadUsers = async () => {
      if (!isAuthenticated || !user) return;

      try {
        setIsLoadingUsers(true);
        const usersData = await complaintsApiService.getUsers();
        console.log("Users data received:", usersData); // Debug log

        // Ensure usersData is an array
        if (!Array.isArray(usersData)) {
          console.error("Users data is not an array:", usersData);
          toast.error("خطأ في تنسيق بيانات المستخدمين");
          setUsers([]); // Set empty array as fallback
          return;
        }

        // Filter out the current user from the list
        const filteredUsers = usersData.filter(u => u && u.id && u.id !== user.id);
        console.log("Filtered users:", filteredUsers); // Debug log
        setUsers(filteredUsers);
      } catch (error) {
        console.error("Failed to load users:", error);
        toast.error("فشل في تحميل قائمة المستخدمين");
      } finally {
        setIsLoadingUsers(false);
      }
    };

    loadUsers();
  }, [isAuthenticated, user]);

  // Redirect to login if not authenticated
  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.to_user_id || !formData.complaint_type || !formData.description.trim()) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    setIsSubmitting(true);

    try {
      const complaintData: ComplaintCreate = {
        to_user_id: parseInt(formData.to_user_id),
        complaint_type: formData.complaint_type,
        description: formData.description.trim(),
      };

      await complaintsApiService.createComplaint(complaintData);
      setIsSubmitted(true);
      toast.success("تم إرسال الشكوى بنجاح");
    } catch (error) {
      console.error("Failed to submit complaint:", error);
      toast.error("فشل في إرسال الشكوى. يرجى المحاولة مرة أخرى");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (isSubmitted) {
    return (
      <div
        className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4"
        dir="rtl"
      >
        <Card className="w-full max-w-md premium-card-gradient">
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">
              تم إرسال الشكوى
            </h2>
            <p className="text-gray-300 mb-6">
              تم استلام شكواك بنجاح. سيقوم فريق الدعم بمراجعتها والرد عليك
              قريباً عبر صفحة المحادثات.
            </p>
            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link to="/chat">عرض المحادثات</Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link to="/">العودة للرئيسية</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900" dir="rtl">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-red-100 rounded-full p-4">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">تقديم شكوى</h1>
          <p className="text-gray-300">
            نحن نأخذ شكاويكم على محمل الجد. يرجى تقديم التفاصيل وسنقوم بالرد
            عليكم في أقرب وقت.
          </p>
        </div>

        <Card className="premium-card-gradient">
          <CardHeader>
            <CardTitle className="text-end">تفاصيل الشكوى</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* User Selection */}
              <div className="space-y-2">
                <Label htmlFor="to_user_id">المستخدم المشكو ضده *</Label>
                {isLoadingUsers ? (
                  <div className="text-center py-2 text-gray-400">جاري تحميل المستخدمين...</div>
                ) : (
                  <Select
                    value={formData.to_user_id}
                    onValueChange={(value) => handleInputChange("to_user_id", value)}
                  >
                    <SelectTrigger className="text-end">
                      <SelectValue placeholder="اختر المستخدم" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.length === 0 ? (
                        <SelectItem value="" disabled>
                          لا توجد مستخدمين متاحين
                        </SelectItem>
                      ) : (
                        users.map((user) => (
                          <SelectItem key={user.id} value={user.id.toString()}>
                            <div className="flex items-center gap-2">
                              <span>{user.name}</span>
                              <span className="text-sm text-gray-500">({user.role === 'plumber' ? 'فني صحي' : 'عميل'})</span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Complaint Type */}
              <div className="space-y-2">
                <Label htmlFor="complaint_type">نوع الشكوى *</Label>
                <Select
                  value={formData.complaint_type}
                  onValueChange={(value) => handleInputChange("complaint_type", value)}
                >
                  <SelectTrigger className="text-end">
                    <SelectValue placeholder="اختر نوع الشكوى" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMPLAINT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>



              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">تفاصيل الشكوى *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  required
                  className="text-end min-h-[120px]"
                  placeholder="اشرح تفاصيل الشكوى بوضوح..."
                />
                <p className="text-sm text-gray-400">
                  يرجى تقديم أكبر قدر من التفاصيل لمساعدتنا في حل المشكلة بسرعة
                </p>
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    جاري الإرسال...
                  </>
                ) : (
                  "إرسال الشكوى"
                )}
              </Button>
            </form>

            {/* Important Notice */}
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-yellow-800 mb-1">
                    ملاحظة مهمة:
                  </p>
                  <p className="text-yellow-700">
                    سيتم الرد على شكواك من خلال صفحة المحادثات. تأكد من تفعيل
                    الإشعارات لتلقي الردود فوراً.
                  </p>
                </div>
              </div>
            </div>

            {/* Support Info */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-400 mb-2">
                في حالة الطوارئ، يمكنك التواصل معنا مباشرة:
              </p>
              <div className="flex justify-center gap-4">
                <Button variant="outline" size="sm" asChild>
                  <Link to="/chat">المحادثة المباشرة</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
