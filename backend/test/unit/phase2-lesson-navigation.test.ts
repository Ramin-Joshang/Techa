import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Types } from 'mongoose';
import { lessonNavigationService } from '../../src/modules/lessons/lesson-navigation.service';
import { chaptersRepository } from '../../src/modules/chapters/chapters.repository';
import { lessonsRepository } from '../../src/modules/lessons/lessons.repository';
import * as dbStatus from '../../src/core/database/database-status';

describe('Phase 2 — Lesson Navigation Sequential Ordering', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('calculates previous and next navigation across chapter boundaries correctly', async () => {
    vi.spyOn(dbStatus, 'isDatabaseConnected').mockReturnValue(true);

    const courseId = new Types.ObjectId();
    const ch1Id = new Types.ObjectId('111111111111111111111111');
    const ch2Id = new Types.ObjectId('222222222222222222222222');

    const mockChapters: any[] = [
      { _id: ch1Id, title: 'فصل اول', slug: 'chapter-1', order: 1 },
      { _id: ch2Id, title: 'فصل دوم', slug: 'chapter-2', order: 2 },
    ];

    const mockLessons: any[] = [
      { _id: new Types.ObjectId(), chapterId: ch1Id, title: 'درس ۱', slug: 'lesson-1-1', order: 1 },
      { _id: new Types.ObjectId(), chapterId: ch1Id, title: 'درس ۲', slug: 'lesson-1-2', order: 2 },
      { _id: new Types.ObjectId(), chapterId: ch2Id, title: 'درس ۳', slug: 'lesson-2-1', order: 1 },
      { _id: new Types.ObjectId(), chapterId: ch2Id, title: 'درس ۴', slug: 'lesson-2-2', order: 2 },
    ];

    vi.spyOn(chaptersRepository, 'findPublishedByCourseId').mockResolvedValue(mockChapters);
    vi.spyOn(lessonsRepository, 'findAllPublishedLessonsInCourse').mockResolvedValue(mockLessons);

    // 1. First lesson in course: previous is null, next is lesson-1-2
    const navFirst = await lessonNavigationService.computeLessonNavigation(courseId, 'lesson-1-1');
    expect(navFirst.previous).toBeNull();
    expect(navFirst.next?.slug).toBe('lesson-1-2');

    // 2. Last lesson of chapter 1: transitions seamlessly to first lesson of chapter 2
    const navCrossChapter = await lessonNavigationService.computeLessonNavigation(courseId, 'lesson-1-2');
    expect(navCrossChapter.previous?.slug).toBe('lesson-1-1');
    expect(navCrossChapter.next?.slug).toBe('lesson-2-1');

    // 3. First lesson of chapter 2: previous is last lesson of chapter 1
    const navCh2First = await lessonNavigationService.computeLessonNavigation(courseId, 'lesson-2-1');
    expect(navCh2First.previous?.slug).toBe('lesson-1-2');
    expect(navCh2First.next?.slug).toBe('lesson-2-2');

    // 4. Last lesson in entire course: previous is lesson-2-1, next is null
    const navLast = await lessonNavigationService.computeLessonNavigation(courseId, 'lesson-2-2');
    expect(navLast.previous?.slug).toBe('lesson-2-1');
    expect(navLast.next).toBeNull();
  });
});
