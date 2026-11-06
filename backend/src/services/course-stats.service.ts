import { Types } from 'mongoose';
import { CourseModel } from '../models/course.model';
import { ChapterModel } from '../models/chapter.model';
import { LessonModel } from '../models/lesson.model';
import { NotFoundError } from '../core/errors/app-error';

export interface CalculatedCourseStats {
  totalChapters: number;
  totalLessons: number;
  estimatedReadingTimeMinutes: number;
}

export class CourseStatsService {
  /**
   * Recalculates course statistics:
   * 1. Counts published chapters for the course.
   * 2. Counts published lessons whose parent chapter is also published.
   * 3. Sums readingTimeMinutes for those eligible published lessons.
   * 4. Updates and persists stats onto the Course document.
   */
  public async recalculateCourseStats(
    courseId: string | Types.ObjectId
  ): Promise<CalculatedCourseStats> {
    const courseObjectId = typeof courseId === 'string' ? new Types.ObjectId(courseId) : courseId;

    const course = await CourseModel.findById(courseObjectId);
    if (!course) {
      throw new NotFoundError(`Course with id ${courseId} not found`);
    }

    // 1. Fetch all published chapters for this course
    const publishedChapters = await ChapterModel.find(
      { courseId: courseObjectId, status: 'published' },
      { _id: 1 }
    ).lean();

    const publishedChapterIds = publishedChapters.map((c) => c._id);
    const totalChapters = publishedChapters.length;

    let totalLessons = 0;
    let estimatedReadingTimeMinutes = 0;

    // 2. Aggregate lessons belonging strictly to published chapters
    if (publishedChapterIds.length > 0) {
      const lessonAggregation = await LessonModel.aggregate([
        {
          $match: {
            courseId: courseObjectId,
            chapterId: { $in: publishedChapterIds },
            status: 'published',
          },
        },
        {
          $group: {
            _id: null,
            totalLessons: { $sum: 1 },
            totalReadingTime: { $sum: '$readingTimeMinutes' },
          },
        },
      ]);

      if (lessonAggregation.length > 0) {
        totalLessons = lessonAggregation[0].totalLessons || 0;
        estimatedReadingTimeMinutes = lessonAggregation[0].totalReadingTime || 0;
      }
    }

    const calculatedStats: CalculatedCourseStats = {
      totalChapters,
      totalLessons,
      estimatedReadingTimeMinutes,
    };

    // 3. Persist updated stats on Course document
    course.stats = calculatedStats;
    await course.save();

    return calculatedStats;
  }

  /**
   * Retrieves public statistics for a course.
   * If the course is not published, public stats are guaranteed to be zero.
   */
  public async getPublicCourseStats(
    courseId: string | Types.ObjectId
  ): Promise<CalculatedCourseStats> {
    const course = await CourseModel.findById(courseId);
    if (!course || course.status !== 'published') {
      return {
        totalChapters: 0,
        totalLessons: 0,
        estimatedReadingTimeMinutes: 0,
      };
    }

    return course.stats;
  }
}

export const courseStatsService = new CourseStatsService();
