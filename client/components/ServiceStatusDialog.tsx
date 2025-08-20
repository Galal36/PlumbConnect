import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, DollarSign } from "lucide-react";
import { servicesApiService, ServiceRequest } from "@/services/servicesApi";
import { toast } from "sonner";

interface ServiceStatusDialogProps {
  isOpen: boolean;
  onClose: () => void;
  serviceRequest: ServiceRequest;
  onServiceUpdated: (updatedService: ServiceRequest) => void;
  onShowRating?: (service: ServiceRequest) => void;
}

export default function ServiceStatusDialog({
  isOpen,
  onClose,
  serviceRequest,
  onServiceUpdated,
  onShowRating,
}: ServiceStatusDialogProps) {
  const [price, setPrice] = useState(serviceRequest.amount || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    setPrice(serviceRequest.amount || '');
    setIsSubmitting(false);
    onClose();
  };

  const handleAccept = async () => {
    const priceValue = parseFloat(price);
    if (!price.trim() || isNaN(priceValue) || priceValue <= 0) {
      toast.error('يرجى إدخال سعر صحيح للخدمة');
      return;
    }

    try {
      setIsSubmitting(true);
      const updatedService = await servicesApiService.acceptServiceRequest(
        serviceRequest.id,
        priceValue
      );
      
      toast.success('تم قبول الخدمة بنجاح');
      onServiceUpdated(updatedService);
      handleClose();

      // Show rating dialog immediately after accepting
      if (onShowRating) {
        setTimeout(() => {
          onShowRating(updatedService);
        }, 500); // Small delay to allow the dialog to close first
      }
    } catch (error: any) {
      console.error('Failed to accept service:', error);
      toast.error(error.message || 'فشل في قبول الخدمة');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    try {
      setIsSubmitting(true);
      const updatedService = await servicesApiService.rejectServiceRequest(serviceRequest.id);
      
      toast.success('تم رفض الخدمة');
      onServiceUpdated(updatedService);
      handleClose();
    } catch (error: any) {
      console.error('Failed to reject service:', error);
      toast.error(error.message || 'فشل في رفض الخدمة');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComplete = async () => {
    try {
      setIsSubmitting(true);
      const updatedService = await servicesApiService.completeServiceRequest(serviceRequest.id);
      
      toast.success('تم إكمال الخدمة بنجاح');
      onServiceUpdated(updatedService);
      handleClose();
    } catch (error: any) {
      console.error('Failed to complete service:', error);
      toast.error(error.message || 'فشل في إكمال الخدمة');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            في الانتظار
          </Badge>
        );
      case 'accepted':
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            مقبولة
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            مرفوضة
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            مكتملة
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right">
            إدارة طلب الخدمة
          </DialogTitle>
          <DialogDescription className="text-right">
            يمكنك قبول أو رفض طلب الخدمة وإدارة حالتها
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Service Info */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">معلومات الخدمة</h3>
              {getStatusBadge(serviceRequest.status)}
            </div>
            
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">العميل:</span> {serviceRequest.sender_details.name}</p>
              <p><span className="font-medium">الفني:</span> {serviceRequest.receiver_details.name}</p>
              <p><span className="font-medium">رقم الخدمة:</span> #{serviceRequest.id}</p>
              {serviceRequest.amount && parseFloat(serviceRequest.amount) > 0 && (
                <p className="flex items-center gap-1">
                  <span className="font-medium">السعر:</span>
                  <DollarSign className="h-4 w-4" />
                  {serviceRequest.amount} د.ك
                </p>
              )}
            </div>
          </div>

          {/* Actions based on status */}
          {serviceRequest.status === 'pending' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="price" className="text-right">
                  سعر الخدمة (دينار كويتي) *
                </Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="أدخل سعر الخدمة"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="text-right"
                  disabled={isSubmitting}
                  min="0"
                  step="0.1"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleAccept}
                  disabled={isSubmitting || !price.trim()}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? 'جاري القبول...' : 'قبول الخدمة'}
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? 'جاري الرفض...' : 'رفض الخدمة'}
                </Button>
              </div>
            </div>
          )}

          {serviceRequest.status === 'accepted' && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 text-sm">
                  تم قبول الخدمة{serviceRequest.amount && parseFloat(serviceRequest.amount) > 0 ? ` بسعر ${serviceRequest.amount} د.ك` : ''}. يمكنك الآن إكمال الخدمة عند الانتهاء من العمل.
                </p>
              </div>

              <Button
                onClick={handleComplete}
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? 'جاري الإكمال...' : 'إكمال الخدمة'}
              </Button>
            </div>
          )}

          {serviceRequest.status === 'completed' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm">
                تم إكمال الخدمة بنجاح. يمكن للعميل الآن تقييم الخدمة.
              </p>
            </div>
          )}

          {serviceRequest.status === 'rejected' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">
                تم رفض هذه الخدمة.
              </p>
            </div>
          )}

          {/* Close Button */}
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
            className="w-full"
          >
            إغلاق
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
