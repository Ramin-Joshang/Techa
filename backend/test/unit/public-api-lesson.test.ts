import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { Types } from 'mongoose';
import { app } from '../../src/app';
import { CourseModel } from '../../src/models/course.model';
import { ChapterModel } from '../../src/models/chapter.model';
import { LessonModel } from '../../src/models/lesson.model';

describe('Public API: GET /api/v1/public/courses/:courseSlug/lessons/:lessonSlug', () => {
  const dummyCourseId = new Types.ObjectId();
  const dummyChapterId = new Types.ObjectId();
  const dummyLessonId = new Types.ObjectId();

  const mockCourseRaw = {
    _id: dummyCourseId,
    slug: 'react-foundations',
    title: 'آموزش ری‌اکت',
    status: 'published',
  };

  const mockChapterRaw = {
    _id: dummyChapterId,
    courseId: dummyCourseId,
    title: 'فصل اول',
    slug: 'intro',
    status: 'published',
  };

  const mockLessonRaw = {
    _id: dummyLessonId,
    courseId: dummyCourseId,
    chapterId: dummyChapterId,
    title: 'درس اول: مفاهیم JSX',
    slug: 'jsx-concepts',
    order: 1,
    readingTimeMinutes: 6,
    contentSchemaVersion: 1,
    status: 'published',
    contentBlocks: [
      {
        id: 'blk_jsx_head_01',
        version: 1,
        type: 'heading',
        data: { level: 2, text: 'مقدمه‌ای بر سینتکس JSX' },
      },
      {
        id: 'blk_jsx_code_01',
        version: 1,
        type: 'codeBlock',
        data: {
          code: 'const element = <h1>سلام دنیا!</h1>;',
          language: 'javascript',
          title: 'Example.jsx',
          showLineNumbers: true,
        },
      },
      {
        id: 'blk_jsx_interactive_01',
        version: 1,
        type: 'interactiveExample',
        data: {
          environment: 'react',
          preset: 'preset-react-19-v1',
          title: 'تست JSX',
          files: [
            {
              path: 'App.jsx',
              language: 'javascript',
              content: 'export default function App() { return <h1>سلام</h1>; }',
              entryPoint: true,
            },
          ],
        },
      },
    ],
    seo: {
      metaTitle: 'آموزش JSX در ری‌اکت',
      metaDescription: 'بررسی سینتکس JSX و نحوه کامپایل آن در ری‌اکت ۱۹.',
    },
    publishedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    __v: 0,
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns 200 OK with validated lesson detail and content blocks', async () => {
    vi.spyOn(CourseModel, 'findOne').mockReturnValue({
      lean: vi.fn().mockResolvedValue(mockCourseRaw),
    } as any);

    vi.spyOn(LessonModel, 'findOne').mockReturnValue({
      lean: vi.fn().mockResolvedValue(mockLessonRaw),
    } as any);

    vi.spyOn(ChapterModel, 'findOne').mockReturnValue({
      lean: vi.fn().mockResolvedValue(mockChapterRaw),
    } as any);

    const response = await request(app).get(
      '/api/v1/public/courses/react-foundations/lessons/jsx-concepts'
    );

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    const lesson = response.body.data;
    expect(lesson.id).toBe(dummyLessonId.toString());
    expect(lesson.courseId).toBe(dummyCourseId.toString());
    expect(lesson.chapterId).toBe(dummyChapterId.toString());
    expect(lesson.title).toBe('درس اول: مفاهیم JSX');
    expect(lesson.contentSchemaVersion).toBe(1);
    expect(lesson.contentBlocks.length).toBe(3);
    expect(lesson.contentBlocks[0].type).toBe('heading');
    expect(lesson.contentBlocks[1].type).toBe('codeBlock');
    expect(lesson.contentBlocks[2].type).toBe('interactiveExample');

    // Never leak internal Mongoose fields
    expect(lesson).not.toHaveProperty('_id');
    expect(lesson).not.toHaveProperty('__v');
  });

  it('returns 404 NOT_FOUND when course is draft or nonexistent', async () => {
    vi.spyOn(CourseModel, 'findOne').mockReturnValue({
      lean: vi.fn().mockResolvedValue(null),
    } as any);

    const response = await request(app).get(
      '/api/v1/public/courses/draft-course/lessons/jsx-concepts'
    );

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('NOT_FOUND');
    expect(response.body.error.message).toMatch(/course .* not found or is not published/i);
  });

  it('returns 404 NOT_FOUND when lesson is draft or nonexistent', async () => {
    vi.spyOn(CourseModel, 'findOne').mockReturnValue({
      lean: vi.fn().mockResolvedValue(mockCourseRaw),
    } as any);

    vi.spyOn(LessonModel, 'findOne').mockReturnValue({
      lean: vi.fn().mockResolvedValue(null),
    } as any);

    const response = await request(app).get(
      '/api/v1/public/courses/react-foundations/lessons/draft-lesson'
    );

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('NOT_FOUND');
    expect(response.body.error.message).toMatch(/lesson .* not found or is not published/i);
  });

  it('returns 404 NOT_FOUND when parent chapter is draft or unavailable', async () => {
    vi.spyOn(CourseModel, 'findOne').mockReturnValue({
      lean: vi.fn().mockResolvedValue(mockCourseRaw),
    } as any);

    vi.spyOn(LessonModel, 'findOne').mockReturnValue({
      lean: vi.fn().mockResolvedValue(mockLessonRaw),
    } as any);

    // Chapter findOne returns null because chapter is not published or does not belong to course
    vi.spyOn(ChapterModel, 'findOne').mockReturnValue({
      lean: vi.fn().mockResolvedValue(null),
    } as any);

    const response = await request(app).get(
      '/api/v1/public/courses/react-foundations/lessons/jsx-concepts'
    );

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('NOT_FOUND');
    expect(response.body.error.message).toMatch(/parent chapter .* is not published or unavailable/i);
  });

  it('rejects invalid course or lesson slug format with 422 VALIDATION_ERROR', async () => {
    const responseBadCourse = await request(app).get(
      '/api/v1/public/courses/INVALID_COURSE/lessons/jsx-concepts'
    );
    expect(responseBadCourse.status).toBe(422);
    expect(responseBadCourse.body.error.code).toBe('VALIDATION_ERROR');

    const responseBadLesson = await request(app).get(
      '/api/v1/public/courses/react-foundations/lessons/INVALID_LESSON'
    );
    expect(responseBadLesson.status).toBe(422);
    expect(responseBadLesson.body.error.code).toBe('VALIDATION_ERROR');
  });
});
