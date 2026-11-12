import { Request, Response } from 'express';
import {
  CourseListQuerySchema,
  CourseSlugParamSchema,
  LessonSlugParamsSchema,
  SearchQuerySchema,
  PageKeyParamSchema,
  StorageKeySchema,
} from '@techa/shared';
import { publicService } from './public.service';
import { sendSuccess } from '../../core/utils/api-response';
import { NotFoundError } from '../../core/errors/app-error';
import { adminMediaService } from '../admin/media/media.service';
import { localMediaStorage } from '../admin/media/media-storage.service';

export class PublicController {
  private setPublicCacheHeaders(res: Response, maxAge = 60, sMaxAge = 300): void {
    res.setHeader(
      'Cache-Control',
      `public, max-age=${maxAge}, s-maxage=${sMaxAge}, stale-while-revalidate=600`
    );
  }

  /**
   * 1. GET /api/v1/public/home
   */
  public getHomepage = async (_req: Request, res: Response): Promise<void> => {
    const page = await publicService.getHomepage();
    this.setPublicCacheHeaders(res, 60, 300);
    sendSuccess(res, page, 200);
  };

  /**
   * 2. GET /api/v1/public/courses
   */
  public getCourses = async (req: Request, res: Response): Promise<void> => {
    const query = CourseListQuerySchema.parse(req.query);
    const result = await publicService.getPublishedCourses(query);
    this.setPublicCacheHeaders(res, 60, 300);

    sendSuccess(res, result.courses, 200, undefined, {
      page: result.page,
      limit: result.limit,
      total: result.total,
      pagination: {
        page: result.page,
        limit: result.limit,
        totalItems: result.total,
        totalPages: result.totalPages,
        hasNextPage: result.hasNextPage,
        hasPreviousPage: result.hasPreviousPage,
      },
    });
  };

  /**
   * 3. GET /api/v1/public/courses/:courseSlug
   */
  public getCourseDetail = async (req: Request, res: Response): Promise<void> => {
    const { courseSlug } = CourseSlugParamSchema.parse(req.params);
    const course = await publicService.getPublishedCourseDetail(courseSlug);
    this.setPublicCacheHeaders(res, 120, 600);
    sendSuccess(res, course, 200);
  };

  /**
   * 4. GET /api/v1/public/courses/:courseSlug/outline
   */
  public getCourseOutline = async (req: Request, res: Response): Promise<void> => {
    const { courseSlug } = CourseSlugParamSchema.parse(req.params);
    const outline = await publicService.getCourseOutline(courseSlug);
    this.setPublicCacheHeaders(res, 120, 600);
    sendSuccess(res, outline, 200);
  };

  /**
   * 5. GET /api/v1/public/courses/:courseSlug/lessons/:lessonSlug
   */
  public getLessonDetail = async (req: Request, res: Response): Promise<void> => {
    const { courseSlug, lessonSlug } = LessonSlugParamsSchema.parse(req.params);
    const lesson = await publicService.getPublishedLessonDetail(courseSlug, lessonSlug);
    this.setPublicCacheHeaders(res, 300, 900);
    sendSuccess(res, lesson, 200);
  };

  /**
   * 6. GET /api/v1/public/search
   */
  public search = async (req: Request, res: Response): Promise<void> => {
    const query = SearchQuerySchema.parse(req.query);
    const results = await publicService.search(query);
    this.setPublicCacheHeaders(res, 30, 60);
    sendSuccess(res, results, 200);
  };

  /**
   * 7. GET /api/v1/public/settings
   */
  public getSettings = async (_req: Request, res: Response): Promise<void> => {
    const settings = await publicService.getPublicSettings();
    this.setPublicCacheHeaders(res, 300, 1800);
    sendSuccess(res, settings, 200);
  };

  /**
   * 8. GET /api/v1/public/pages/:pageKey
   */
  public getPage = async (req: Request, res: Response): Promise<void> => {
    const { pageKey } = PageKeyParamSchema.parse(req.params);
    const page = await publicService.getPublishedPage(pageKey);
    this.setPublicCacheHeaders(res, 120, 600);
    sendSuccess(res, page, 200);
  };

  /**
   * 9. GET /api/v1/public/media/*storageKey
   */
  public servePublicMedia = async (req: Request, res: Response): Promise<void> => {
    const rawParam = (req.params as { storageKey?: string | string[] }).storageKey;
    const rawKey = Array.isArray(rawParam) ? rawParam.join('/') : String(rawParam || '');
    const parsedKey = StorageKeySchema.safeParse(rawKey);
    if (!parsedKey.success) {
      throw new NotFoundError('رسانه درخواستی یافت نشد');
    }

    const media = await adminMediaService.findPublicServableByStorageKey(parsedKey.data);
    if (!media) {
      throw new NotFoundError('رسانه درخواستی یافت نشد');
    }

    const exists = await localMediaStorage.exists(media.storageKey);
    if (!exists) {
      throw new NotFoundError('فایل رسانه در مخزن موجود نیست');
    }

    const { stream, sizeBytes } = await localMediaStorage.openReadStreamSafe(media.storageKey);
    const disposition = media.mediaType === 'document' ? 'attachment' : 'inline';

    res.setHeader('Content-Type', media.mimeType);
    res.setHeader('Content-Length', String(sizeBytes));
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader(
      'Content-Disposition',
      `${disposition}; filename="${encodeURIComponent(media.originalFileName)}"`
    );

    stream.pipe(res);
  };
}

export const publicController = new PublicController();
