import { useEffect } from 'react';

export interface SEOConfig {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  noindex?: boolean;
  nofollow?: boolean;
  canonicalUrl?: string;
}

export interface GenerateSEOParams {
  title: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  noindex?: boolean;
  nofollow?: boolean;
  canonicalUrl?: string;
}

const DEFAULT_CONFIG = {
  title: 'فني صحي الكويت',
  description: 'منصة الكويت للفنيين الصحيين الموثوقة. احجز أفضل الفنيين الصحيين المرخصين والمؤمنين في جميع مناطق الكويت. خدمة سريعة، أسعار مناسبة، وجودة عالية.',
  keywords: 'فني صحي الكويت، سباك الكويت، إصلاح سباكة، تمديد أنابيب، سخان ماء، حنفيات، مجاري، فني موثوق، صيانة سباكة، خدمات منزلية',
  image: '/og-image.jpg',
  url: 'https://plumber-kuwait.com',
  type: 'website' as const,
  author: 'فني صحي الكويت',
};

export function generateSEOConfig(params: GenerateSEOParams): SEOConfig {
  const baseUrl = DEFAULT_CONFIG.url;
  const fullUrl = params.url ? `${baseUrl}${params.url}` : baseUrl;
  
  // Auto-generate description if not provided
  let description = params.description;
  if (!description && params.title) {
    if (params.type === 'article') {
      description = `${params.title} - دليل شامل من خبراء السباكة في الكويت. احصل على أفضل النصائح والحلول العملية لمشاكل السباكة.`;
    } else if (params.type === 'profile') {
      description = `تواصل مع ${params.title} - فني صحي موثوق في الكويت. شاهد التقييمات والخبرات واحجز موعدك الآن.`;
    } else {
      description = `${params.title} - ${DEFAULT_CONFIG.description}`;
    }
    
    // Ensure description is within 150-160 characters
    if (description.length > 160) {
      description = description.substring(0, 157) + '...';
    }
  }

  return {
    title: `${params.title} | فني صحي الكويت`,
    description: description || DEFAULT_CONFIG.description,
    keywords: params.keywords || DEFAULT_CONFIG.keywords,
    image: params.image || DEFAULT_CONFIG.image,
    url: fullUrl,
    type: params.type || 'website',
    author: params.author || DEFAULT_CONFIG.author,
    publishedTime: params.publishedTime,
    modifiedTime: params.modifiedTime,
    section: params.section,
    noindex: params.noindex || false,
    nofollow: params.nofollow || false,
    canonicalUrl: params.canonicalUrl || fullUrl,
  };
}

export function useSEO(config: SEOConfig) {
  const seoConfig = {
    ...DEFAULT_CONFIG,
    ...config,
  };

  useEffect(() => {
    // Track page view for analytics (if needed)
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('config', 'GA_MEASUREMENT_ID', {
        page_title: seoConfig.title,
        page_location: seoConfig.url,
      });
    }
  }, [seoConfig.title, seoConfig.url]);

  return {
    config: seoConfig,
  };
}

// SEO utility functions
export const SEOUtils = {
  // Generate meta description from content
  generateDescription(content: string, maxLength = 160): string {
    // Remove HTML tags and clean up text
    const cleanText = content
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim();
    
    if (cleanText.length <= maxLength) {
      return cleanText;
    }
    
    // Find the last complete word within the limit
    const truncated = cleanText.substring(0, maxLength);
    const lastSpaceIndex = truncated.lastIndexOf(' ');
    
    if (lastSpaceIndex > maxLength * 0.8) {
      return truncated.substring(0, lastSpaceIndex) + '...';
    }
    
    return truncated.substring(0, maxLength - 3) + '...';
  },
  
  // Generate keywords from content
  generateKeywords(content: string, maxKeywords = 10): string {
    const commonWords = [
      'في', 'من', 'إلى', 'على', 'هذا', 'هذه', 'ذلك', 'تلك', 'التي', 'الذي',
      'كل', 'بعض', 'جميع', 'كان', 'كانت', 'يكون', 'تكون', 'هو', 'هي',
      'أن', 'أو', 'لكن', 'لكي', 'حتى', 'عند', 'عندما', 'كيف', 'ماذا', 'أين'
    ];
    
    const words = content
      .replace(/<[^>]*>/g, '') // Remove HTML
      .replace(/[^\u0600-\u06FF\s]/g, '') // Keep only Arabic letters and spaces
      .split(/\s+/)
      .filter(word => word.length > 2 && !commonWords.includes(word))
      .map(word => word.trim())
      .filter(word => word.length > 0);
    
    // Count word frequency
    const wordCount: Record<string, number> = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });
    
    // Sort by frequency and take top keywords
    const keywords = Object.entries(wordCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, maxKeywords)
      .map(([word]) => word);
    
    return keywords.join(', ');
  },
  
  // Generate structured data for local business
  generateLocalBusinessSchema(plumberData?: {
    name: string;
    description: string;
    phone?: string;
    address?: string;
    rating?: number;
    reviewCount?: number;
  }) {
    if (!plumberData) return null;
    
    return {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "@id": "https://plumber-kuwait.com",
      "name": plumberData.name,
      "description": plumberData.description,
      "url": "https://plumber-kuwait.com",
      "telephone": plumberData.phone,
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "KW",
        "addressLocality": "Kuwait",
        "streetAddress": plumberData.address,
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": "29.3117",
        "longitude": "47.4818"
      },
      "aggregateRating": plumberData.rating ? {
        "@type": "AggregateRating",
        "ratingValue": plumberData.rating,
        "reviewCount": plumberData.reviewCount || 1
      } : undefined,
      "serviceArea": {
        "@type": "GeoCircle",
        "geoMidpoint": {
          "@type": "GeoCoordinates",
          "latitude": "29.3117",
          "longitude": "47.4818"
        },
        "geoRadius": "50000"
      },
      "priceRange": "$$",
      "currenciesAccepted": "KWD",
      "paymentAccepted": "Cash, Credit Card",
      "openingHours": "Mo-Su 00:00-24:00"
    };
  },
  
  // Generate breadcrumb structured data
  generateBreadcrumbSchema(breadcrumbs: Array<{ name: string; url: string }>) {
    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumbs.map((crumb, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": crumb.name,
        "item": crumb.url
      }))
    };
  }
};
