import { Star } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { LoadingState, ErrorState } from "@/components/ui/loading";
import { useUserReviews } from "@/hooks/useApi";

interface ReviewsSectionProps {
  userId: string;
}

export default function ReviewsSection({ userId }: ReviewsSectionProps) {
  const { data: reviews, loading, error, refetch } = useUserReviews(userId);

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInDays = Math.floor(
      (now.getTime() - time.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffInDays < 1) return "اليوم";
    if (diffInDays < 30) return `منذ ${diffInDays} يوم`;
    return `منذ ${Math.floor(diffInDays / 30)} شهر`;
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  if (loading) {
    return <LoadingState message="جاري تحميل التقييمات..." />;
  }

  if (error) {
    return <ErrorState message={error.message} onRetry={refetch} />;
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">لا توجد تقييمات حتى الآن</p>
      </div>
    );
  }

  const averageRating =
    reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="text-4xl font-bold text-primary">
            {averageRating.toFixed(1)}
          </div>
          <div>
            <div className="flex gap-1 mb-1">
              {renderStars(Math.round(averageRating))}
            </div>
            <p className="text-gray-400 text-sm">{reviews.length} تقييم</p>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-start gap-3 mb-4">
              <Avatar className="w-10 h-10">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback>{review.makerName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-white">
                    {review.makerName}
                  </h4>
                  <span className="text-sm text-gray-400">
                    {formatTimeAgo(review.createdAt)}
                  </span>
                </div>
                <div className="flex gap-1 mt-1">
                  {renderStars(review.rating)}
                </div>
              </div>
            </div>
            <p className="text-gray-300 leading-relaxed">{review.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
