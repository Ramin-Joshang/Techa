import { MetadataRoute } from 'next';
import { getPublishedCourses, getCourseOutline } from '../lib/server';
import { getSiteUrl } from '../lib/seo';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/docs`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/roadmap`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.75,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.75,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  try {
    const allCourses = [];
    let page = 1;
    let totalPages = 1;

    do {
      const pageRes = await getPublishedCourses({
        page,
        limit: 50,
        noStore: true,
      });
      allCourses.push(...(pageRes?.courses || []));
      totalPages = pageRes?.totalPages || 1;
      page += 1;
    } while (page <= totalPages && page <= 20);

    const dynamicRoutes: MetadataRoute.Sitemap = [];

    for (const course of allCourses) {
      dynamicRoutes.push({
        url: `${baseUrl}/docs/${course.slug}`,
        lastModified: new Date(course.publishedAt || now),
        changeFrequency: 'weekly',
        priority: 0.85,
      });

      try {
        const outline = await getCourseOutline(course.slug);
        for (const chapter of outline?.chapters || []) {
          for (const lesson of chapter?.lessons || []) {
            dynamicRoutes.push({
              url: `${baseUrl}/docs/${course.slug}/${lesson.slug}`,
              lastModified: now,
              changeFrequency: 'weekly',
              priority: 0.75,
            });
          }
        }
      } catch {
        // Ignore single outline failure so rest of sitemap still succeeds
      }
    }

    return [...staticRoutes, ...dynamicRoutes];
  } catch {
    return staticRoutes;
  }
}
