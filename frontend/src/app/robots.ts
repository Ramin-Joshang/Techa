import { MetadataRoute } from 'next';
import { getSiteUrl } from '../lib/seo';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/docs', '/docs/', '/roadmap', '/about', '/faq', '/contact'],
      disallow: [
        '/api/',
        '/admin/',
        '/account/',
        '/sandbox/',
        '/verify-otp',
        '/forgot-password',
        '/reset-password',
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
