import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { Types } from 'mongoose';
import { app } from '../../src/app';
import { CourseModel } from '../../src/models/course.model';
import { LessonModel } from '../../src/models/lesson.model';
import { ChapterModel } from '../../src/models/chapter.model';
import { escapeRegex } from '../../src/core/utils/regex';
import { SearchQuerySchema } from '@techa/shared';

describe('Phase 2 — Public Search API (GET /api/v1/public/search)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('Search Query Validation & Regex Escaping', () => {
    it('accepts valid search queries', () => {
      expect(SearchQuerySchema.safeParse({ q: 'react' }).success).toBe(true);
      expect(SearchQuerySchema.safeParse({ q: 'پایتون', type: 'courses', limit: 5 }).success).toBe(true);
      expect(SearchQuerySchema.safeParse({ q: 'next.js', type: 'lessons', limit: 20 }).success).toBe(true);
    });

    it('rejects query strings shorter than 2 characters or longer than 100', () => {
      expect(SearchQuerySchema.safeParse({ q: 'a' }).success).toBe(false);
      expect(SearchQuerySchema.safeParse({ q: '' }).success).toBe(false);
      expect(SearchQuerySchema.safeParse({ q: 'x'.repeat(101) }).success).toBe(false);
    });

    it('rejects invalid search types and limits over 20', () => {
      expect(SearchQuerySchema.safeParse({ q: 'test', type: 'invalid_type' }).success).toBe(false);
      expect(SearchQuerySchema.safeParse({ q: 'test', limit: 50 }).success).toBe(false);
    });

    it('escapeRegex properly escapes special characters to prevent regex injection', () => {
      const malicious = '.*+?^${}()|[]\\';
      const escaped = escapeRegex(malicious);
      expect(escaped).toBe('\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\');
    });
  });

  describe('GET /api/v1/public/search Endpoint', () => {
    it('returns 422 VALIDATION_ERROR when query is missing or less than 2 characters', async () => {
      const response = await request(app).get('/api/v1/public/search?q=a');
      expect(response.status).toBe(422);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
    });

    it('returns 200 OK with formatted SearchResultDto for valid search', async () => {
      const courseId = new Types.ObjectId();
      const mockCourses = [
        {
          _id: courseId,
          slug: 'react-fundamentals',
          title: 'دوره جامع آموزش React',
          summary: 'مفاهیم پایه و پیشرفته ری‌اکت',
          description: 'توضیحات دوره',
          tags: ['react', 'frontend'],
          status: 'published',
        },
      ];

      vi.spyOn(CourseModel, 'find').mockReturnValue({
        sort: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue(mockCourses),
      } as any);

      vi.spyOn(ChapterModel, 'find').mockReturnValue({
        lean: vi.fn().mockResolvedValue([]),
      } as any);

      vi.spyOn(LessonModel, 'find').mockReturnValue({
        sort: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue([]),
      } as any);

      const response = await request(app).get('/api/v1/public/search?q=React&type=courses');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('query', 'React');
      expect(response.body.data).toHaveProperty('type', 'courses');
      expect(Array.isArray(response.body.data.results)).toBe(true);
      expect(response.body.data.results.length).toBe(1);

      const item = response.body.data.results[0];
      expect(item).toHaveProperty('type', 'course');
      expect(item).toHaveProperty('title', 'دوره جامع آموزش React');
      expect(item).toHaveProperty('courseSlug', 'react-fundamentals');
      expect(item).toHaveProperty('url', '/courses/react-fundamentals');
    });
  });
});
