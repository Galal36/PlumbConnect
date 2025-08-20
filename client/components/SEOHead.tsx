import { Helmet } from 'react-helmet-async';
import { SEOConfig } from '@/hooks/useSEO';

interface SEOHeadProps {
  config: SEOConfig;
  structuredData?: Record<string, any>;
}

export default function SEOHead({ config, structuredData }: SEOHeadProps) {
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{config.title}</title>
      <meta name="description" content={config.description} />
      <meta name="keywords" content={config.keywords} />
      {config.author && <meta name="author" content={config.author} />}
      
      {/* Canonical URL */}
      <link rel="canonical" href={config.canonicalUrl} />
      
      {/* Robots */}
      <meta 
        name="robots" 
        content={`${config.noindex ? 'noindex' : 'index'},${config.nofollow ? 'nofollow' : 'follow'}`} 
      />
      
      {/* Open Graph */}
      <meta property="og:type" content={config.type} />
      <meta property="og:title" content={config.title} />
      <meta property="og:description" content={config.description} />
      {config.image && <meta property="og:image" content={config.image} />}
      <meta property="og:url" content={config.url} />
      <meta property="og:site_name" content="فني صحي الكويت" />
      <meta property="og:locale" content="ar_KW" />
      
      {/* Article specific Open Graph */}
      {config.type === 'article' && (
        <>
          {config.author && <meta property="article:author" content={config.author} />}
          {config.publishedTime && <meta property="article:published_time" content={config.publishedTime} />}
          {config.modifiedTime && <meta property="article:modified_time" content={config.modifiedTime} />}
          {config.section && <meta property="article:section" content={config.section} />}
        </>
      )}
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={config.title} />
      <meta name="twitter:description" content={config.description} />
      {config.image && <meta name="twitter:image" content={config.image} />}
      
      {/* Additional SEO Tags */}
      <meta name="language" content="Arabic" />
      <meta name="geo.region" content="KW" />
      <meta name="geo.country" content="Kuwait" />
      <meta name="geo.placename" content="Kuwait" />
      
      {/* Mobile/Responsive */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="format-detection" content="telephone=yes" />
      
      {/* Theme Color */}
      <meta name="theme-color" content="#3B82F6" />
      <meta name="msapplication-TileColor" content="#3B82F6" />
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
}
