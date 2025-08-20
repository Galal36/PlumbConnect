import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  totalReviews?: number;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export default function StarRating({ 
  rating, 
  totalReviews, 
  size = 'md', 
  showText = true,
  className = '' 
}: StarRatingProps) {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star
          key={`full-${i}`}
          className={`${sizeClasses[size]} text-yellow-400 fill-current`}
        />
      );
    }

    // Half star
    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative">
          <Star className={`${sizeClasses[size]} text-gray-300`} />
          <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
            <Star className={`${sizeClasses[size]} text-yellow-400 fill-current`} />
          </div>
        </div>
      );
    }

    // Empty stars
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star
          key={`empty-${i}`}
          className={`${sizeClasses[size]} text-gray-300`}
        />
      );
    }

    return stars;
  };

  const getRatingText = (rating: number) => {
    if (rating === 0) return 'لا توجد تقييمات';
    if (rating < 2) return 'ضعيف';
    if (rating < 3) return 'مقبول';
    if (rating < 4) return 'جيد';
    if (rating < 4.5) return 'جيد جداً';
    return 'ممتاز';
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Stars */}
      <div className="flex items-center gap-0.5">
        {renderStars()}
      </div>

      {/* Rating text and count */}
      {showText && (
        <div className={`flex items-center gap-1 ${textSizeClasses[size]} text-gray-600`}>
          <span className="font-medium">
            {rating > 0 ? rating.toFixed(1) : '0.0'}
          </span>
          <span className="text-gray-500">
            ({totalReviews || 0} {totalReviews === 1 ? 'تقييم' : 'تقييمات'})
          </span>
          {rating > 0 && (
            <span className="text-gray-500 mr-1">
              • {getRatingText(rating)}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
