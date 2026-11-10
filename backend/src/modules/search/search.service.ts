import { Types } from 'mongoose';
import { SearchQuery, SearchResultDto, SearchResultItemDto } from '@techa/shared';
import { CourseModel, CourseRaw } from '../../models/course.model';
import { ChapterModel } from '../../models/chapter.model';
import { LessonModel, LessonRaw } from '../../models/lesson.model';
import { escapeRegex } from '../../core/utils/regex';
import { isDatabaseConnected } from '../../core/database/database-status';
import { DatabaseUnavailableError } from '../../core/errors/app-error';

export class SearchService {
  /**
   * Performs public search across published courses and published lessons.
   * Excludes drafts, archives, and lessons in unpublished courses/chapters.
   * Protects against ReDoS and regex injection.
   */
  public async search(query: SearchQuery): Promise<SearchResultDto> {
    if (!isDatabaseConnected() && process.env.NODE_ENV === 'production') {
      throw new DatabaseUnavailableError('پایگاه داده در دسترس نیست.');
    }

    const { q, type, limit } = query;
    const sanitizedQuery = escapeRegex(q.trim());
    const searchRegex = new RegExp(sanitizedQuery, 'i');

    const results: SearchResultItemDto[] = [];

    // 1. Search Courses
    if (type === 'all' || type === 'courses') {
      const courseFilter = {
        status: 'published' as const,
        $or: [
          { title: { $regex: searchRegex } },
          { summary: { $regex: searchRegex } },
          { description: { $regex: searchRegex } },
          { tags: { $in: [searchRegex] } },
        ],
      };

      const matchedCourses = await CourseModel.find(courseFilter)
        .sort({ order: 1, _id: 1 })
        .limit(limit)
        .lean<CourseRaw[]>();

      for (const course of matchedCourses || []) {
        results.push({
          id: course._id.toString(),
          type: 'course',
          title: course.title,
          summary: course.summary,
          courseSlug: course.slug,
          url: `/courses/${course.slug}`,
        });
      }
    }

    // 2. Search Lessons
    if (type === 'all' || type === 'lessons') {
      const remainingLimit = limit - results.length;
      if (remainingLimit > 0) {
        // Fetch published courses first
        const publishedCourses = await CourseModel.find({ status: 'published' as const }, { _id: 1, slug: 1 }).lean();
        const publishedCourseMap = new Map<string, string>();
        const publishedCourseObjectIds: Types.ObjectId[] = [];

        publishedCourses.forEach((c) => {
          publishedCourseMap.set(c._id.toString(), c.slug);
          publishedCourseObjectIds.push(c._id);
        });

        if (publishedCourseObjectIds.length > 0) {
          // Fetch published chapter IDs belonging to published courses
          const publishedChapters = await ChapterModel.find(
            {
              courseId: { $in: publishedCourseObjectIds },
              status: 'published' as const,
            },
            { _id: 1 }
          ).lean();

          const publishedChapterIds = publishedChapters.map((ch) => ch._id);

          if (publishedChapterIds.length > 0) {
            const lessonFilter = {
              status: 'published' as const,
              courseId: { $in: publishedCourseObjectIds },
              chapterId: { $in: publishedChapterIds },
              $or: [
                { title: { $regex: searchRegex } },
                { 'seo.metaDescription': { $regex: searchRegex } },
              ],
            };

            const matchedLessons = await LessonModel.find(lessonFilter)
              .sort({ order: 1, _id: 1 })
              .limit(remainingLimit)
              .lean<LessonRaw[]>();

            for (const lesson of matchedLessons || []) {
              const courseSlug = publishedCourseMap.get(lesson.courseId.toString()) || '';
              results.push({
                id: lesson._id.toString(),
                type: 'lesson',
                title: lesson.title,
                summary: lesson.seo?.metaDescription || lesson.title,
                courseSlug,
                lessonSlug: lesson.slug,
                url: `/courses/${courseSlug}/lessons/${lesson.slug}`,
              });
            }
          }
        }
      }
    }

    return {
      query: q,
      type,
      total: results.length,
      results: results.slice(0, limit),
    };
  }
}

export const searchService = new SearchService();
