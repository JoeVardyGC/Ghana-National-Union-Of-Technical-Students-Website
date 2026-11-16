import type { MetadataRoute } from 'next';
import { absoluteUrl, SITE_URL } from '@/lib/siteUrl';

// Served at /robots.txt. Lets search engines crawl the public site, keeps them
// out of the admin portal and API, and points them to the sitemap.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api/'],
    },
    sitemap: absoluteUrl('/sitemap.xml'),
    host: SITE_URL,
  };
}
