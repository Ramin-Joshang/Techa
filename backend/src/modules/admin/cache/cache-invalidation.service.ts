import { env } from '../../../core/config/env';
import { logger } from '../../../core/logger/logger';

export interface RevalidationTarget {
  tags: string[];
  paths: string[];
}

export function buildCourseRevalidationTargets(courseSlug?: string): RevalidationTarget {
  const tags = ['techa-home', 'techa-courses', 'techa-search'];
  const paths = ['/', '/docs', '/sitemap.xml'];
  if (courseSlug) {
    tags.push(`techa-course:${courseSlug}`, `techa-course-outline:${courseSlug}`);
    paths.push(`/docs/${courseSlug}`);
  }
  return { tags, paths };
}

export function buildLessonRevalidationTargets(
  courseSlug: string,
  lessonSlug?: string
): RevalidationTarget {
  const base = buildCourseRevalidationTargets(courseSlug);
  if (lessonSlug) {
    base.tags.push(`techa-lesson:${courseSlug}:${lessonSlug}`);
    base.paths.push(`/docs/${courseSlug}/${lessonSlug}`);
  }
  return base;
}

export function buildPageRevalidationTargets(pageKey: string): RevalidationTarget {
  const tags = ['techa-pages', `techa-page:${pageKey}`];
  const paths = ['/sitemap.xml'];
  if (pageKey === 'home') {
    tags.push('techa-home');
    paths.push('/');
  }
  return { tags, paths };
}

export function buildSettingsRevalidationTargets(): RevalidationTarget {
  return {
    tags: ['techa-settings', 'techa-home', 'techa-courses'],
    paths: ['/', '/docs'],
  };
}

export class CacheInvalidationService {
  /**
   * Triggers Next.js App Router on-demand cache revalidation via the secret-protected
   * internal endpoint. Logs errors without throwing so DB commits remain authoritative.
   */
  public async invalidate(target: RevalidationTarget): Promise<{
    dispatched: boolean;
    revalidatedTags: string[];
    revalidatedPaths: string[];
    error?: string;
  }> {
    const tags = Array.from(new Set(target.tags));
    const paths = Array.from(new Set(target.paths));

    if (env.NODE_ENV === 'test') {
      return { dispatched: false, revalidatedTags: tags, revalidatedPaths: paths };
    }

    const endpoint = `${env.FRONTEND_INTERNAL_URL.replace(/\/+$/, '')}/api/internal/revalidate`;

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 3000);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-techa-revalidation-secret': env.CACHE_REVALIDATION_SECRET,
        },
        body: JSON.stringify({ tags, paths }),
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        logger.warn(
          { status: response.status, tags, paths, errorText },
          '[CacheInvalidationService] Next.js cache revalidation returned non-2xx'
        );
        return {
          dispatched: false,
          revalidatedTags: tags,
          revalidatedPaths: paths,
          error: `HTTP ${response.status}`,
        };
      }

      return { dispatched: true, revalidatedTags: tags, revalidatedPaths: paths };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.warn(
        { err: msg, tags, paths },
        '[CacheInvalidationService] Next.js cache revalidation request failed'
      );
      return {
        dispatched: false,
        revalidatedTags: tags,
        revalidatedPaths: paths,
        error: msg,
      };
    }
  }
}

export const cacheInvalidationService = new CacheInvalidationService();
