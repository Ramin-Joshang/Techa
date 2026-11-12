import { Types } from 'mongoose';
import {
  CoursePublicDto,
  CourseListQuery,
  CourseOutlinePublicDto,
  LessonPublicDto,
  PublicSiteSettingsDto,
  SearchQuery,
  SearchResultDto,
  PublicSitePageDto,
} from '@techa/shared';
import { CourseRaw } from '../../models/course.model';
import { ChapterRaw } from '../../models/chapter.model';
import { LessonRaw } from '../../models/lesson.model';
import { SitePageRaw } from '../../models/site-page.model';
import { courseStatsService } from '../../services/course-stats.service';
import { coursesRepository } from '../courses/courses.repository';
import { chaptersRepository } from '../chapters/chapters.repository';
import { lessonsRepository } from '../lessons/lessons.repository';
import { lessonNavigationService } from '../lessons/lesson-navigation.service';
import { sitePagesRepository } from '../site-pages/site-pages.repository';
import { siteSettingsRepository } from '../site-settings/site-settings.repository';
import { searchService } from '../search/search.service';
import { NotFoundError, DatabaseUnavailableError, AppError } from '../../core/errors/app-error';
import { isDatabaseConnected } from '../../core/database/database-status';
import { normalizeContentBlocks, normalizeCourseIcon, normalizeSiteHeader } from '../../core/utils/dto-normalizer';

