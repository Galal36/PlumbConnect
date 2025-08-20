import { writeFileSync } from 'fs';
import { join } from 'path';

interface SitemapEntry {
  url: string;
  lastModified?: string;
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

const BASE_URL = 'https://plumber-kuwait.com';

const staticPages: SitemapEntry[] = [
  {
    url: '/',
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily',
    priority: 1.0
  },
  {
    url: '/plumbers',
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily',
    priority: 0.9
  },
  {
    url: '/services',
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly',
    priority: 0.8
  },
  {
    url: '/articles',
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily',
    priority: 0.8
  },
  {
    url: '/posts',
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily',
    priority: 0.7
  },
  {
    url: '/how-to-choose',
    lastModified: new Date().toISOString(),
    changeFrequency: 'monthly',
    priority: 0.6
  }
];

// Mock dynamic pages - in real app, these would come from API/database
const dynamicPages: SitemapEntry[] = [
  // Sample plumber profiles
  {
    url: '/plumber/1',
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly',
    priority: 0.7
  },
  {
    url: '/plumber/2',
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly',
    priority: 0.7
  },
  {
    url: '/plumber/3',
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly',
    priority: 0.7
  },
  
  // Sample articles
  {
    url: '/articles/1',
    lastModified: new Date().toISOString(),
    changeFrequency: 'monthly',
    priority: 0.6
  },
  {
    url: '/articles/2',
    lastModified: new Date().toISOString(),
    changeFrequency: 'monthly',
    priority: 0.6
  },
  {
    url: '/articles/3',
    lastModified: new Date().toISOString(),
    changeFrequency: 'monthly',
    priority: 0.6
  },
  
  // Sample posts
  {
    url: '/posts/1',
    lastModified: new Date().toISOString(),
    changeFrequency: 'monthly',
    priority: 0.5
  },
  {
    url: '/posts/2',
    lastModified: new Date().toISOString(),
    changeFrequency: 'monthly',
    priority: 0.5
  }
];

function generateSitemap(): string {
  const allPages = [...staticPages, ...dynamicPages];
  
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
  .map(
    (page) => `  <url>
    <loc>${BASE_URL}${page.url}</loc>
    ${page.lastModified ? `    <lastmod>${page.lastModified}</lastmod>` : ''}
    ${page.changeFrequency ? `    <changefreq>${page.changeFrequency}</changefreq>` : ''}
    ${page.priority ? `    <priority>${page.priority}</priority>` : ''}
  </url>`
  )
  .join('\n')}
</urlset>`;

  return sitemapXml;
}

// Generate and save sitemap
const sitemap = generateSitemap();
const outputPath = join(process.cwd(), 'public', 'sitemap.xml');

try {
  writeFileSync(outputPath, sitemap, 'utf-8');
  console.log('✅ Sitemap generated successfully at:', outputPath);
  console.log(`📄 Generated ${staticPages.length + dynamicPages.length} URLs`);
} catch (error) {
  console.error('❌ Error generating sitemap:', error);
  process.exit(1);
}
