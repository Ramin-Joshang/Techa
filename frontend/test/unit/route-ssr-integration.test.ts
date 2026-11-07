import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  getHomepage,
  getPublishedCourses,
  getPublishedCourseDetail,
  getCourseOutline,
  getPublishedLessonDetail,
} from '../../src/lib/server/public-api';
import { NotFoundError, ServiceUnavailableError, isNotFoundError } from '../../src/lib/server/api-errors';

describe('Frontend Public Routes SSR Integration & Navigation Logic', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  describe('Route 1: Homepage (/) SSR', () => {
    it('resolves homepage config and published courses in parallel', async () => {
      global.fetch = vi.fn().mockImplementation((url: string) => {
        if (url.includes('/api/v1/public/home')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => ({
              success: true,
              statusCode: 200,
              data: {
                pageKey: 'home',
                title: 'تکا',
                heroSection: { title: 'آموزش برنامه‌نویسی', subtitle: 'پروژه‌محور', primaryCta: { label: 'دوره‌ها', url: '/courses' } },
                features: [{ title: 'تمرین', description: 'حل مسئله', icon: 'code' }],
                seo: { metaTitle: 'تکا', metaDescription: 'توضیحات' },
              },
            }),
          });
        }
        if (url.includes('/api/v1/public/courses')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => ({
              success: true,
              statusCode: 200,
              data: [
                {
                  id: '672bd238a2c1f93892019401',
                  slug: 'react-course',
                  title: 'دوره ری‌اکت',
                  summary: 'مفاهیم',
                  description: 'شرح',
                  level: 'beginner',
                  icon: { kind: 'system', name: 'ri:reactjs-fill' },
                  tags: ['react'],
                  prerequisites: [],
                  targetAudience: [],
                  order: 1,
                  stats: { totalChapters: 1, totalLessons: 2, estimatedReadingTimeMinutes: 10 },
                  seo: { metaTitle: 'ری‌اکت', metaDescription: 'آموزش' },
                  publishedAt: null,
                },
              ],
              meta: { page: 1, limit: 6, total: 1 },
            }),
          });
        }
        return Promise.reject(new Error(`Unhandled URL: ${url}`));
      });

      const [home, coursesResult] = await Promise.all([
        getHomepage().catch(() => null),
        getPublishedCourses({ limit: 6 }).catch(() => ({ courses: [], total: 0, page: 1, limit: 6, totalPages: 1 })),
      ]);

      expect(home).not.toBeNull();
      expect(home?.pageKey).toBe('home');
      expect(coursesResult.courses).toHaveLength(1);
      expect(coursesResult.courses[0].slug).toBe('react-course');
    });

    it('renders gracefully when homepage CMS config is missing (null) without throwing fatal error', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({
          success: false,
          statusCode: 404,
          error: { code: 'NOT_FOUND', message: 'Homepage not configured' },
        }),
      } as unknown as Response);

      const home = await getHomepage().catch(() => null);
      expect(home).toBeNull();
    });
  });

  describe('Route 2: Documentation Index (/docs) SSR', () => {
    it('properly validates pagination and applies level filter', async () => {
      global.fetch = vi.fn().mockImplementation((url: string) => {
        expect(url).toContain('level=intermediate');
        expect(url).toContain('page=2');
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            statusCode: 200,
            data: [],
            meta: { page: 2, limit: 12, total: 0 },
          }),
        });
      });

      const result = await getPublishedCourses({ page: 2, limit: 12, level: 'intermediate' });
      expect(result.page).toBe(2);
      expect(result.courses).toEqual([]);
    });
  });

  describe('Route 3: Course Page (/docs/[courseSlug]) SSR', () => {
    it('fetches course detail and outline simultaneously', async () => {
      global.fetch = vi.fn().mockImplementation((url: string) => {
        if (url.includes('/api/v1/public/courses/nextjs/outline')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => ({
              success: true,
              statusCode: 200,
              data: {
                course: {
                  id: '672bd238a2c1f93892019401',
                  slug: 'nextjs',
                  title: 'دوره Next.js',
                  stats: { totalChapters: 1, totalLessons: 2, estimatedReadingTimeMinutes: 15 },
                },
                chapters: [],
              },
            }),
          });
        }
        if (url.includes('/api/v1/public/courses/nextjs')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => ({
              success: true,
              statusCode: 200,
              data: {
                id: '672bd238a2c1f93892019401',
                slug: 'nextjs',
                title: 'دوره Next.js',
                summary: 'توسعه وب مدرن',
                description: 'توضیحات جامع دوره',
                level: 'intermediate',
                icon: { kind: 'system', name: 'ri:nextjs-fill' },
                tags: ['nextjs'],
                prerequisites: ['React'],
                targetAudience: ['توسعه‌دهندگان فرانت‌اند'],
                order: 1,
                stats: { totalChapters: 1, totalLessons: 2, estimatedReadingTimeMinutes: 15 },
                seo: { metaTitle: 'آموزش Next.js', metaDescription: 'دوره جامع' },
                publishedAt: '2026-11-06T10:00:00.000Z',
              },
            }),
          });
        }
        return Promise.reject(new Error(`Unhandled URL: ${url}`));
      });

      const [course, outline] = await Promise.all([
        getPublishedCourseDetail('nextjs'),
        getCourseOutline('nextjs'),
      ]);

      expect(course.title).toBe('دوره Next.js');
      expect(outline.course.slug).toBe('nextjs');
    });

    it('identifies NotFoundError for nonexistent course to allow notFound() invocation', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({
          success: false,
          statusCode: 404,
          error: { code: 'NOT_FOUND', message: 'Course not found' },
        }),
      } as unknown as Response);

      let caughtError: unknown;
      try {
        await getPublishedCourseDetail('nonexistent');
      } catch (err) {
        caughtError = err;
      }

      expect(isNotFoundError(caughtError)).toBe(true);
    });

    it('does NOT convert backend 503 outage into 404', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
        json: async () => ({
          success: false,
          statusCode: 503,
          error: { code: 'DATABASE_NOT_READY', message: 'DB down' },
        }),
      } as unknown as Response);

      let caughtError: unknown;
      try {
        await getPublishedCourseDetail('react');
      } catch (err) {
        caughtError = err;
      }

      expect(isNotFoundError(caughtError)).toBe(false);
      expect(caughtError).toBeInstanceOf(ServiceUnavailableError);
    });
  });

  describe('Route 4: Lesson Page (/docs/[courseSlug]/[lessonSlug]) SSR Navigation Calculation', () => {
    it('correctly calculates previous and next lesson links and index position from outline', () => {
      const mockOutline = {
        course: { id: '672bd238a2c1f93892019401', slug: 'react', title: 'ری‌اکت', stats: { totalChapters: 2, totalLessons: 3, estimatedReadingTimeMinutes: 15 } },
        chapters: [
          {
            id: '672bd238a2c1f93892019402',
            title: 'فصل ۱',
            slug: 'ch-1',
            order: 1,
            lessons: [
              { id: '672bd238a2c1f93892019403', title: 'درس ۱', slug: 'lesson-1', order: 1, readingTimeMinutes: 5 },
              { id: '672bd238a2c1f93892019404', title: 'درس ۲', slug: 'lesson-2', order: 2, readingTimeMinutes: 5 },
            ],
          },
          {
            id: '672bd238a2c1f93892019405',
            title: 'فصل ۲',
            slug: 'ch-2',
            order: 2,
            lessons: [
              { id: '672bd238a2c1f93892019406', title: 'درس ۳', slug: 'lesson-3', order: 3, readingTimeMinutes: 5 },
            ],
          },
        ],
      };

      const flatLessons: Array<{ title: string; slug: string }> = [];
      for (const ch of mockOutline.chapters) {
        for (const l of ch.lessons) {
          flatLessons.push({ title: l.title, slug: l.slug });
        }
      }

      // Middle lesson (lesson-2)
      const currentIndex = flatLessons.findIndex((l) => l.slug === 'lesson-2');
      const prevLesson = currentIndex > 0 ? flatLessons[currentIndex - 1] : null;
      const nextLesson = currentIndex < flatLessons.length - 1 ? flatLessons[currentIndex + 1] : null;

      expect(currentIndex + 1).toBe(2);
      expect(flatLessons.length).toBe(3);
      expect(prevLesson?.slug).toBe('lesson-1');
      expect(nextLesson?.slug).toBe('lesson-3');

      // First lesson (lesson-1): previous is null
      const firstIdx = flatLessons.findIndex((l) => l.slug === 'lesson-1');
      expect(firstIdx > 0 ? flatLessons[firstIdx - 1] : null).toBeNull();

      // Last lesson (lesson-3): next is null
      const lastIdx = flatLessons.findIndex((l) => l.slug === 'lesson-3');
      expect(lastIdx < flatLessons.length - 1 ? flatLessons[lastIdx + 1] : null).toBeNull();
    });
  });
});
