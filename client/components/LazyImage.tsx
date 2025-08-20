import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  width?: number;
  height?: number;
  onLoad?: () => void;
  onError?: () => void;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
}

export default function LazyImage({
  src,
  alt,
  className,
  placeholder = '/placeholder.svg',
  width,
  height,
  onLoad,
  onError,
  loading = 'lazy',
  priority = false,
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (priority || loading === 'eager') {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.1,
      }
    );

    const currentImg = imgRef.current;
    if (currentImg) {
      observer.observe(currentImg);
    }

    return () => {
      if (currentImg) {
        observer.unobserve(currentImg);
      }
    };
  }, [priority, loading]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Generate alt text from context if not provided or generic
  const getOptimizedAlt = (originalAlt: string): string => {
    if (!originalAlt || originalAlt === 'Image' || originalAlt === 'صورة') {
      // Extract potential context from src
      const filename = src.split('/').pop()?.split('.')[0] || '';
      if (filename.includes('plumber')) return 'فني صحي في الكويت';
      if (filename.includes('service')) return 'خدمة سباكة في الكويت';
      if (filename.includes('repair')) return 'إصلاح سباكة';
      if (filename.includes('pipe')) return 'تمديد أنابيب';
      if (filename.includes('faucet')) return 'إصلاح حنفيات';
      return 'خدمات فني صحي الكويت';
    }
    return originalAlt;
  };

  const optimizedAlt = getOptimizedAlt(alt);

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Placeholder/Loading state */}
      {!isLoaded && !hasError && (
        <img
          src={placeholder}
          alt=""
          className={cn(
            'absolute inset-0 w-full h-full object-cover transition-opacity duration-300',
            isInView ? 'opacity-50' : 'opacity-100'
          )}
          aria-hidden="true"
        />
      )}
      
      {/* Main image */}
      <img
        ref={imgRef}
        src={isInView ? src : undefined}
        alt={optimizedAlt}
        width={width}
        height={height}
        loading={loading}
        className={cn(
          'w-full h-full object-cover transition-opacity duration-300',
          isLoaded ? 'opacity-100' : 'opacity-0',
          hasError && 'hidden'
        )}
        onLoad={handleLoad}
        onError={handleError}
        decoding={priority ? 'sync' : 'async'}
      />
      
      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-500">
          <span className="text-sm">فشل تحميل الصورة</span>
        </div>
      )}
      
      {/* Loading indicator */}
      {isInView && !isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}

// Hook for generating SEO-friendly alt text based on context
export function useImageAlt(context?: {
  type?: 'profile' | 'service' | 'article' | 'general';
  name?: string;
  service?: string;
  location?: string;
}) {
  const generateAlt = (originalAlt?: string): string => {
    if (originalAlt && originalAlt.length > 5 && !originalAlt.includes('placeholder')) {
      return originalAlt;
    }

    if (!context) return 'فني صحي الكويت';

    const { type, name, service, location } = context;
    
    switch (type) {
      case 'profile':
        return `صورة ${name || 'فني صحي'} ${location ? `في ${location}` : 'في الكويت'}`;
      case 'service':
        return `خدمة ${service || 'سباكة'} ${location ? `في ${location}` : 'في الكويت'}`;
      case 'article':
        return `صورة توضيحية - ${name || 'دليل السباكة في الكويت'}`;
      default:
        return 'خدمات فني صحي موثوق في الكويت';
    }
  };

  return { generateAlt };
}
