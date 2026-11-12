import { MetadataRoute } from 'next';
import { getPublishedCourses, getCourseOutline } from '../lib/server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://techa.ir';

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/docs`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/roadmap`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.75,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.75,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  try {
    const coursesResult = await getPublishedCourses({ limit: 100 });
    const dynamicRoutes: MetadataRoute.Sitemap = [];

    for (const course of coursesResult?.courses || []) {
      dynamicRoutes.push({
        url: `${baseUrl}/docs/${course.slug}`,
        lastModified: new Date(course.publishedAt || new Date()),
        changeFrequency: 'weekly',
        priority: 0.8,
      });

      try {
        const outline = await getCourseOutline(course.slug);
        for (const chapter of outline?.chapters || []) {
          for (const lesson of chapter?.lessons || []) {
            dynamicRoutes.push({
              url: `${baseUrl}/docs/${course.slug}/${lesson.slug}`,
              lastModified: new Date(),
              changeFrequency: 'weekly',
              priority: 0.7,
            });
          }
        }
      } catch {
        // Outline fetch failure ignored in sitemap build
      }
    }

    return [...staticRoutes, ...dynamicRoutes];
  } catch {
    return staticRoutes;
  }
}
