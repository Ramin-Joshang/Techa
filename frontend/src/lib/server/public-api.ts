import { cache } from 'react';
import { z } from 'zod';

// Safe React.cache wrapper for both RSC and Node/test environments
const reactCache = typeof cache === 'function' ? cache : <T extends (...args: any[]) => any>(fn: T): T => fn;
import {
  SitePagePublicDtoSchema,
  SitePagePublicDto,
  CoursePublicDtoSchema,
  CoursePublicDto,
  CourseOutlinePublicDtoSchema,
  CourseOutlinePublicDto,
  LessonPublicDtoSchema,
  LessonPublicDto,
  CourseListQuerySchema,
  CourseSlugParamSchema,
  LessonSlugParamsSchema,
} from '@techa/shared';
import { fetchFromPublicApi } from './api-client';
import { NotFoundError } from './api-errors';

export interface PublicCoursesPage {
  courses: CoursePublicDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * 1. GET /api/v1/public/home
 * Fetches homepage CMS configuration.
 * Returns null on NotFoundError so the homepage can render safely without breaking.
 */
export async function getHomepage(): Promise<SitePagePublicDto | null> {
  try {
    const result = await fetchFromPublicApi(
      '/home',
      SitePagePublicDtoSchema,
      {
        revalidate: 60,
        tags: ['techa-home'],
      }
    );
    return result.data;
  } catch (error) {
    if (error instanceof NotFoundError) {
      return null;
    }
    throw error;
  }
}

/**
 * 2. GET /api/v1/public/courses
 * Fetches paginated list of published courses.
 */
export async function getPublishedCourses(params?: {
  page?: number;
  limit?: number;
  level?: string;
  tag?: string;
  q?: string;
}): Promise<PublicCoursesPage> {
  // Validate and sanitize query params
  const parsedQuery = CourseListQuerySchema.safeParse(params || {});
  const queryParams = parsedQuery.success
    ? parsedQuery.data
    : {
        page: 1,
        limit: 20,
        sort: 'order' as const,
        level: undefined,
        tag: undefined,
        q: undefined,
      };

  const result = await fetchFromPublicApi(
    '/courses',
    z.array(CoursePublicDtoSchema),
    {
      searchParams: {
        page: queryParams.page,
        limit: queryParams.limit,
        level: queryParams.level,
        tag: queryParams.tag,
      },
      revalidate: 60,
      tags: ['techa-courses'],
    }
  );

  const page = result.meta?.page || queryParams.page || 1;
  const limit = result.meta?.limit || queryParams.limit || 20;
  const total = result.meta?.total ?? result.data.length;
  const totalPages = Math.ceil(total / limit) || 1;

  return {
    courses: result.data,
    total,
    page,
    limit,
    totalPages,
  };
}

/**
 * 3. GET /api/v1/public/courses/:courseSlug
 * Fetches single published course details.
 * Deduplicated per-render with React cache().
 */
export const getPublishedCourseDetail = reactCache(async (courseSlug: string): Promise<CoursePublicDto> => {
  const { courseSlug: validSlug } = CourseSlugParamSchema.parse({ courseSlug });

  const result = await fetchFromPublicApi(
    `/courses/${validSlug}`,
    CoursePublicDtoSchema,
    {
      revalidate: 300,
      tags: ['techa-courses', `techa-course:${validSlug}`],
    }
  );

  return result.data;
});

/**
 * 4. GET /api/v1/public/courses/:courseSlug/outline
 * Fetches course hierarchy outline (chapters and lesson summaries).
 * Deduplicated per-render with React cache().
 */
export const getCourseOutline = reactCache(async (courseSlug: string): Promise<CourseOutlinePublicDto> => {
  const { courseSlug: validSlug } = CourseSlugParamSchema.parse({ courseSlug });

  const result = await fetchFromPublicApi(
    `/courses/${validSlug}/outline`,
    CourseOutlinePublicDtoSchema,
    {
      revalidate: 300,
      tags: ['techa-courses', `techa-course-outline:${validSlug}`],
    }
  );

  return result.data;
});

/**
 * 5. GET /api/v1/public/courses/:courseSlug/lessons/:lessonSlug
 * Fetches lesson details and verified 13 content blocks.
 * Deduplicated per-render with React cache().
 */
export const getPublishedLessonDetail = reactCache(
  async (courseSlug: string, lessonSlug: string): Promise<LessonPublicDto> => {
    const { courseSlug: validCourse, lessonSlug: validLesson } = LessonSlugParamsSchema.parse({
      courseSlug,
      lessonSlug,
    });

    const result = await fetchFromPublicApi(
      `/courses/${validCourse}/lessons/${validLesson}`,
      LessonPublicDtoSchema,
      {
        revalidate: 300,
        tags: ['techa-courses', `techa-lesson:${validCourse}:${validLesson}`],
      }
    );

    return result.data;
  }
);

/**
 * 6. GET /api/v1/public/search
 * Searches published courses and lessons.
 */
export async function searchPublicContent(params: {
  q: string;
  type?: 'all' | 'courses' | 'lessons';
  limit?: number;
}) {
  const { SearchQuerySchema, SearchResultDtoSchema } = await import('@techa/shared');
  const validQuery = SearchQuerySchema.parse(params);

  const result = await fetchFromPublicApi(
    '/search',
    SearchResultDtoSchema,
    {
      searchParams: {
        q: validQuery.q,
        type: validQuery.type,
        limit: validQuery.limit,
      },
      revalidate: 30,
      tags: ['techa-search'],
    }
  );

  return result.data;
}

/**
 * 7. GET /api/v1/public/settings
 * Fetches public site settings (branding, navigation, footer, seo).
 */
export const getPublicSiteSettings = reactCache(async () => {
  const { PublicSiteSettingsDtoSchema } = await import('@techa/shared');
  try {
    const result = await fetchFromPublicApi(
      '/settings',
      PublicSiteSettingsDtoSchema,
      {
        revalidate: 300,
        tags: ['techa-settings'],
      }
    );
    return result.data;
  } catch (error) {
    if (error instanceof NotFoundError) {
      return null;
    }
    throw error;
  }
});

/**
 * 8. GET /api/v1/public/pages/:pageKey
 * Fetches published custom site page.
 */
export const getPublishedSitePage = reactCache(async (pageKey: string) => {
  const { PublicSitePageDtoSchema, PageKeyParamSchema } = await import('@techa/shared');
  const { pageKey: validKey } = PageKeyParamSchema.parse({ pageKey });

  const result = await fetchFromPublicApi(
    `/pages/${validKey}`,
    PublicSitePageDtoSchema,
    {
      revalidate: 120,
      tags: ['techa-pages', `techa-page:${validKey}`],
    }
  );

  return result.data;
});
