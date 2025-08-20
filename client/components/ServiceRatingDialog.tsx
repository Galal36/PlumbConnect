import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, CheckCircle } from "lucide-react";
import { servicesApiService, ServiceRequest } from "@/services/servicesApi";
import { toast } from "sonner";

interface ServiceRatingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  serviceRequest: ServiceRequest;
  onRatingSubmitted: () => void;
}

export default function ServiceRatingDialog({
  isOpen,
  onClose,
  serviceRequest,
  onRatingSubmitted,
}: ServiceRatingDialogProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    setRating(0);
    setHoveredRating(0);
    setComment('');
    setIsSubmitting(false);
    onClose();
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('يرجى اختيار تقييم للخدمة');
      return;
    }

    if (!comment.trim()) {
      toast.error('يرجى كتابة تعليق على الخدمة');
      return;
    }

    try {
      setIsSubmitting(true);
      await servicesApiService.createReview({
        service_request: serviceRequest.id,
        rating,
        comment: comment.trim(),
      });

      toast.success('تم إرسال التقييم بنجاح');
      onRatingSubmitted();
      handleClose();
    } catch (error: any) {
      console.error('Failed to create review:', error);
      toast.error(error.message || 'فشل في إرسال التقييم');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1;
      const isActive = starValue <= (hoveredRating || rating);

      return (
        <button
          key={index}
          type="button"
          onClick={() => setRating(starValue)}
          onMouseEnter={() => setHoveredRating(starValue)}
          onMouseLeave={() => setHoveredRating(0)}
          className={`p-1 transition-colors ${
            isActive ? 'text-yellow-400' : 'text-gray-300'
          } hover:text-yellow-400`}
          disabled={isSubmitting}
        >
          <Star
            className={`h-8 w-8 ${
              isActive ? 'fill-current' : ''
            }`}
          />
        </button>
      );
    });
  };

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1: return 'سيء جداً';
      case 2: return 'سيء';
      case 3: return 'متوسط';
      case 4: return 'جيد';
      case 5: return 'ممتاز';
      default: return '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-right">
            <CheckCircle className="h-5 w-5 text-green-600" />
            تقييم الخدمة - {serviceRequest.receiver_details.name}
          </DialogTitle>
          <DialogDescription className="text-right">
            يرجى تقييم جودة الخدمة المقدمة وكتابة تعليق يساعد المستخدمين الآخرين
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Success Message */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-sm text-green-800 leading-relaxed">
              <p className="font-semibold mb-2">تم قبول الخدمة بنجاح!</p>
              <p className="mb-2">
                السعر المتفق عليه: <span className="font-semibold">{serviceRequest.amount} د.ك</span>
              </p>
              <p>
                يرجى تقييم الخدمة المقدمة من <span className="font-semibold">{serviceRequest.receiver_details.name}</span>
              </p>
            </div>
          </div>

          {/* Rating Stars */}
          <div className="space-y-3">
            <Label className="text-right block">
              تقييم الخدمة *
            </Label>
            <div className="flex items-center justify-center gap-1">
              {renderStars()}
            </div>
            {(hoveredRating || rating) > 0 && (
              <p className="text-center text-sm text-gray-600">
                {getRatingText(hoveredRating || rating)}
              </p>
            )}
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment" className="text-right">
              تعليق على الخدمة *
            </Label>
            <Textarea
              id="comment"
              placeholder="اكتب تعليقك على جودة الخدمة المقدمة..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="text-right resize-none"
              rows={4}
              disabled={isSubmitting}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || rating === 0 || !comment.trim()}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? 'جاري الإرسال...' : 'إرسال التقييم'}
            </Button>
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              تخطي التقييم
            </Button>
          </div>

          {/* Note */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800 text-center">
              ملاحظة: التقييم سيساعد المستخدمين الآخرين في اختيار أفضل الفنيين
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
