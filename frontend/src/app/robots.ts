import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/docs', '/docs/*'],
      disallow: ['/api/', '/admin/', '/account/'],
    },
    sitemap: 'https://techa.ir/sitemap.xml',
  };
}
