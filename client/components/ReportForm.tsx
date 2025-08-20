import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Flag, Send, AlertCircle, Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import {
  useCreateReport,
  useUpdateReport,
  useDeleteReport,
} from "@/hooks/useApi";
import { LoadingSpinner } from "@/components/ui/loading";
import { useAuthContext } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { CreateReportPayload, UpdateReportPayload } from "@/services/reportsApi";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatError } from "@/utils";
import type { Report } from "@/types";

interface ReportFormProps {
  type: "post" | "comment" | "reply-comment";
  targetId: number;
  targetAuthor?: string;
  children?: React.ReactNode;
  existingReport?: Report;
  onReportChange?: () => void;
}

export default function ReportForm({
  type,
  targetId,
  targetAuthor,
  children,
  existingReport,
  onReportChange,
}: ReportFormProps) {
  const { isAuthenticated, user } = useAuthContext();
  const [open, setOpen] = useState(false);
  const [reportReason, setReportReason] = useState(
    existingReport?.reason.split(": ")[0] || "",
  );
  const [reportDetails, setReportDetails] = useState(
    existingReport?.reason.split(": ")[1] || "",
  );
  const [isEditing, setIsEditing] = useState(false);

  const { createReport, loading: createLoading, error: createError } = useCreateReport();
  const { updateReport, loading: updateLoading, error: updateError } = useUpdateReport();
  const { deleteReport, loading: deleteLoading, error: deleteError } = useDeleteReport();

  const loading = createLoading || updateLoading || deleteLoading;
  const error = createError || updateError || deleteError;

  const reportReasons = [
    { value: "محتوى مزعج أو سبام", label: "محتوى مزعج أو سبام" },
    { value: "محتوى غير لائق", label: "محتوى غير لائق" },
    { value: "معلومات مضللة", label: "معلومات مضللة" },
    { value: "تحرش أو إساءة", label: "تحرش أو إساءة" },
    { value: "محاولة احتيال", label: "محاولة احتيال" },
    { value: "انتهاك حقوق الطبع والنشر", label: "انتهاك حقوق الطبع والنشر" },
    { value: "أخرى", label: "أخرى" },
  ];

  const getContentType = (reportType: string) => {
    switch (reportType) {
      case "post":
        return "post";
      case "comment":
        return "comment";
      case "reply-comment":
        return "comment_reply";
      default:
        return "post";
    }
  };

  const getTitle = (reportType: string) => {
    switch (reportType) {
      case "post":
        return "البوست";
      case "comment":
        return "التعليق";
      case "reply-comment":
        return "الرد";
      default:
        return "المحتوى";
    }
  };

  const resetForm = () => {
    setReportReason(existingReport?.reason.split(": ")[0] || "");
    setReportDetails(existingReport?.reason.split(": ")[1] || "");
    setIsEditing(false);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportReason || !reportDetails.trim() || loading) return;
    try {
      const payload: CreateReportPayload = {
        reason: `${reportReason}: ${reportDetails}`,
        target_type: getContentType(type) as
          | "post"
          | "comment"
          | "comment_reply",
        target_id: targetId,
      };
      await createReport(payload);
      alert(
        "تم إرسال البلاغ بنجاح. شكراً لك على المساعدة في الحفاظ على جودة المحتوى.",
      );
      setOpen(false);
      resetForm();
      if (onReportChange) onReportChange();
    } catch (err) {
      alert("حدث خطأ أثناء إرسال البلاغ. يرجى المحاولة مرة أخرى.");
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!existingReport || !reportReason || !reportDetails.trim() || loading) return;
    try {
      const payload: UpdateReportPayload = {
        reason: `${reportReason}: ${reportDetails}`,
      };
      await updateReport(existingReport.id, payload);
      alert("تم تعديل البلاغ بنجاح.");
      setOpen(false);
      resetForm();
      if (onReportChange) onReportChange();
    } catch (err) {
      alert("حدث خطأ أثناء تعديل البلاغ. يرجى المحاولة مرة أخرى.");
    }
  };

  const handleDelete = async () => {
    if (!existingReport || !confirm("هل أنت متأكد أنك تريد حذف هذا البلاغ؟")) return;
    try {
      await deleteReport(existingReport.id);
      alert("تم حذف البلاغ بنجاح.");
      setOpen(false);
      if (onReportChange) onReportChange();
    } catch (err) {
      alert("حدث خطأ أثناء حذف البلاغ. يرجى المحاولة مرة أخرى.");
    }
  };

  // If user is not authenticated, show login prompt
  if (!isAuthenticated) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {children || (
            <Button variant="ghost" size="sm">
              <Flag className="h-4 w-4" />
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[400px]" dir="rtl">
          <DialogHeader>
            <DialogTitle>تسجيل دخول مطلوب</DialogTitle>
            <DialogDescription>
              يجب تسجيل دخول أولاً لتتمكن من إرسال بلاغ عن هذا المحتوى.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-center pt-4">
            <Button asChild>
              <Link to="/login">تسجيل دخول</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/register">حساب جديد</Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Render different UI based on whether a report already exists and if the current user is the owner
  const isOwner = user && existingReport && existingReport.user.id === user.id;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="ghost" size="sm">
            {isOwner ? (
              <Edit className="h-4 w-4" />
            ) : (
              <Flag className="h-4 w-4" />
            )}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>
            {isOwner ? `إدارة بلاغك عن ${getTitle(type)}` : `إبلاغ عن ${getTitle(type)}`}
          </DialogTitle>
          <DialogDescription>
            {isOwner
              ? "يمكنك تعديل أو حذف بلاغك. كن دقيقاً في التعديل."
              : "يرجى اختيار سبب البلاغ وكتابة تفاصيل المشكلة لمساعدتنا في مراجعة المحتوى."}
          </DialogDescription>
        </DialogHeader>

        {isOwner && !isEditing ? (
          // View/Manage Report UI
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>سبب البلاغ</Label>
              <p className="text-sm font-semibold">{reportReason}</p>
            </div>
            <div className="space-y-2">
              <Label>تفاصيل البلاغ</Label>
              <p className="text-sm text-gray-400">{reportDetails}</p>
            </div>
            <div className="flex flex-row-reverse gap-2">
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 ms-2" />
                تعديل البلاغ
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={loading}>
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" className="ms-2" />
                    جاري الحذف...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 ms-2" />
                    حذف البلاغ
                  </>
                )}
              </Button>
              <DialogClose asChild>
                <Button variant="outline">إغلاق</Button>
              </DialogClose>
            </div>
          </div>
        ) : (
          // Create/Edit Form UI
          <form
            onSubmit={isOwner ? handleUpdateSubmit : handleCreateSubmit}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="reason">سبب البلاغ</Label>
              <Select
                value={reportReason}
                onValueChange={setReportReason}
                required
              >
                <SelectTrigger className="text-end">
                  <SelectValue placeholder="اختر سبب البلاغ" />
                </SelectTrigger>
                <SelectContent>
                  {reportReasons.map((reason) => (
                    <SelectItem key={reason.value} value={reason.value}>
                      {reason.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="details">تفاصيل المشكلة</Label>
              <Textarea
                id="details"
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                placeholder="يرجى كتابة تفاصيل المشكلة أو السبب وراء هذا البلاغ..."
                className="text-end resize-none min-h-[100px]"
                required
                maxLength={500}
              />
              <p className="text-sm text-gray-500 text-end">
                {reportDetails.length}/500 حرف
              </p>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>معلومات الإبلاغ:</strong>
              </p>
              <p className="text-sm text-gray-600">• النوع: {getTitle(type)}</p>
              {targetAuthor && (
                <p className="text-sm text-gray-600">
                  • الكاتب: {targetAuthor}
                </p>
              )}
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{formatError(error)}</AlertDescription>
              </Alert>
            )}

            <DialogFooter className="flex flex-row-reverse gap-2">
              <Button
                type="submit"
                disabled={!reportReason || !reportDetails.trim() || loading}
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" className="ms-2" />
                    جاري الإرسال...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 ms-2" />
                    {isOwner ? "تعديل البلاغ" : "إرسال البلاغ"}
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOpen(false);
                  resetForm();
                }}
              >
                إلغاء
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
} 