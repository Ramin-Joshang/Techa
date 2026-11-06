import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Types } from 'mongoose';
import { LessonModel } from '../../src/models/lesson.model';
import { CourseModel } from '../../src/models/course.model';
import { ChapterModel } from '../../src/models/chapter.model';
import { publicationService } from '../../src/services/publication.service';
import { courseStatsService } from '../../src/services/course-stats.service';

describe('Mongoose Models & Services Integration', () => {
  const dummyCourseId = new Types.ObjectId();
  const dummyChapterId = new Types.ObjectId();
  const dummyLessonId = new Types.ObjectId();

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('Mongoose Subdocument Discriminators (Genuinely avoiding Mixed)', () => {
    it('successfully validates a Lesson document with typed blocks', async () => {
      const lessonDoc = new LessonModel({
        _id: dummyLessonId,
        courseId: dummyCourseId,
        chapterId: dummyChapterId,
        title: 'درس تستی',
        slug: 'test-lesson',
        order: 1,
        readingTimeMinutes: 5,
        contentSchemaVersion: 1,
        status: 'draft',
        seo: {
          metaTitle: 'عنوان سئو',
          metaDescription: 'توضیحات سئو',
        },
        contentBlocks: [
          {
            id: 'blk_test_head_01',
            version: 1,
            type: 'heading',
            data: { level: 2, text: 'عنوان معتبر' },
          },
          {
            id: 'blk_test_para_01',
            version: 1,
            type: 'paragraph',
            data: { text: 'پاراگراف معتبر' },
          },
        ],
      });

      await expect(lessonDoc.validate()).resolves.toBeUndefined();
    });

    it('rejects invalid block data at the Mongoose level (e.g. heading level 5)', async () => {
      const lessonDoc = new LessonModel({
        _id: dummyLessonId,
        courseId: dummyCourseId,
        chapterId: dummyChapterId,
        title: 'درس با دیتای نامعتبر',
        slug: 'invalid-lesson',
        order: 1,
        readingTimeMinutes: 5,
        contentSchemaVersion: 1,
        status: 'draft',
        seo: { metaTitle: 'سئو', metaDescription: 'سئو' },
        contentBlocks: [
          {
            id: 'blk_bad_head_01',
            version: 1,
            type: 'heading',
            data: { level: 5, text: 'سطح غیرمجاز' }, // level 5 is not 2, 3, 4!
          },
        ],
      });

      await expect(lessonDoc.validate()).rejects.toThrow();
    });
  });

  describe('PublicationService — Parent Chain Enforcement', () => {
    it('rejects publishing a lesson when it has 0 content blocks', async () => {
      vi.spyOn(LessonModel, 'findById').mockResolvedValue({
        _id: dummyLessonId,
        courseId: dummyCourseId,
        chapterId: dummyChapterId,
        title: 'درس خالی',
        contentBlocks: [],
        status: 'draft',
        seo: { metaTitle: 'عنوان سئو معتبر طولانی', metaDescription: 'توضیحات سئو معتبر و استاندارد' },
      } as any);

      await expect(publicationService.publishLesson(dummyLessonId)).rejects.toThrow(
        /at least one content block/i
      );
    });

    it('rejects publishing a lesson when parent chapter is draft', async () => {
      vi.spyOn(LessonModel, 'findById').mockResolvedValue({
        _id: dummyLessonId,
        courseId: dummyCourseId,
        chapterId: dummyChapterId,
        title: 'درس تستی',
        contentBlocks: [{ id: 'blk_01', version: 1, type: 'paragraph', data: { text: 'متن' } }],
        status: 'draft',
        seo: { metaTitle: 'عنوان سئو معتبر طولانی', metaDescription: 'توضیحات سئو معتبر و استاندارد' },
      } as any);

      vi.spyOn(ChapterModel, 'findById').mockResolvedValue({
        _id: dummyChapterId,
        courseId: dummyCourseId,
        title: 'فصل پیش‌نویس',
        status: 'draft', // Chapter not published!
      } as any);

      await expect(publicationService.publishLesson(dummyLessonId)).rejects.toThrow(
        /parent chapter "فصل پیش‌نویس" is draft/i
      );
    });

    it('rejects publishing a lesson when parent course is draft', async () => {
      vi.spyOn(LessonModel, 'findById').mockResolvedValue({
        _id: dummyLessonId,
        courseId: dummyCourseId,
        chapterId: dummyChapterId,
        title: 'درس تستی',
        contentBlocks: [{ id: 'blk_01', version: 1, type: 'paragraph', data: { text: 'متن' } }],
        status: 'draft',
        seo: { metaTitle: 'عنوان سئو معتبر طولانی', metaDescription: 'توضیحات سئو معتبر و استاندارد' },
      } as any);

      vi.spyOn(ChapterModel, 'findById').mockResolvedValue({
        _id: dummyChapterId,
        courseId: dummyCourseId,
        title: 'فصل منتشرشده',
        status: 'published',
      } as any);

      vi.spyOn(CourseModel, 'findById').mockResolvedValue({
        _id: dummyCourseId,
        title: 'دوره پیش‌نویس',
        status: 'draft', // Course not published!
      } as any);

      await expect(publicationService.publishLesson(dummyLessonId)).rejects.toThrow(
        /parent course "دوره پیش‌نویس" is draft/i
      );
    });

    it('rejects publishing a lesson when chapter courseId does not match lesson courseId', async () => {
      const differentCourseId = new Types.ObjectId();

      vi.spyOn(LessonModel, 'findById').mockResolvedValue({
        _id: dummyLessonId,
        courseId: dummyCourseId,
        chapterId: dummyChapterId,
        title: 'درس تستی',
        contentBlocks: [{ id: 'blk_01', version: 1, type: 'paragraph', data: { text: 'متن' } }],
        status: 'draft',
        seo: { metaTitle: 'عنوان سئو معتبر طولانی', metaDescription: 'توضیحات سئو معتبر و استاندارد' },
      } as any);

      vi.spyOn(ChapterModel, 'findById').mockResolvedValue({
        _id: dummyChapterId,
        courseId: differentCourseId, // Mismatch!
        title: 'فصل متعلق به دوره دیگر',
        status: 'published',
      } as any);

      await expect(publicationService.publishLesson(dummyLessonId)).rejects.toThrow(
        /Lesson courseId .* does not match parent chapter courseId/i
      );
    });

    it('isLessonPubliclyVisible returns false if parent chapter or course becomes unpublished', async () => {
      // Lesson is marked 'published', but parent chapter is 'draft'
      vi.spyOn(LessonModel, 'findById').mockResolvedValue({
        _id: dummyLessonId,
        courseId: dummyCourseId,
        chapterId: dummyChapterId,
        status: 'published',
      } as any);

      vi.spyOn(ChapterModel, 'findById').mockResolvedValue({
        _id: dummyChapterId,
        courseId: dummyCourseId,
        status: 'draft', // Unpublished parent!
      } as any);

      const isVisible = await publicationService.isLessonPubliclyVisible(dummyLessonId);
      expect(isVisible).toBe(false);
    });
  });

  describe('CourseStatsService — Exclusion of Unpublished Chains', () => {
    it('returns zero public stats if course is not published', async () => {
      vi.spyOn(CourseModel, 'findById').mockResolvedValue({
        _id: dummyCourseId,
        status: 'draft',
        stats: { totalChapters: 5, totalLessons: 20, estimatedReadingTimeMinutes: 120 },
      } as any);

      const stats = await courseStatsService.getPublicCourseStats(dummyCourseId);
      expect(stats.totalChapters).toBe(0);
      expect(stats.totalLessons).toBe(0);
      expect(stats.estimatedReadingTimeMinutes).toBe(0);
    });

    it('recalculates stats by including only published chapters and lessons', async () => {
      const saveSpy = vi.fn().mockResolvedValue(true);
      vi.spyOn(CourseModel, 'findById').mockResolvedValue({
        _id: dummyCourseId,
        save: saveSpy,
      } as any);

      const publishedChapterId1 = new Types.ObjectId();
      const publishedChapterId2 = new Types.ObjectId();

      // Only published chapters are queried
      vi.spyOn(ChapterModel, 'find').mockReturnValue({
        lean: vi.fn().mockResolvedValue([
          { _id: publishedChapterId1 },
          { _id: publishedChapterId2 },
        ]),
      } as any);

      // Lessons aggregated strictly for those published chapters
      vi.spyOn(LessonModel, 'aggregate').mockResolvedValue([
        { _id: null, totalLessons: 8, totalReadingTime: 55 },
      ]);

      const result = await courseStatsService.recalculateCourseStats(dummyCourseId);

      expect(result.totalChapters).toBe(2);
      expect(result.totalLessons).toBe(8);
      expect(result.estimatedReadingTimeMinutes).toBe(55);
      expect(saveSpy).toHaveBeenCalledTimes(1);
    });
  });
});
