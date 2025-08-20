import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Wrench } from "lucide-react";
import { servicesApiService } from "@/services/servicesApi";
import { toast } from "sonner";

interface RequestServiceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  plumberId: number;
  plumberName: string;
}

export default function RequestServiceDialog({
  isOpen,
  onClose,
  plumberId,
  plumberName,
}: RequestServiceDialogProps) {
  const [step, setStep] = useState<'info' | 'confirm'>('info');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    setStep('info');
    setIsSubmitting(false);
    onClose();
  };

  const handleContinue = () => {
    setStep('confirm');
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await servicesApiService.createServiceRequest({
        receiver: plumberId,
        amount: 0,
      });

      toast.success('تم إرسال طلب الخدمة بنجاح');
      handleClose();
    } catch (error: any) {
      console.error('Failed to create service request:', error);
      toast.error(error.message || 'فشل في إرسال طلب الخدمة');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-right">
            <Wrench className="h-5 w-5 text-primary" />
            طلب خدمة من {plumberName}
          </DialogTitle>
          <DialogDescription className="text-right">
            اقرأ التعليمات بعناية قبل إرسال طلب الخدمة
          </DialogDescription>
        </DialogHeader>

        {step === 'info' && (
          <div className="space-y-4">
            {/* Warning Message */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-800 leading-relaxed">
                  <p className="font-semibold mb-2">تعليمات مهمة قبل طلب الخدمة:</p>
                  <p className="mb-3">
                    يجب عليك الاتفاق على جميع البنود والطلبات من خلال الرسائل ثم بعد ذلك اضغط على زر طلب الخدمة.
                  </p>
                  <p className="mb-3">
                    عند طلب الخدمة تكون خدمتك في مرحلة التنفيذ (pending) ثم بعد ذلك عند الإتمام يجب عليك الدخول لقبولها وإضافة مقدار المال الذي تم دفعه.
                  </p>
                  <p>
                    في حالة أن العمل لم يتم فيمكنك رفض وإغلاق الخدمة.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleContinue}
                className="flex-1"
              >
                متابعة طلب الخدمة
              </Button>
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                إلغاء
              </Button>
            </div>
          </div>
        )}

        {step === 'confirm' && (
          <div className="space-y-4">
            {/* Confirmation Message */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-sm text-blue-800 leading-relaxed">
                <p className="font-semibold mb-2">تأكيد طلب الخدمة:</p>
                <p className="mb-3">
                  سيتم إرسال طلب خدمة إلى <span className="font-semibold">{plumberName}</span>
                </p>
                <p>
                  يمكنكم التواصل من خلال الرسائل لتحديد تفاصيل الخدمة المطلوبة.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? 'جاري الإرسال...' : 'تأكيد طلب الخدمة'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setStep('info')}
                disabled={isSubmitting}
                className="flex-1"
              >
                رجوع
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
