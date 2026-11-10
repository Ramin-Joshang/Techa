import { Router } from 'express';
import { publicController } from './public.controller';
import { asyncHandler } from '../../core/utils/async-handler';
import { searchRateLimiter } from '../../core/middleware/rate-limiter';

export const publicRoutes = Router();

// 1. Homepage
publicRoutes.get('/home', asyncHandler(publicController.getHomepage));

// 2. Published course list with pagination, filtering & sorting
publicRoutes.get('/courses', asyncHandler(publicController.getCourses));

// 3. Search published courses & lessons (protected by search rate limiter)
publicRoutes.get('/search', searchRateLimiter, asyncHandler(publicController.search));

// 4. Public site settings (branding, navigation, footer, seo)
publicRoutes.get('/settings', asyncHandler(publicController.getSettings));

// 5. Custom published site pages (e.g. /pages/about, /pages/home)
publicRoutes.get('/pages/:pageKey', asyncHandler(publicController.getPage));

// 6. Course detail
publicRoutes.get('/courses/:courseSlug', asyncHandler(publicController.getCourseDetail));

// 7. Course outline (curriculum hierarchy for sidebars)
publicRoutes.get('/courses/:courseSlug/outline', asyncHandler(publicController.getCourseOutline));

// 8. Lesson detail with cross-chapter navigation and verified content blocks
publicRoutes.get(
  '/courses/:courseSlug/lessons/:lessonSlug',
  asyncHandler(publicController.getLessonDetail)
);
