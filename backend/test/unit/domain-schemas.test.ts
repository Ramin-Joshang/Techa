import { describe, it, expect } from 'vitest';
import {
  CourseSchema,
  ChapterSchema,
  LessonSchema,
  MediaAssetSchema,
  SitePageSchema,
  isValidPhase1PublicRoute,
} from '@techa/shared';

describe('Domain Schemas & DTO Validation', () => {
  const dummyObjectId = '507f1f77bcf86cd799439011';

  describe('CourseSchema', () => {
    it('validates a complete Course object', () => {
      const valid = {
        id: dummyObjectId,
        slug: 'modern-nextjs',
        title: 'آموزش جامع نکست جی‌اس',
        summary: 'یادگیری نکست جی‌اس نسخه ۱۴ و ۱۶ به همراه اپ روتر',
        description: 'در این دوره پیشرفته تمامی مفاهیم سرور اکشن‌ها، کشینگ و بهینه‌سازی آموزش داده می‌شود.',
        level: 'intermediate',
        icon: { kind: 'system', name: 'lucide:code' },
        coverStorageKey: 'courses/modern-nextjs/cover.webp',
        tags: ['nextjs', 'react'],
        prerequisites: ['تسلط به ری‌اکت'],
        targetAudience: ['توسعه‌دهندگان فرانت‌اند'],
        order: 1,
        status: 'draft',
        stats: { totalChapters: 2, totalLessons: 10, estimatedReadingTimeMinutes: 60 },
        seo: { metaTitle: 'آموزش نکست جی‌اس', metaDescription: 'دوره جامع نکست جی‌اس' },
      };
      const result = CourseSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('rejects course with invalid level or negative order', () => {
      const invalid = {
        slug: 'course-fail',
        title: 'تست',
        summary: 'تست',
        description: 'تست',
        level: 'expert', // Invalid level
        icon: { kind: 'system', name: 'lucide:code' },
        order: -1, // Negative order
        seo: { metaTitle: 'تست', metaDescription: 'تست' },
      };
      expect(CourseSchema.safeParse(invalid).success).toBe(false);
    });
  });

  describe('ChapterSchema', () => {
    it('validates a complete Chapter object', () => {
      const valid = {
        id: dummyObjectId,
        courseId: dummyObjectId,
        title: 'فصل اول: آشنایی با فریم‌ورک',
        slug: 'introduction',
        summary: 'مفاهیم مقدماتی',
        order: 1,
        status: 'draft',
      };
      expect(ChapterSchema.safeParse(valid).success).toBe(true);
    });
  });

  describe('LessonSchema', () => {
    it('validates a complete Lesson object with content blocks', () => {
      const valid = {
        id: dummyObjectId,
        courseId: dummyObjectId,
        chapterId: dummyObjectId,
        title: 'نصب و راه‌اندازی پروژه',
        slug: 'installation',
        order: 1,
        readingTimeMinutes: 5,
        contentSchemaVersion: 1,
        contentBlocks: [
          {
            id: 'blk_para_00000001',
            version: 1,
            type: 'paragraph',
            data: { text: 'برای شروع پروژه ابتدا Node.js را نصب کنید.' },
          },
        ],
        status: 'draft',
        seo: { metaTitle: 'نصب پروژه', metaDescription: 'آموزش نصب پروژه نکست جی‌اس' },
      };
      expect(LessonSchema.safeParse(valid).success).toBe(true);
    });
  });

  describe('MediaAssetSchema', () => {
    it('validates valid media asset', () => {
      const valid = {
        id: dummyObjectId,
        storageKey: 'courses/react/logo.svg',
        originalFileName: 'react-logo.svg',
        mimeType: 'image/svg+xml',
        sizeBytes: 15400,
        category: 'course_icon',
        altText: 'آیکون ری‌اکت',
      };
      expect(MediaAssetSchema.safeParse(valid).success).toBe(true);
    });

    it('rejects invalid MIME format', () => {
      const invalid = {
        storageKey: 'courses/react/logo.svg',
        originalFileName: 'react-logo.svg',
        mimeType: 'invalid-mime',
        sizeBytes: 1000,
        category: 'course_icon',
      };
      expect(MediaAssetSchema.safeParse(invalid).success).toBe(false);
    });
  });

  describe('SitePageSchema & Phase 1 Route Validation', () => {
    it('correctly validates Phase 1 public routes', () => {
      expect(isValidPhase1PublicRoute('/')).toBe(true);
      expect(isValidPhase1PublicRoute('/courses')).toBe(true);
      expect(isValidPhase1PublicRoute('/courses/react-foundations')).toBe(true);
      expect(isValidPhase1PublicRoute('/courses/react-foundations/lessons/intro')).toBe(true);

      // Disallowed routes outside Phase 1 scope
      expect(isValidPhase1PublicRoute('/admin')).toBe(false);
      expect(isValidPhase1PublicRoute('/dashboard')).toBe(false);
      expect(isValidPhase1PublicRoute('/cart')).toBe(false);
      expect(isValidPhase1PublicRoute('https://external.com')).toBe(false);
      expect(isValidPhase1PublicRoute('/courses/react/extra/invalid/path')).toBe(false);
    });

    it('validates homepage site page document', () => {
      const validHome = {
        pageKey: 'home',
        title: 'صفحه اصلی تکا - آموزش برنامه‌نویسی',
        heroSection: {
          title: 'مرجع تخصصی آموزش برنامه‌نویسی وب',
          subtitle: 'یادگیری عمیق، پروژه‌محور و تعاملی از صفر تا ورود به بازار کار',
          primaryCta: {
            label: 'مشاهده دوره‌ها',
            url: '/courses',
          },
          secondaryCta: {
            label: 'شروع یادگیری',
            url: '/courses/react-foundations',
          },
        },
        features: [
          {
            title: 'مستندات استاندارد',
            description: 'آموزش‌های ساختاریافته به همراه کدهای تعاملی',
            icon: 'book-open',
          },
        ],
        seo: {
          metaTitle: 'تکا - پلتفرم جامع آموزش برنامه‌نویسی',
          metaDescription: 'پلتفرم آموزش برنامه‌نویسی وب به زبان فارسی با تمرکز بر مفاهیم روز بازار کار.',
        },
      };
      const result = SitePageSchema.safeParse(validHome);
      expect(result.success).toBe(true);
    });

    it('rejects homepage with out-of-scope CTA route', () => {
      const invalidHome = {
        pageKey: 'home',
        title: 'تکا',
        heroSection: {
          title: 'عنوان',
          subtitle: 'زیرعنوان',
          primaryCta: {
            label: 'خرید اشتراک',
            url: '/checkout/pay', // Not an allowed Phase 1 public route!
          },
        },
        features: [{ title: 'ویژگی', description: 'توضیح', icon: 'star' }],
        seo: { metaTitle: 'سئو', metaDescription: 'توضیحات' },
      };
      const result = SitePageSchema.safeParse(invalidHome);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toMatch(/not an allowed Phase 1 public route/i);
      }
    });
  });
});
