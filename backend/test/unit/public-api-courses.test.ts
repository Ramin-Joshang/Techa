import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { Types } from 'mongoose';
import { app } from '../../src/app';
import { CourseModel } from '../../src/models/course.model';
import { courseStatsService } from '../../src/services/course-stats.service';

describe('Public API: Courses Endpoints', () => {
  const dummyCourseId = new Types.ObjectId();

  const mockCourseRaw = {
    _id: dummyCourseId,
    slug: 'react-foundations',
    title: 'آموزش ری‌اکت',
    summary: 'مفاهیم مقدماتی و پیشرفته ری‌اکت',
    description: 'توضیحات کامل دوره آموزش ری‌اکت به همراه پروژه‌های کاربردی',
    level: 'beginner',
    icon: { kind: 'system', name: 'lucide:code-2' },
    coverStorageKey: 'courses/react/cover.webp',
    tags: ['react', 'frontend'],
    prerequisites: ['HTML', 'CSS', 'JavaScript'],
    targetAudience: ['دانشجویان وب'],
    order: 1,
    status: 'published',
    stats: { totalChapters: 3, totalLessons: 12, estimatedReadingTimeMinutes: 75 },
    seo: { metaTitle: 'آموزش ری‌اکت', metaDescription: 'دوره جامع ری‌اکت' },
    publishedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    __v: 0,
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /api/v1/public/courses', () => {
    it('returns 200 OK with paginated list of published courses', async () => {
      vi.spyOn(CourseModel, 'countDocuments').mockResolvedValue(1 as any);
      vi.spyOn(CourseModel, 'find').mockReturnValue({
        sort: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue([mockCourseRaw]),
      } as any);

      const response = await request(app).get('/api/v1/public/courses');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(1);

      const course = response.body.data[0];
      expect(course.id).toBe(dummyCourseId.toString());
      expect(course.slug).toBe('react-foundations');
      expect(course).not.toHaveProperty('_id');
      expect(course).not.toHaveProperty('__v');

      // Pagination meta
      expect(response.body.meta).toHaveProperty('page', 1);
      expect(response.body.meta).toHaveProperty('limit', 20);
      expect(response.body.meta).toHaveProperty('total', 1);
    });

    it('filters courses by level and tag properly', async () => {
      const countSpy = vi.spyOn(CourseModel, 'countDocuments').mockResolvedValue(1 as any);
      const findSpy = vi.spyOn(CourseModel, 'find').mockReturnValue({
        sort: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue([mockCourseRaw]),
      } as any);

      const response = await request(app).get('/api/v1/public/courses?level=beginner&tag=react&page=2&limit=10');

      expect(response.status).toBe(200);
      expect(countSpy).toHaveBeenCalledWith({
        status: 'published',
        level: 'beginner',
        tags: { $regex: /^react$/i },
      });
      expect(findSpy).toHaveBeenCalledWith({
        status: 'published',
        level: 'beginner',
        tags: { $regex: /^react$/i },
      });
      expect(response.body.meta.page).toBe(2);
      expect(response.body.meta.limit).toBe(10);
    });

    it('rejects invalid pagination parameters with 422 VALIDATION_ERROR', async () => {
      const responseZero = await request(app).get('/api/v1/public/courses?page=0');
      expect(responseZero.status).toBe(422);
      expect(responseZero.body.error.code).toBe('VALIDATION_ERROR');

      const responseOversize = await request(app).get('/api/v1/public/courses?limit=100'); // limit > 50
      expect(responseOversize.status).toBe(422);
      expect(responseOversize.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects invalid filter values and unknown parameters with 422', async () => {
      const responseInvalidLevel = await request(app).get('/api/v1/public/courses?level=expert');
      expect(responseInvalidLevel.status).toBe(422);

      const responseUnknownParam = await request(app).get('/api/v1/public/courses?unknownField=test');
      expect(responseUnknownParam.status).toBe(422);
    });
  });

  describe('GET /api/v1/public/courses/:courseSlug', () => {
    it('returns 200 OK with course details and public stats', async () => {
      vi.spyOn(CourseModel, 'findOne').mockReturnValue({
        lean: vi.fn().mockResolvedValue(mockCourseRaw),
      } as any);

      vi.spyOn(courseStatsService, 'getPublicCourseStats').mockResolvedValue({
        totalChapters: 3,
        totalLessons: 12,
        estimatedReadingTimeMinutes: 75,
      });

      const response = await request(app).get('/api/v1/public/courses/react-foundations');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.slug).toBe('react-foundations');
      expect(response.body.data.id).toBe(dummyCourseId.toString());
      expect(response.body.data.stats.totalChapters).toBe(3);
      expect(response.body.data).not.toHaveProperty('_id');
      expect(response.body.data).not.toHaveProperty('__v');
    });

    it('returns 404 NOT_FOUND when course is nonexistent or draft', async () => {
      vi.spyOn(CourseModel, 'findOne').mockReturnValue({
        lean: vi.fn().mockResolvedValue(null),
      } as any);

      const response = await request(app).get('/api/v1/public/courses/draft-course');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
      expect(response.body.error.message).toMatch(/not found or is not published/i);
    });

    it('rejects invalid course slug format with 422', async () => {
      const response = await request(app).get('/api/v1/public/courses/INVALID_UPPERCASE');
      expect(response.status).toBe(422);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });
});
