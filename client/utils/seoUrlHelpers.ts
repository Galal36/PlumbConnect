/**
 * SEO-friendly URL helper functions
 */

// Generate SEO-friendly slug from title
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    // Replace Arabic spaces and special characters
    .replace(/[\u0600-\u06FF\s]+/g, '-') // Replace Arabic text with hyphens
    .replace(/[^\w\-]+/g, '') // Remove non-word characters except hyphens
    .replace(/\-\-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+/, '') // Remove leading hyphens
    .replace(/-+$/, ''); // Remove trailing hyphens
}

// Generate article URL with SEO-friendly slug
export function generateArticleUrl(id: string, title: string): string {
  const slug = generateSlug(title);
  return `/articles/${id}/${slug}`;
}

// Generate post URL with SEO-friendly slug
export function generatePostUrl(id: string, title: string): string {
  const slug = generateSlug(title);
  return `/posts/${id}/${slug}`;
}

// Generate plumber profile URL with SEO-friendly slug
export function generatePlumberUrl(id: string, name: string, city?: string): string {
  const nameSlug = generateSlug(name);
  const citySlug = city ? generateSlug(city) : '';
  const fullSlug = citySlug ? `${nameSlug}-${citySlug}` : nameSlug;
  return `/plumber/${id}/${fullSlug}`;
}

// Generate service URL with SEO-friendly slug
export function generateServiceUrl(id: string, title: string): string {
  const slug = generateSlug(title);
  return `/services/${id}/${slug}`;
}

// Extract ID from SEO-friendly URL
export function extractIdFromUrl(url: string): string | null {
  const segments = url.split('/');
  // Assuming format: /type/id/slug
  if (segments.length >= 3) {
    return segments[2];
  }
  return null;
}

// URL validation for SEO
export function isValidSEOUrl(url: string): boolean {
  // Check if URL follows SEO best practices
  const seoPattern = /^\/[a-z0-9-]+\/[a-z0-9-]+(?:\/[a-z0-9-]+)?$/;
  return seoPattern.test(url);
}

// Generate breadcrumb data from URL
export function generateBreadcrumbs(pathname: string): Array<{ name: string; url: string }> {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs: Array<{ name: string; url: string }> = [
    { name: 'الرئيسية', url: '/' }
  ];

  let currentPath = '';
  
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    
    // Map segments to Arabic names
    const segmentNames: Record<string, string> = {
      'plumbers': 'الفنيين الصحيين',
      'plumber': 'الفني الصحي',
      'articles': 'المقالات',
      'posts': 'المنشورات',
      'services': 'الخدمات',
      'how-to-choose-plumber': 'كيف تختار فني صحي',
      'login': 'تسجيل الدخول',
      'register': 'إنشاء حساب',
      'profile': 'الملف الشخصي',
      'chat': 'المحادثات',
      'notifications': 'الإشعارات'
    };

    const name = segmentNames[segment] || segment;
    
    // Don't add IDs or slugs to breadcrumbs
    if (!segment.match(/^[0-9]+$/) && index < 2) {
      breadcrumbs.push({ name, url: currentPath });
    }
  });

  return breadcrumbs;
}

// Meta title optimization
export function optimizeTitleForSEO(title: string, type?: 'home' | 'category' | 'detail'): string {
  const siteName = 'فني صحي الكويت';
  
  switch (type) {
    case 'home':
      return `${title} | ${siteName}`;
    case 'category':
      return `${title} - ${siteName}`;
    case 'detail':
      return `${title} | ${siteName}`;
    default:
      return `${title} - ${siteName}`;
  }
}

// Generate canonical URL
export function generateCanonicalUrl(pathname: string, baseUrl: string = 'https://plumber-kuwait.com'): string {
  // Remove trailing slashes and query parameters
  const cleanPath = pathname.replace(/\/$/, '') || '/';
  return `${baseUrl}${cleanPath}`;
}
