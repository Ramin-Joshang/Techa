import { Types } from 'mongoose';
import { ChapterRaw } from '../../models/chapter.model';
import { chaptersRepository } from '../chapters/chapters.repository';
import { lessonsRepository } from './lessons.repository';

import { isDatabaseConnected } from '../../core/database/database-status';

export interface LessonNavigationDto {
  previous: {
    slug: string;
    title: string;
  } | null;
  next: {
    slug: string;
    title: string;
  } | null;
}

export class LessonNavigationService {
  /**
   * Computes previous and next lesson navigation across chapters for a published lesson.
   * Progression ordering:
   * 1. Chapter.order (ascending)
   * 2. Chapter._id (stable tie-breaker)
   * 3. Lesson.order (ascending)
   * 4. Lesson._id (stable tie-breaker)
   */
  public async computeLessonNavigation(
    courseId: Types.ObjectId,
    currentLessonSlug: string
  ): Promise<LessonNavigationDto> {
    if (!isDatabaseConnected()) {
      return { previous: null, next: null };
    }

    const publishedChapters = await chaptersRepository.findPublishedByCourseId(courseId);
    if (publishedChapters.length === 0) {
      return { previous: null, next: null };
    }

    const chapterIds = publishedChapters.map((ch) => ch._id);
    const chapterOrderMap = new Map<string, number>();
    publishedChapters.forEach((ch, idx) => {
      chapterOrderMap.set(ch._id.toString(), idx);
    });

    const lessons = await lessonsRepository.findAllPublishedLessonsInCourse(courseId, chapterIds);
    if (lessons.length === 0) {
      return { previous: null, next: null };
    }

    // Sort lessons across chapters according to pedagogical sequence
    const orderedLessons = [...lessons].sort((a, b) => {
      const chIdxA = chapterOrderMap.get(a.chapterId.toString()) ?? 0;
      const chIdxB = chapterOrderMap.get(b.chapterId.toString()) ?? 0;

      if (chIdxA !== chIdxB) {
        return chIdxA - chIdxB;
      }

      if (a.order !== b.order) {
        return a.order - b.order;
      }

      return a._id.toString().localeCompare(b._id.toString());
    });

    const currentIndex = orderedLessons.findIndex((l) => l.slug === currentLessonSlug);
    if (currentIndex === -1) {
      return { previous: null, next: null };
    }

    const prevLesson = currentIndex > 0 ? orderedLessons[currentIndex - 1] : null;
    const nextLesson =
      currentIndex < orderedLessons.length - 1 ? orderedLessons[currentIndex + 1] : null;

    return {
      previous: prevLesson
        ? {
            slug: prevLesson.slug,
            title: prevLesson.title,
          }
        : null,
      next: nextLesson
        ? {
            slug: nextLesson.slug,
            title: nextLesson.title,
          }
        : null,
    };
  }
}

export const lessonNavigationService = new LessonNavigationService();
