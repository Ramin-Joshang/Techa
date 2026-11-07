import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  getHomepage,
  getPublishedCourses,
  getPublishedCourseDetail,
  getCourseOutline,
  getPublishedLessonDetail,
} from '../../src/lib/server/public-api';

describe('Public API High-Level Data Methods', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  describe('getHomepage', () => {
    it('returns SitePagePublicDto when home configuration exists', async () => {
      const mockHome = {
        success: true,
        statusCode: 200,
        data: {
          pageKey: 'home',
          title: 'مرجع آموزش تکا',
          heroSection: {
            title: 'آموزش فرانت‌اند',
            subtitle: 'از صفر تا صد',
            primaryCta: { label: 'دوره‌ها', url: '/courses' },
          },
          features: [
            {
              title: 'تمرین محور',
              description: 'یادگیری با حل مسئله',
              icon: 'code',
            },
          ],
          seo: {
            metaTitle: 'تکا',
            metaDescription: 'آموزش برنامه‌نویسی',
          },
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockHome,
      } as unknown as Response);

      const result = await getHomepage();
      expect(result).not.toBeNull();
      expect(result?.pageKey).toBe('home');
      expect(result?.title).toBe('مرجع آموزش تکا');
    });

    it('returns null gracefully when homepage configuration is 404 (not found)', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({
          success: false,
          statusCode: 404,
          error: { code: 'NOT_FOUND', message: 'Homepage not configured' },
        }),
      } as unknown as Response);

      const result = await getHomepage();
      expect(result).toBeNull();
    });
  });

  describe('getPublishedCourses', () => {
    it('returns paginated courses result with total and totalPages', async () => {
      const mockCourses = {
        success: true,
        statusCode: 200,
        data: [
          {
            id: '672bd238a2c1f93892019401',
            slug: 'react-foundations',
            title: 'مبانی ری‌اکت',
            summary: 'آشنایی جامع با کتابخانه ری‌اکت',
            description: 'توضیحات کامل دوره ری‌اکت',
            level: 'beginner',
            icon: { kind: 'system', name: 'ri:reactjs-fill' },
            tags: ['react', 'frontend'],
            prerequisites: ['HTML', 'JavaScript'],
            targetAudience: ['دانشجویان کامپیوتر'],
            order: 1,
            stats: {
              totalChapters: 2,
              totalLessons: 6,
              estimatedReadingTimeMinutes: 45,
            },
            seo: { metaTitle: 'آموزش ری‌اکت', metaDescription: 'دوره جامع ری‌اکت' },
            publishedAt: '2026-11-06T10:00:00.000Z',
          },
        ],
        meta: {
          page: 1,
          limit: 12,
          total: 1,
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockCourses,
      } as unknown as Response);

      const result = await getPublishedCourses({ page: 1, limit: 12 });
      expect(result.courses).toHaveLength(1);
      expect(result.courses[0].slug).toBe('react-foundations');
      expect(result.total).toBe(1);
      expect(result.totalPages).toBe(1);
    });
  });

  describe('getPublishedCourseDetail', () => {
    it('returns CoursePublicDto for valid published course', async () => {
      const mockCourse = {
        success: true,
        statusCode: 200,
        data: {
          id: '672bd238a2c1f93892019401',
          slug: 'nextjs-deep-dive',
          title: 'دوره تخصصی نکست‌جی‌اس',
          summary: 'معماری سرور کامپوننت‌ها',
          description: 'توضیحات تفصیلی دوره',
          level: 'advanced',
          icon: { kind: 'system', name: 'ri:nextjs-fill' },
          tags: ['nextjs', 'react'],
          prerequisites: ['React'],
          targetAudience: ['توسعه‌دهندگان فرانت‌اند'],
          order: 2,
          stats: {
            totalChapters: 3,
            totalLessons: 12,
            estimatedReadingTimeMinutes: 90,
          },
          seo: { metaTitle: 'آموزش Next.js', metaDescription: 'دوره پیشرفته' },
          publishedAt: '2026-11-06T11:00:00.000Z',
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockCourse,
      } as unknown as Response);

      const result = await getPublishedCourseDetail('nextjs-deep-dive');
      expect(result.slug).toBe('nextjs-deep-dive');
      expect(result.level).toBe('advanced');
    });

    it('rejects invalid course slug format before making network request', async () => {
      await expect(getPublishedCourseDetail('INVALID_SLUG!')).rejects.toThrow();
    });
  });

  describe('getCourseOutline', () => {
    it('returns course outline with published chapters and lesson summaries', async () => {
      const mockOutline = {
        success: true,
        statusCode: 200,
        data: {
          course: {
            id: '672bd238a2c1f93892019401',
            slug: 'react-foundations',
            title: 'مبانی ری‌اکت',
            stats: {
              totalChapters: 1,
              totalLessons: 1,
              estimatedReadingTimeMinutes: 5,
            },
          },
          chapters: [
            {
              id: '672bd238a2c1f93892019402',
              title: 'فصل اول',
              slug: 'chapter-one',
              summary: 'مقدمات',
              order: 1,
              lessons: [
                {
                  id: '672bd238a2c1f93892019403',
                  title: 'درس اول',
                  slug: 'lesson-one',
                  order: 1,
                  readingTimeMinutes: 5,
                },
              ],
            },
          ],
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockOutline,
      } as unknown as Response);

      const result = await getCourseOutline('react-foundations');
      expect(result.chapters).toHaveLength(1);
      expect(result.chapters[0].lessons).toHaveLength(1);
      expect(result.chapters[0].lessons[0].slug).toBe('lesson-one');
    });
  });

  describe('getPublishedLessonDetail', () => {
    it('returns LessonPublicDto with validated contentBlocks', async () => {
      const mockLesson = {
        success: true,
        statusCode: 200,
        data: {
          id: '672bd238a2c1f93892019403',
          courseId: '672bd238a2c1f93892019401',
          chapterId: '672bd238a2c1f93892019402',
          title: 'درس اول: ساختار کامپوننت‌ها',
          slug: 'component-structure',
          order: 1,
          readingTimeMinutes: 7,
          contentSchemaVersion: 1,
          contentBlocks: [
            {
              id: 'blk_test_heading_01',
              version: 1,
              type: 'heading',
              data: { level: 2, text: 'آشنایی با کامپوننت‌ها' },
            },
            {
              id: 'blk_test_para_01',
              version: 1,
              type: 'paragraph',
              data: { text: 'کامپوننت‌ها بلوک‌های سازنده رابط کاربری در ری‌اکت هستند.' },
            },
          ],
          seo: {
            metaTitle: 'ساختار کامپوننت‌ها',
            metaDescription: 'بررسی کامپوننت در ری‌اکت',
          },
          publishedAt: '2026-11-06T10:00:00.000Z',
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockLesson,
      } as unknown as Response);

      const result = await getPublishedLessonDetail('react-foundations', 'component-structure');
      expect(result.slug).toBe('component-structure');
      expect(result.contentBlocks).toHaveLength(2);
      expect(result.contentBlocks[0].type).toBe('heading');
    });
  });
});
