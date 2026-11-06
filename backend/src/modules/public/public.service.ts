import {
  CoursePublicDto,
  CourseListQuery,
  CourseOutlinePublicDto,
  LessonPublicDto,
  SitePagePublicDto,
} from '@techa/shared';
import { CourseModel, CourseRaw } from '../../models/course.model';
import { ChapterModel, ChapterRaw } from '../../models/chapter.model';
import { LessonModel, LessonRaw } from '../../models/lesson.model';
import { SitePageModel, SitePageRaw } from '../../models/site-page.model';
import { courseStatsService } from '../../services/course-stats.service';
import { NotFoundError } from '../../core/errors/app-error';

export interface PaginatedCoursesResult {
  courses: CoursePublicDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class PublicService {
  /**
   * 1. GET /api/v1/public/home
   * Retrieves homepage configuration from site_pages collection.
   */
  public async getHomepage(): Promise<SitePagePublicDto> {
    const page = await SitePageModel.findOne({ pageKey: 'home' }).lean<SitePageRaw>();
    if (!page) {
      throw new NotFoundError('Homepage configuration not found');
    }

    return {
      pageKey: page.pageKey,
      title: page.title,
      heroSection: page.heroSection,
      features: page.features,
      seo: page.seo,
    };
  }

  /**
   * 2. GET /api/v1/public/courses
   * Retrieves published courses only, with pagination, sorting, and validated filters.
   */
  public async getPublishedCourses(query: CourseListQuery): Promise<PaginatedCoursesResult> {
    const filter: Record<string, unknown> = { status: 'published' };

    if (query.level) {
      filter.level = query.level;
    }

    if (query.tag) {
      filter.tags = query.tag;
    }

    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const [total, courses] = await Promise.all([
      CourseModel.countDocuments(filter),
      CourseModel.find(filter)
        .sort({ order: 1, _id: 1 })
        .skip(skip)
        .limit(limit)
        .lean<CourseRaw[]>(),
    ]);

    const publicCourses: CoursePublicDto[] = courses.map((course) => ({
      id: course._id.toString(),
      slug: course.slug,
      title: course.title,
      summary: course.summary,
      description: course.description,
      level: course.level,
      icon: course.icon,
      coverStorageKey: course.coverStorageKey,
      tags: course.tags || [],
      prerequisites: course.prerequisites || [],
      targetAudience: course.targetAudience || [],
      order: course.order,
      stats: course.stats || {
        totalChapters: 0,
        totalLessons: 0,
        estimatedReadingTimeMinutes: 0,
      },
      seo: course.seo,
      publishedAt: course.publishedAt ? new Date(course.publishedAt).toISOString() : null,
    }));

    return {
      courses: publicCourses,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /**
   * 3. GET /api/v1/public/courses/:courseSlug
   * Retrieves detailed metadata and public statistics for a single published course.
   */
  public async getPublishedCourseDetail(courseSlug: string): Promise<CoursePublicDto> {
    const course = await CourseModel.findOne({ slug: courseSlug, status: 'published' }).lean<CourseRaw>();
    if (!course) {
      throw new NotFoundError(`Course "${courseSlug}" not found or is not published`);
    }

    // Refresh public stats to guarantee accuracy excluding unpublished chains
    const publicStats = await courseStatsService.getPublicCourseStats(course._id);

    return {
      id: course._id.toString(),
      slug: course.slug,
      title: course.title,
      summary: course.summary,
      description: course.description,
      level: course.level,
      icon: course.icon,
      coverStorageKey: course.coverStorageKey,
      tags: course.tags || [],
      prerequisites: course.prerequisites || [],
      targetAudience: course.targetAudience || [],
      order: course.order,
      stats: publicStats,
      seo: course.seo,
      publishedAt: course.publishedAt ? new Date(course.publishedAt).toISOString() : null,
    };
  }

  /**
   * 4. GET /api/v1/public/courses/:courseSlug/outline
   * Retrieves the course hierarchy outline with published chapters and lesson summaries only.
   */
  public async getCourseOutline(courseSlug: string): Promise<CourseOutlinePublicDto> {
    const course = await CourseModel.findOne({ slug: courseSlug, status: 'published' }).lean<CourseRaw>();
    if (!course) {
      throw new NotFoundError(`Course "${courseSlug}" not found or is not published`);
    }

    // Fetch published chapters for this course, ordered
    const chapters = await ChapterModel.find({
      courseId: course._id,
      status: 'published',
    })
      .sort({ order: 1, _id: 1 })
      .lean<ChapterRaw[]>();

    const publishedChapterIds = chapters.map((ch) => ch._id);

    // Fetch published lessons belonging strictly to these published chapters
    const lessons = publishedChapterIds.length > 0
      ? await LessonModel.find(
          {
            courseId: course._id,
            chapterId: { $in: publishedChapterIds },
            status: 'published',
          },
          {
            _id: 1,
            chapterId: 1,
            title: 1,
            slug: 1,
            order: 1,
            readingTimeMinutes: 1,
          }
        )
          .sort({ order: 1, _id: 1 })
          .lean<Array<Pick<LessonRaw, '_id' | 'chapterId' | 'title' | 'slug' | 'order' | 'readingTimeMinutes'>>>()
      : [];

    // Group lesson summaries by chapterId
    const lessonsByChapter: Record<
      string,
      Array<{
        id: string;
        title: string;
        slug: string;
        order: number;
        readingTimeMinutes: number;
      }>
    > = {};

    for (const lesson of lessons) {
      const chId = lesson.chapterId.toString();
      if (!lessonsByChapter[chId]) {
        lessonsByChapter[chId] = [];
      }
      lessonsByChapter[chId].push({
        id: lesson._id.toString(),
        title: lesson.title,
        slug: lesson.slug,
        order: lesson.order,
        readingTimeMinutes: lesson.readingTimeMinutes,
      });
    }

    const publicStats = await courseStatsService.getPublicCourseStats(course._id);

    return {
      course: {
        id: course._id.toString(),
        slug: course.slug,
        title: course.title,
        stats: publicStats,
      },
      chapters: chapters.map((ch) => ({
        id: ch._id.toString(),
        title: ch.title,
        slug: ch.slug,
        summary: ch.summary,
        order: ch.order,
        lessons: lessonsByChapter[ch._id.toString()] || [],
      })),
    };
  }

  /**
   * 5. GET /api/v1/public/courses/:courseSlug/lessons/:lessonSlug
   * Enforces complete publication chain (course -> chapter -> lesson) and returns LessonPublicDto.
   */
  public async getPublishedLessonDetail(
    courseSlug: string,
    lessonSlug: string
  ): Promise<LessonPublicDto> {
    // 1. Resolve published course
    const course = await CourseModel.findOne({ slug: courseSlug, status: 'published' }).lean<CourseRaw>();
    if (!course) {
      throw new NotFoundError(`Course "${courseSlug}" not found or is not published`);
    }

    // 2. Resolve published lesson within that course
    const lesson = await LessonModel.findOne({
      courseId: course._id,
      slug: lessonSlug,
      status: 'published',
    }).lean<LessonRaw>();

    if (!lesson) {
      throw new NotFoundError(`Lesson "${lessonSlug}" not found or is not published`);
    }

    // 3. Resolve parent chapter and verify it is published and belongs to this course
    const chapter = await ChapterModel.findOne({
      _id: lesson.chapterId,
      courseId: course._id,
      status: 'published',
    }).lean<ChapterRaw>();

    if (!chapter) {
      throw new NotFoundError(
        `Parent chapter for lesson "${lessonSlug}" is not published or unavailable`
      );
    }

    return {
      id: lesson._id.toString(),
      courseId: lesson.courseId.toString(),
      chapterId: lesson.chapterId.toString(),
      title: lesson.title,
      slug: lesson.slug,
      order: lesson.order,
      readingTimeMinutes: lesson.readingTimeMinutes,
      contentSchemaVersion: lesson.contentSchemaVersion,
      contentBlocks: lesson.contentBlocks || [],
      seo: lesson.seo,
      publishedAt: lesson.publishedAt ? new Date(lesson.publishedAt).toISOString() : null,
    };
  }
}

export const publicService = new PublicService();
