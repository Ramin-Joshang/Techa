import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { Types } from 'mongoose';
import { app } from '../../src/app';
import { CourseModel } from '../../src/models/course.model';
import { ChapterModel } from '../../src/models/chapter.model';
import { LessonModel } from '../../src/models/lesson.model';
import { courseStatsService } from '../../src/services/course-stats.service';

describe('Public API: GET /api/v1/public/courses/:courseSlug/outline', () => {
  const dummyCourseId = new Types.ObjectId();
  const dummyChapterId1 = new Types.ObjectId();
  const dummyChapterId2 = new Types.ObjectId();
  const dummyLessonId1 = new Types.ObjectId();
  const dummyLessonId2 = new Types.ObjectId();

  const mockCourseRaw = {
    _id: dummyCourseId,
    slug: 'react-foundations',
    title: 'آموزش ری‌اکت',
    status: 'published',
  };

  const mockChaptersRaw = [
    {
      _id: dummyChapterId1,
      courseId: dummyCourseId,
      title: 'فصل اول: مقدمه',
      slug: 'intro',
      summary: 'مفاهیم اولیه',
      order: 1,
      status: 'published',
    },
    {
      _id: dummyChapterId2,
      courseId: dummyCourseId,
      title: 'فصل دوم: کامپوننت‌ها',
      slug: 'components',
      summary: 'ساخت کامپوننت‌ها',
      order: 2,
      status: 'published',
    },
  ];

  const mockLessonsRaw = [
    {
      _id: dummyLessonId1,
      courseId: dummyCourseId,
      chapterId: dummyChapterId1,
      title: 'درس اول: ری‌اکت چیست؟',
      slug: 'what-is-react',
      order: 1,
      readingTimeMinutes: 5,
      status: 'published',
    },
    {
      _id: dummyLessonId2,
      courseId: dummyCourseId,
      chapterId: dummyChapterId2,
      title: 'درس دوم: اولین کامپوننت',
      slug: 'first-component',
      order: 1,
      readingTimeMinutes: 8,
      status: 'published',
    },
  ];

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns 200 OK with ordered outline hierarchy and lesson summaries only', async () => {
    vi.spyOn(CourseModel, 'findOne').mockReturnValue({
      lean: vi.fn().mockResolvedValue(mockCourseRaw),
    } as any);

    vi.spyOn(ChapterModel, 'find').mockReturnValue({
      sort: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue(mockChaptersRaw),
    } as any);

    vi.spyOn(LessonModel, 'find').mockReturnValue({
      sort: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue(mockLessonsRaw),
    } as any);

    vi.spyOn(courseStatsService, 'getPublicCourseStats').mockResolvedValue({
      totalChapters: 2,
      totalLessons: 2,
      estimatedReadingTimeMinutes: 13,
    });

    const response = await request(app).get('/api/v1/public/courses/react-foundations/outline');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    const data = response.body.data;
    expect(data.course.id).toBe(dummyCourseId.toString());
    expect(data.course.slug).toBe('react-foundations');
    expect(data.chapters.length).toBe(2);

    // Chapter 1 has Lesson 1
    const ch1 = data.chapters[0];
    expect(ch1.id).toBe(dummyChapterId1.toString());
    expect(ch1.title).toBe('فصل اول: مقدمه');
    expect(ch1.lessons.length).toBe(1);
    expect(ch1.lessons[0].id).toBe(dummyLessonId1.toString());
    expect(ch1.lessons[0].slug).toBe('what-is-react');
    expect(ch1.lessons[0].readingTimeMinutes).toBe(5);

    // Ensure contentBlocks are excluded from outline
    expect(ch1.lessons[0]).not.toHaveProperty('contentBlocks');

    // Chapter 2 has Lesson 2
    const ch2 = data.chapters[1];
    expect(ch2.id).toBe(dummyChapterId2.toString());
    expect(ch2.lessons.length).toBe(1);
    expect(ch2.lessons[0].id).toBe(dummyLessonId2.toString());
  });

  it('excludes draft chapters and draft lessons from outline', async () => {
    vi.spyOn(CourseModel, 'findOne').mockReturnValue({
      lean: vi.fn().mockResolvedValue(mockCourseRaw),
    } as any);

    // Only 1 chapter is published, chapter 2 is draft
    const chapterFindSpy = vi.spyOn(ChapterModel, 'find').mockReturnValue({
      sort: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue([mockChaptersRaw[0]]),
    } as any);

    const lessonFindSpy = vi.spyOn(LessonModel, 'find').mockReturnValue({
      sort: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue([mockLessonsRaw[0]]),
    } as any);

    vi.spyOn(courseStatsService, 'getPublicCourseStats').mockResolvedValue({
      totalChapters: 1,
      totalLessons: 1,
      estimatedReadingTimeMinutes: 5,
    });

    const response = await request(app).get('/api/v1/public/courses/react-foundations/outline');

    expect(response.status).toBe(200);
    expect(response.body.data.chapters.length).toBe(1);

    // Chapter query filtered by status: 'published'
    expect(chapterFindSpy).toHaveBeenCalledWith({
      courseId: dummyCourseId,
      status: 'published',
    });

    // Lesson query filtered by chapterId in publishedChapterIds and status: 'published'
    expect(lessonFindSpy).toHaveBeenCalledWith(
      {
        courseId: dummyCourseId,
        chapterId: { $in: [dummyChapterId1] },
        status: 'published',
      },
      expect.anything()
    );
  });

  it('returns 404 NOT_FOUND when course is draft or nonexistent', async () => {
    vi.spyOn(CourseModel, 'findOne').mockReturnValue({
      lean: vi.fn().mockResolvedValue(null),
    } as any);

    const response = await request(app).get('/api/v1/public/courses/unpublished-course/outline');
    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('NOT_FOUND');
  });
});