export interface PaginatedCoursesResult {
  courses: CoursePublicDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export class PublicService {
  /**
   * 1. GET /api/v1/public/home
   * Retrieves homepage configuration exclusively from real MongoDB collections:
   * site_pages, site_settings, and courses.
   * Calculates live statistics dynamically from actual data.
   */
  public async getHomepage(): Promise<any> {
    if (!isDatabaseConnected() && process.env.NODE_ENV === 'production') {
      throw new DatabaseUnavailableError('پایگاه داده در دسترس نیست.');
    }

    try {
      const page = await sitePagesRepository.findByPageKey('home');
      if (!page || (page.status && page.status !== 'published')) {
        throw new NotFoundError('Homepage configuration not found in site_pages collection');
      }

      let settings: any = null;
      let featuredCourses: CoursePublicDto[] = [];
      let statistics = {
        totalCourses: 0,
        totalChapters: 0,
        totalLessons: 0,
        totalReadingTimeMinutes: 0,
      };

      if (isDatabaseConnected()) {
        try {
          const [st, featuredRaw, totalCourses, totalChapters, totalLessons, totalReadingTimeMinutes] =
            await Promise.all([
              siteSettingsRepository.getGlobalSettings().catch(() => null),
              coursesRepository.getFeaturedPublished(6).catch(() => []),
              coursesRepository.countPublished().catch(() => 0),
              chaptersRepository.countTotalPublished().catch(() => 0),
              lessonsRepository.countTotalPublished().catch(() => 0),
              lessonsRepository.sumTotalReadingTimeMinutes().catch(() => 0),
            ]);

          settings = st;
          statistics = {
            totalCourses: totalCourses || 0,
            totalChapters: totalChapters || 0,
            totalLessons: totalLessons || 0,
            totalReadingTimeMinutes: totalReadingTimeMinutes || 0,
          };

          featuredCourses = (featuredRaw || []).map((c) => ({
            id: c._id.toString(),
            slug: c.slug,
            title: c.title,
            summary: c.summary,
            description: c.description,
            level: c.level,
            icon: normalizeCourseIcon(c.icon),
            coverStorageKey: c.coverStorageKey,
            tags: c.tags || [],
            prerequisites: c.prerequisites || [],
            targetAudience: c.targetAudience || [],
            order: c.order,
            stats: c.stats || {
              totalChapters: 0,
              totalLessons: 0,
              estimatedReadingTimeMinutes: 0,
            },
            seo: c.seo,
            publishedAt: c.publishedAt ? new Date(c.publishedAt).toISOString() : null,
          }));
        } catch {
          // Keep defaults if database operation fails
        }
      }

      return {
        pageKey: page.pageKey,
        title: page.title,
        ...(settings?.branding ? { branding: settings.branding } : {}),
        heroSection: page.heroSection,
        features: page.features,
        featuredCourses,
        statistics,
        ...(settings?.footer ? { footer: settings.footer } : {}),
        seo: page.seo,
      };
    } catch (err: unknown) {
      if (err instanceof AppError) throw err;
      throw new DatabaseUnavailableError('ارتباط با پایگاه داده برقرار نیست یا سرویس در دسترس نمی‌باشد.', err);
    }
  }

  /**
   * 2. GET /api/v1/public/courses
   * Retrieves published courses with validated pagination, level, tag, and search filters.
   */
  public async getPublishedCourses(query: CourseListQuery): Promise<PaginatedCoursesResult> {
    if (!isDatabaseConnected() && process.env.NODE_ENV === 'production') {
      throw new DatabaseUnavailableError('پایگاه داده در دسترس نیست.');
    }

    try {
      const { courses, total } = await coursesRepository.findPublished(query);

      const page = query.page || 1;
      const limit = query.limit || 20;
      const totalPages = Math.ceil(total / limit) || 0;

      const publicCourses: CoursePublicDto[] = (courses || []).map((course) => ({
        id: course._id.toString(),
        slug: course.slug,
        title: course.title,
        summary: course.summary,
        description: course.description,
        level: course.level,
        icon: normalizeCourseIcon(course.icon),
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
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      };
    } catch (err: unknown) {
      if (err instanceof AppError) throw err;
      throw new DatabaseUnavailableError('ارتباط با پایگاه داده برقرار نیست یا سرویس در دسترس نمی‌باشد.', err);
    }
  }

  /**
   * 3. GET /api/v1/public/courses/:courseSlug
   * Retrieves single published course detail with outline.
   */
  public async getPublishedCourseDetail(courseSlug: string): Promise<CoursePublicDto> {
    if (!isDatabaseConnected() && process.env.NODE_ENV === 'production') {
      throw new DatabaseUnavailableError('پایگاه داده در دسترس نیست.');
    }

    try {
      const course = await coursesRepository.findPublishedBySlug(courseSlug);
      if (!course) {
        throw new NotFoundError(`Course "${courseSlug}" not found or is not published`);
      }

      const publicStats = await courseStatsService.getPublicCourseStats(course._id);
      return {
        id: course._id.toString(),
        slug: course.slug,
        title: course.title,
        summary: course.summary,
        description: course.description,
        level: course.level,
        icon: normalizeCourseIcon(course.icon),
        coverStorageKey: course.coverStorageKey,
        tags: course.tags || [],
        prerequisites: course.prerequisites || [],
        targetAudience: course.targetAudience || [],
        order: course.order,
        stats: publicStats,
        seo: course.seo,
        publishedAt: course.publishedAt ? new Date(course.publishedAt).toISOString() : null,
      };
    } catch (err: unknown) {
      if (err instanceof AppError) throw err;
      throw new DatabaseUnavailableError('ارتباط با پایگاه داده برقرار نیست یا سرویس در دسترس نمی‌باشد.', err);
    }
  }

  /**
   * 4. GET /api/v1/public/courses/:courseSlug/outline
   * Lightweight hierarchy outline for sidebars and curriculum navigation.
   */
  public async getCourseOutline(courseSlug: string): Promise<CourseOutlinePublicDto> {
    if (!isDatabaseConnected() && process.env.NODE_ENV === 'production') {
      throw new DatabaseUnavailableError('پایگاه داده در دسترس نیست.');
    }

    try {
      const course = await coursesRepository.findPublishedBySlug(courseSlug);
      if (!course) {
        throw new NotFoundError(`Course "${courseSlug}" not found or is not published`);
      }

      const chapters = await chaptersRepository.findPublishedByCourseId(course._id);
      const publishedChapterIds = chapters.map((ch) => ch._id);

      const lessons = await lessonsRepository.findOutlineByChapters(course._id, publishedChapterIds);

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
    } catch (err: unknown) {
      if (err instanceof AppError) throw err;
      throw new DatabaseUnavailableError('ارتباط با پایگاه داده برقرار نیست یا سرویس در دسترس نمی‌باشد.', err);
    }
  }

  /**
   * 5. GET /api/v1/public/courses/:courseSlug/lessons/:lessonSlug
   * Enforces complete publication chain (course -> chapter -> lesson) and calculates navigation.
   */
  public async getPublishedLessonDetail(
    courseSlug: string,
    lessonSlug: string
  ): Promise<LessonPublicDto> {
    if (!isDatabaseConnected() && process.env.NODE_ENV === 'production') {
      throw new DatabaseUnavailableError('پایگاه داده در دسترس نیست.');
    }

    try {
      const course = await coursesRepository.findPublishedBySlug(courseSlug);
      if (!course) {
        throw new NotFoundError(`Course "${courseSlug}" not found or is not published`);
      }

      const lesson = await lessonsRepository.findPublishedByCourseAndSlug(course._id, lessonSlug);
      if (!lesson) {
        throw new NotFoundError(`Lesson "${lessonSlug}" not found or is not published`);
      }

      const chapter = await chaptersRepository.findPublishedByIdAndCourseId(lesson.chapterId, course._id);
      if (!chapter) {
        throw new NotFoundError(
          `Parent chapter for lesson "${lessonSlug}" is not published or unavailable`
        );
      }

      // Compute sequential navigation across chapter boundaries
      const navigation = await lessonNavigationService.computeLessonNavigation(
        course._id,
        lesson.slug
      );

      return {
        id: lesson._id.toString(),
        courseId: lesson.courseId.toString(),
        chapterId: lesson.chapterId.toString(),
        title: lesson.title,
        slug: lesson.slug,
        summary: lesson.seo?.metaDescription || lesson.title,
        order: lesson.order,
        readingTimeMinutes: lesson.readingTimeMinutes,
        contentSchemaVersion: lesson.contentSchemaVersion,
        contentBlocks: normalizeContentBlocks(lesson.contentBlocks || []),
        seo: lesson.seo,
        navigation,
        publishedAt: lesson.publishedAt ? new Date(lesson.publishedAt).toISOString() : null,
      };
    } catch (err: unknown) {
      if (err instanceof AppError) throw err;
      throw new DatabaseUnavailableError('ارتباط با پایگاه داده برقرار نیست یا سرویس در دسترس نمی‌باشد.', err);
    }
  }

  /**
   * 6. GET /api/v1/public/search
   * Safely searches published courses and lessons with protection against regex injection.
   */
  public async search(query: SearchQuery): Promise<SearchResultDto> {
    return searchService.search(query);
  }

  /**
   * 7. GET /api/v1/public/settings
   * Returns only public site settings (branding, header, footer, seo, general).
   * Strips all internal IDs, updatedBy, and confidential administrative data.
   */
  public async getPublicSettings(): Promise<PublicSiteSettingsDto> {
    if (!isDatabaseConnected() && process.env.NODE_ENV === 'production') {
      throw new DatabaseUnavailableError('پایگاه داده در دسترس نیست.');
    }

    try {
      const settings = await siteSettingsRepository.getGlobalSettings();
      if (!settings) {
        throw new NotFoundError('Site settings not configured in database');
      }

      return {
        branding: settings.branding,
        header: normalizeSiteHeader(settings.header),
        footer: settings.footer,
        seo: settings.seo,
        general: settings.general,
      };
    } catch (err: unknown) {
      if (err instanceof AppError) throw err;
      throw new DatabaseUnavailableError('ارتباط با پایگاه داده برقرار نیست یا سرویس در دسترس نمی‌باشد.', err);
    }
  }

  /**
   * 8. GET /api/v1/public/pages/:pageKey
   * Retrieves published custom site page from site_pages collection.
   */
  public async getPublishedPage(pageKey: string): Promise<PublicSitePageDto> {
    if (!isDatabaseConnected() && process.env.NODE_ENV === 'production') {
      throw new DatabaseUnavailableError('پایگاه داده در دسترس نیست.');
    }

    try {
      const page = await sitePagesRepository.findByPageKey(pageKey);
      if (!page || (page.status && page.status !== 'published')) {
        throw new NotFoundError(`Site page "${pageKey}" not found`);
      }

      return {
        pageKey: page.pageKey,
        title: page.title,
        contentBlocks: normalizeContentBlocks(page.contentBlocks || []),
        seo: page.seo,
        publishedAt: page.publishedAt
          ? new Date(page.publishedAt).toISOString()
          : page.createdAt
            ? new Date(page.createdAt).toISOString()
            : null,
      };
    } catch (err: unknown) {
      if (err instanceof AppError) throw err;
      throw new DatabaseUnavailableError('ارتباط با پایگاه داده برقرار نیست یا سرویس در دسترس نمی‌باشد.', err);
    }
  }
}

export const publicService = new PublicService();
