import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import {
  ApiErrorResponseSchema,
  ApiResponseSchema,
  AdminCourseListQuerySchema,
  AdminCreateCourseDtoSchema,
  AdminUpdateCourseDtoSchema,
  AdminCourseDtoSchema,
  AdminCreateChapterDtoSchema,
  AdminUpdateChapterDtoSchema,
  AdminReorderChaptersDtoSchema,
  AdminChapterDtoSchema,
  AdminCreateLessonDtoSchema,
  AdminUpdateLessonDtoSchema,
  AdminReorderLessonsDtoSchema,
  AdminLessonDtoSchema,
  AdminMediaListQuerySchema,
  AdminUpdateMediaDtoSchema,
  AdminMediaDtoSchema,
  AdminSitePageListQuerySchema,
  AdminCreateSitePageDtoSchema,
  AdminUpdateSitePageDtoSchema,
  AdminSitePageDtoSchema,
  AdminUpdateSiteSettingsDtoSchema,
  AdminUserListQuerySchema,
  AdminUpdateUserStatusDtoSchema,
  AdminUpdateUserRolesDtoSchema,
  AdminRevokeSessionsDtoSchema,
  AdminUserDtoSchema,
  AdminUserSessionDtoSchema,
  AdminRestoreRevisionDtoSchema,
  AdminAuditLogQuerySchema,
  AdminDashboardSummaryDtoSchema,
  CourseIdParamSchema,
  ChapterIdParamSchema,
  LessonIdParamSchema,
  MediaIdParamSchema,
  PageIdParamSchema,
  UserIdParamSchema,
  RevisionIdParamSchema,
  RevisionResourceParamsSchema,
  ExpectedVersionBodySchema,
} from '@techa/shared';
import { ensureOpenApi } from './extend-zod';

export function registerAdminOpenApiRoutes(registry: OpenAPIRegistry): void {
  const reg = <T extends z.ZodTypeAny>(name: string, schema: T) =>
    registry.register(name, ensureOpenApi(schema));

  registry.registerComponent('securitySchemes', 'cookieAuth', {
    type: 'apiKey',
    in: 'cookie',
    name: 'techa_at',
    description: 'HttpOnly JWT access token cookie issued upon login.',
  });

  registry.registerComponent('securitySchemes', 'csrfToken', {
    type: 'apiKey',
    in: 'header',
    name: 'x-csrf-token',
    description: 'Double-submit CSRF token matching techa_csrf cookie for state-changing requests.',
  });

  const AdminCourseDtoRef = reg('AdminCourseDto', AdminCourseDtoSchema);
  const AdminChapterDtoRef = reg('AdminChapterDto', AdminChapterDtoSchema);
  const AdminLessonDtoRef = reg('AdminLessonDto', AdminLessonDtoSchema);
  const AdminMediaDtoRef = reg('AdminMediaDto', AdminMediaDtoSchema);
  const AdminSitePageDtoRef = reg('AdminSitePageDto', AdminSitePageDtoSchema);
  const AdminUserDtoRef = reg('AdminUserDto', AdminUserDtoSchema);
  const AdminUserSessionDtoRef = reg('AdminUserSessionDto', AdminUserSessionDtoSchema);
  const AdminDashboardSummaryDtoRef = reg('AdminDashboardSummaryDto', AdminDashboardSummaryDtoSchema);

  const GenericSuccess = ensureOpenApi(ApiResponseSchema(z.unknown()));
  const ErrorRef = ensureOpenApi(ApiErrorResponseSchema);

  const authSecurity = [{ cookieAuth: [] }];
  const writeSecurity = [{ cookieAuth: [], csrfToken: [] }];

  const stdWriteErrors = {
    401: { description: 'Authentication required.', content: { 'application/json': { schema: ErrorRef } } },
    403: { description: 'Insufficient RBAC permissions or invalid CSRF token.', content: { 'application/json': { schema: ErrorRef } } },
    409: { description: 'Conflict such as duplicate slug or optimistic concurrency version mismatch.', content: { 'application/json': { schema: ErrorRef } } },
    422: { description: 'Validation error.', content: { 'application/json': { schema: ErrorRef } } },
  };

  // Dashboard & Preview
  registry.registerPath({
    method: 'get',
    path: '/api/v1/admin/dashboard/summary',
    summary: 'Get admin dashboard summary',
    description: 'Returns live MongoDB statistics for courses, chapters, lessons, media, pages, users, and recent audit entries.',
    tags: ['Admin Dashboard & Preview'],
    security: authSecurity,
    responses: {
      200: {
        description: 'Dashboard summary retrieved.',
        content: { 'application/json': { schema: ensureOpenApi(ApiResponseSchema(AdminDashboardSummaryDtoRef)) } },
      },
      401: stdWriteErrors[401],
      403: stdWriteErrors[403],
    },
  });

  registry.registerPath({
    method: 'get',
    path: '/api/v1/admin/preview/lessons/{lessonId}',
    summary: 'Preview draft or published lesson',
    description: 'Returns complete lesson content blocks and parent chain context for administrative preview.',
    tags: ['Admin Dashboard & Preview'],
    security: authSecurity,
    request: { params: ensureOpenApi(LessonIdParamSchema) },
    responses: {
      200: { description: 'Lesson preview retrieved.', content: { 'application/json': { schema: GenericSuccess } } },
      404: { description: 'Lesson not found.', content: { 'application/json': { schema: ErrorRef } } },
    },
  });

  registry.registerPath({
    method: 'get',
    path: '/api/v1/admin/preview/courses/{courseId}',
    summary: 'Preview draft or published course',
    description: 'Returns complete course details and draft-inclusive curriculum outline for administrative preview.',
    tags: ['Admin Dashboard & Preview'],
    security: authSecurity,
    request: { params: ensureOpenApi(CourseIdParamSchema) },
    responses: {
      200: { description: 'Course preview retrieved.', content: { 'application/json': { schema: GenericSuccess } } },
      404: { description: 'Course not found.', content: { 'application/json': { schema: ErrorRef } } },
    },
  });

  // Courses
  registry.registerPath({
    method: 'get',
    path: '/api/v1/admin/courses',
    summary: 'List all courses for CMS management',
    description: 'Returns paginated courses across draft, published, and archived states.',
    tags: ['Admin Courses'],
    security: authSecurity,
    request: { query: ensureOpenApi(AdminCourseListQuerySchema) },
    responses: {
      200: { description: 'Course list retrieved.', content: { 'application/json': { schema: ensureOpenApi(ApiResponseSchema(z.array(AdminCourseDtoRef))) } } },
    },
  });

  registry.registerPath({
    method: 'post',
    path: '/api/v1/admin/courses',
    summary: 'Create a new draft course',
    description: 'Creates a course in draft status, records initial revision, and appends an audit log.',
    tags: ['Admin Courses'],
    security: writeSecurity,
    request: { body: { content: { 'application/json': { schema: ensureOpenApi(AdminCreateCourseDtoSchema) } } } },
    responses: {
      201: { description: 'Course created.', content: { 'application/json': { schema: ensureOpenApi(ApiResponseSchema(AdminCourseDtoRef)) } } },
      ...stdWriteErrors,
    },
  });

  registry.registerPath({
    method: 'get',
    path: '/api/v1/admin/courses/{courseId}',
    summary: 'Get course details by ID',
    description: 'Retrieves full administrative metadata for a course.',
    tags: ['Admin Courses'],
    security: authSecurity,
    request: { params: ensureOpenApi(CourseIdParamSchema) },
    responses: {
      200: { description: 'Course retrieved.', content: { 'application/json': { schema: ensureOpenApi(ApiResponseSchema(AdminCourseDtoRef)) } } },
    },
  });

  registry.registerPath({
    method: 'patch',
    path: '/api/v1/admin/courses/{courseId}',
    summary: 'Update course with optimistic concurrency',
    description: 'Updates allowed course fields using expectedVersion concurrency guard and creates a new revision.',
    tags: ['Admin Courses'],
    security: writeSecurity,
    request: {
      params: ensureOpenApi(CourseIdParamSchema),
      body: { content: { 'application/json': { schema: ensureOpenApi(AdminUpdateCourseDtoSchema) } } },
    },
    responses: {
      200: { description: 'Course updated.', content: { 'application/json': { schema: ensureOpenApi(ApiResponseSchema(AdminCourseDtoRef)) } } },
      ...stdWriteErrors,
    },
  });

  for (const action of ['publish', 'unpublish', 'archive'] as const) {
    registry.registerPath({
      method: 'post',
      path: `/api/v1/admin/courses/{courseId}/${action}`,
      summary: `${action.charAt(0).toUpperCase() + action.slice(1)} course`,
      description: `Transitions course publication status (${action}), recalculates stats, creates revision, and invalidates cache.`,
      tags: ['Admin Courses'],
      security: writeSecurity,
      request: {
        params: ensureOpenApi(CourseIdParamSchema),
        body: { content: { 'application/json': { schema: ensureOpenApi(ExpectedVersionBodySchema) } } },
      },
      responses: {
        200: { description: `Course ${action} succeeded.`, content: { 'application/json': { schema: ensureOpenApi(ApiResponseSchema(AdminCourseDtoRef)) } } },
        ...stdWriteErrors,
      },
    });
  }

  registry.registerPath({
    method: 'get',
    path: '/api/v1/admin/courses/{courseId}/stats',
    summary: 'Get and recalculate course statistics',
    description: 'Returns public and administrative breakdown statistics for a course.',
    tags: ['Admin Courses'],
    security: authSecurity,
    request: { params: ensureOpenApi(CourseIdParamSchema) },
    responses: {
      200: { description: 'Course stats retrieved.', content: { 'application/json': { schema: GenericSuccess } } },
    },
  });

  registry.registerPath({
    method: 'get',
    path: '/api/v1/admin/courses/{courseId}/outline',
    summary: 'Get full administrative course outline',
    description: 'Returns all chapters and lessons (including draft and archived items) ordered for CMS management.',
    tags: ['Admin Courses'],
    security: authSecurity,
    request: { params: ensureOpenApi(CourseIdParamSchema) },
    responses: {
      200: { description: 'Course outline retrieved.', content: { 'application/json': { schema: GenericSuccess } } },
    },
  });

  // Chapters
  registry.registerPath({
    method: 'get',
    path: '/api/v1/admin/courses/{courseId}/chapters',
    summary: 'List course chapters',
    description: 'Lists all chapters belonging to a course.',
    tags: ['Admin Chapters'],
    security: authSecurity,
    request: { params: ensureOpenApi(CourseIdParamSchema) },
    responses: {
      200: { description: 'Chapters retrieved.', content: { 'application/json': { schema: ensureOpenApi(ApiResponseSchema(z.array(AdminChapterDtoRef))) } } },
    },
  });

  registry.registerPath({
    method: 'post',
    path: '/api/v1/admin/courses/{courseId}/chapters',
    summary: 'Create chapter inside course',
    description: 'Creates a new draft chapter for the specified course.',
    tags: ['Admin Chapters'],
    security: writeSecurity,
    request: {
      params: ensureOpenApi(CourseIdParamSchema),
      body: { content: { 'application/json': { schema: ensureOpenApi(AdminCreateChapterDtoSchema) } } },
    },
    responses: {
      201: { description: 'Chapter created.', content: { 'application/json': { schema: ensureOpenApi(ApiResponseSchema(AdminChapterDtoRef)) } } },
      ...stdWriteErrors,
    },
  });

  registry.registerPath({
    method: 'patch',
    path: '/api/v1/admin/courses/{courseId}/chapters/reorder',
    summary: 'Reorder course chapters',
    description: 'Updates sequential display ordering of chapters inside a course.',
    tags: ['Admin Chapters'],
    security: writeSecurity,
    request: {
      params: ensureOpenApi(CourseIdParamSchema),
      body: { content: { 'application/json': { schema: ensureOpenApi(AdminReorderChaptersDtoSchema) } } },
    },
    responses: {
      200: { description: 'Chapters reordered.', content: { 'application/json': { schema: ensureOpenApi(ApiResponseSchema(z.array(AdminChapterDtoRef))) } } },
      ...stdWriteErrors,
    },
  });

  registry.registerPath({
    method: 'get',
    path: '/api/v1/admin/chapters/{chapterId}',
    summary: 'Get chapter by ID',
    description: 'Retrieves administrative chapter metadata.',
    tags: ['Admin Chapters'],
    security: authSecurity,
    request: { params: ensureOpenApi(ChapterIdParamSchema) },
    responses: {
      200: { description: 'Chapter retrieved.', content: { 'application/json': { schema: ensureOpenApi(ApiResponseSchema(AdminChapterDtoRef)) } } },
    },
  });

  registry.registerPath({
    method: 'patch',
    path: '/api/v1/admin/chapters/{chapterId}',
    summary: 'Update chapter',
    description: 'Updates chapter fields with optimistic concurrency protection.',
    tags: ['Admin Chapters'],
    security: writeSecurity,
    request: {
      params: ensureOpenApi(ChapterIdParamSchema),
      body: { content: { 'application/json': { schema: ensureOpenApi(AdminUpdateChapterDtoSchema) } } },
    },
    responses: {
      200: { description: 'Chapter updated.', content: { 'application/json': { schema: ensureOpenApi(ApiResponseSchema(AdminChapterDtoRef)) } } },
      ...stdWriteErrors,
    },
  });

  for (const action of ['publish', 'unpublish', 'archive'] as const) {
    registry.registerPath({
      method: 'post',
      path: `/api/v1/admin/chapters/{chapterId}/${action}`,
      summary: `${action.charAt(0).toUpperCase() + action.slice(1)} chapter`,
      description: `Transitions chapter status (${action}) enforcing parent course publication chain and syncing course stats.`,
      tags: ['Admin Chapters'],
      security: writeSecurity,
      request: {
        params: ensureOpenApi(ChapterIdParamSchema),
        body: { content: { 'application/json': { schema: ensureOpenApi(ExpectedVersionBodySchema) } } },
      },
      responses: {
        200: { description: `Chapter ${action} succeeded.`, content: { 'application/json': { schema: ensureOpenApi(ApiResponseSchema(AdminChapterDtoRef)) } } },
        ...stdWriteErrors,
      },
    });
  }

  // Lessons
  registry.registerPath({
    method: 'get',
    path: '/api/v1/admin/chapters/{chapterId}/lessons',
    summary: 'List lessons inside chapter',
    description: 'Lists all lessons belonging to a chapter ordered by display order.',
    tags: ['Admin Lessons'],
    security: authSecurity,
    request: { params: ensureOpenApi(ChapterIdParamSchema) },
    responses: {
      200: { description: 'Lessons retrieved.', content: { 'application/json': { schema: ensureOpenApi(ApiResponseSchema(z.array(AdminLessonDtoRef))) } } },
    },
  });

  registry.registerPath({
    method: 'post',
    path: '/api/v1/admin/chapters/{chapterId}/lessons',
    summary: 'Create lesson inside chapter',
    description: 'Creates a draft lesson validating all 13 content block types and media references.',
    tags: ['Admin Lessons'],
    security: writeSecurity,
    request: {
      params: ensureOpenApi(ChapterIdParamSchema),
      body: { content: { 'application/json': { schema: ensureOpenApi(AdminCreateLessonDtoSchema) } } },
    },
    responses: {
      201: { description: 'Lesson created.', content: { 'application/json': { schema: ensureOpenApi(ApiResponseSchema(AdminLessonDtoRef)) } } },
      ...stdWriteErrors,
    },
  });

  registry.registerPath({
    method: 'patch',
    path: '/api/v1/admin/chapters/{chapterId}/lessons/reorder',
    summary: 'Reorder chapter lessons',
    description: 'Updates sequential display ordering of lessons inside a chapter.',
    tags: ['Admin Lessons'],
    security: writeSecurity,
    request: {
      params: ensureOpenApi(ChapterIdParamSchema),
      body: { content: { 'application/json': { schema: ensureOpenApi(AdminReorderLessonsDtoSchema) } } },
    },
    responses: {
      200: { description: 'Lessons reordered.', content: { 'application/json': { schema: ensureOpenApi(ApiResponseSchema(z.array(AdminLessonDtoRef))) } } },
      ...stdWriteErrors,
    },
  });

  registry.registerPath({
    method: 'get',
    path: '/api/v1/admin/lessons/{lessonId}',
    summary: 'Get lesson details by ID',
    description: 'Retrieves full lesson document including content blocks and optimistic version.',
    tags: ['Admin Lessons'],
    security: authSecurity,
    request: { params: ensureOpenApi(LessonIdParamSchema) },
    responses: {
      200: { description: 'Lesson retrieved.', content: { 'application/json': { schema: ensureOpenApi(ApiResponseSchema(AdminLessonDtoRef)) } } },
    },
  });

  registry.registerPath({
    method: 'patch',
    path: '/api/v1/admin/lessons/{lessonId}',
    summary: 'Update lesson and content blocks',
    description: 'Updates lesson metadata and 13-block content array with optimistic concurrency and revision history.',
    tags: ['Admin Lessons'],
    security: writeSecurity,
    request: {
      params: ensureOpenApi(LessonIdParamSchema),
      body: { content: { 'application/json': { schema: ensureOpenApi(AdminUpdateLessonDtoSchema) } } },
    },
    responses: {
      200: { description: 'Lesson updated.', content: { 'application/json': { schema: ensureOpenApi(ApiResponseSchema(AdminLessonDtoRef)) } } },
      ...stdWriteErrors,
    },
  });

  for (const action of ['publish', 'unpublish', 'archive'] as const) {
    registry.registerPath({
      method: 'post',
      path: `/api/v1/admin/lessons/{lessonId}/${action}`,
      summary: `${action.charAt(0).toUpperCase() + action.slice(1)} lesson`,
      description: `Transitions lesson publication status (${action}) verifying parent chain, blocks, SEO, and recalculating stats.`,
      tags: ['Admin Lessons'],
      security: writeSecurity,
      request: {
        params: ensureOpenApi(LessonIdParamSchema),
        body: { content: { 'application/json': { schema: ensureOpenApi(ExpectedVersionBodySchema) } } },
      },
      responses: {
        200: { description: `Lesson ${action} succeeded.`, content: { 'application/json': { schema: ensureOpenApi(ApiResponseSchema(AdminLessonDtoRef)) } } },
        ...stdWriteErrors,
      },
    });
  }

  // Media
  registry.registerPath({
    method: 'get',
    path: '/api/v1/admin/media',
    summary: 'List uploaded media assets',
    description: 'Returns paginated media assets filtered by category, type, status, or query.',
    tags: ['Admin Media'],
    security: authSecurity,
    request: { query: ensureOpenApi(AdminMediaListQuerySchema) },
    responses: {
      200: { description: 'Media assets listed.', content: { 'application/json': { schema: ensureOpenApi(ApiResponseSchema(z.array(AdminMediaDtoRef))) } } },
    },
  });

  registry.registerPath({
    method: 'post',
    path: '/api/v1/admin/media/upload',
    summary: 'Upload media file via multipart streaming',
    description: 'Streams file to local storage outside source tree with magic-bytes verification, size caps, and SHA-256 checksum.',
    tags: ['Admin Media'],
    security: writeSecurity,
    responses: {
      201: { description: 'Media uploaded successfully.', content: { 'application/json': { schema: ensureOpenApi(ApiResponseSchema(AdminMediaDtoRef)) } } },
      ...stdWriteErrors,
    },
  });

  registry.registerPath({
    method: 'get',
    path: '/api/v1/admin/media/{mediaId}',
    summary: 'Get media asset metadata',
    description: 'Retrieves metadata and storage details for a media asset.',
    tags: ['Admin Media'],
    security: authSecurity,
    request: { params: ensureOpenApi(MediaIdParamSchema) },
    responses: {
      200: { description: 'Media metadata retrieved.', content: { 'application/json': { schema: ensureOpenApi(ApiResponseSchema(AdminMediaDtoRef)) } } },
    },
  });

  registry.registerPath({
    method: 'get',
    path: '/api/v1/admin/media/{mediaId}/file',
    summary: 'Stream media binary for admin preview',
    description: 'Streams raw media file securely with nosniff headers.',
    tags: ['Admin Media'],
    security: authSecurity,
    request: { params: ensureOpenApi(MediaIdParamSchema) },
    responses: {
      200: { description: 'Binary file stream.' },
    },
  });

  registry.registerPath({
    method: 'patch',
    path: '/api/v1/admin/media/{mediaId}',
    summary: 'Update media asset metadata',
    description: 'Updates altText, category, visibility, or status of a media asset.',
    tags: ['Admin Media'],
    security: writeSecurity,
    request: {
      params: ensureOpenApi(MediaIdParamSchema),
      body: { content: { 'application/json': { schema: ensureOpenApi(AdminUpdateMediaDtoSchema) } } },
    },
    responses: {
      200: { description: 'Media updated.', content: { 'application/json': { schema: ensureOpenApi(ApiResponseSchema(AdminMediaDtoRef)) } } },
      ...stdWriteErrors,
    },
  });

  registry.registerPath({
    method: 'delete',
    path: '/api/v1/admin/media/{mediaId}',
    summary: 'Delete unused media asset',
    description: 'Deletes media record and file from disk. Blocked with 409 Conflict if referenced in published or active content.',
    tags: ['Admin Media'],
    security: writeSecurity,
    request: { params: ensureOpenApi(MediaIdParamSchema) },
    responses: {
      200: { description: 'Media deleted.', content: { 'application/json': { schema: GenericSuccess } } },
      ...stdWriteErrors,
    },
  });

  registry.registerPath({
    method: 'get',
    path: '/api/v1/admin/media/{mediaId}/usage',
    summary: 'Inspect media references across CMS',
    description: 'Finds all courses, lessons, site pages, and settings referencing this media storage key.',
    tags: ['Admin Media'],
    security: authSecurity,
    request: { params: ensureOpenApi(MediaIdParamSchema) },
    responses: {
      200: { description: 'Media usages retrieved.', content: { 'application/json': { schema: GenericSuccess } } },
    },
  });

  // Public Media Serving Route
  registry.registerPath({
    method: 'get',
    path: '/api/v1/public/media/{storageKey}',
    summary: 'Serve public media file',
    description: 'Streams public ready media assets from local storage with strict path safety and nosniff headers.',
    tags: ['Public Content'],
    responses: {
      200: { description: 'Media stream.' },
      404: { description: 'Media not found or not public.', content: { 'application/json': { schema: ErrorRef } } },
    },
  });

  // Site Pages & Settings
  registry.registerPath({
    method: 'get',
    path: '/api/v1/admin/pages',
    summary: 'List site pages',
    description: 'Returns paginated CMS site pages.',
    tags: ['Admin Pages & Settings'],
    security: authSecurity,
    request: { query: ensureOpenApi(AdminSitePageListQuerySchema) },
    responses: {
      200: { description: 'Pages listed.', content: { 'application/json': { schema: ensureOpenApi(ApiResponseSchema(z.array(AdminSitePageDtoRef))) } } },
    },
  });

  registry.registerPath({
    method: 'post',
    path: '/api/v1/admin/pages',
    summary: 'Create site page',
    description: 'Creates a draft site page with content blocks and SEO metadata.',
    tags: ['Admin Pages & Settings'],
    security: writeSecurity,
    request: { body: { content: { 'application/json': { schema: ensureOpenApi(AdminCreateSitePageDtoSchema) } } } },
    responses: {
      201: { description: 'Page created.', content: { 'application/json': { schema: ensureOpenApi(ApiResponseSchema(AdminSitePageDtoRef)) } } },
      ...stdWriteErrors,
    },
  });

  registry.registerPath({
    method: 'get',
    path: '/api/v1/admin/pages/{pageId}',
    summary: 'Get site page by ID',
    description: 'Retrieves full administrative site page configuration.',
    tags: ['Admin Pages & Settings'],
    security: authSecurity,
    request: { params: ensureOpenApi(PageIdParamSchema) },
    responses: {
      200: { description: 'Page retrieved.', content: { 'application/json': { schema: ensureOpenApi(ApiResponseSchema(AdminSitePageDtoRef)) } } },
    },
  });

  registry.registerPath({
    method: 'patch',
    path: '/api/v1/admin/pages/{pageId}',
    summary: 'Update site page',
    description: 'Updates site page content with optimistic concurrency and revision snapshot.',
    tags: ['Admin Pages & Settings'],
    security: writeSecurity,
    request: {
      params: ensureOpenApi(PageIdParamSchema),
      body: { content: { 'application/json': { schema: ensureOpenApi(AdminUpdateSitePageDtoSchema) } } },
    },
    responses: {
      200: { description: 'Page updated.', content: { 'application/json': { schema: ensureOpenApi(ApiResponseSchema(AdminSitePageDtoRef)) } } },
      ...stdWriteErrors,
    },
  });

  for (const action of ['publish', 'unpublish', 'archive'] as const) {
    registry.registerPath({
      method: 'post',
      path: `/api/v1/admin/pages/{pageId}/${action}`,
      summary: `${action.charAt(0).toUpperCase() + action.slice(1)} site page`,
      description: `Transitions site page status (${action}) and invalidates page cache.`,
      tags: ['Admin Pages & Settings'],
      security: writeSecurity,
      request: {
        params: ensureOpenApi(PageIdParamSchema),
        body: { content: { 'application/json': { schema: ensureOpenApi(ExpectedVersionBodySchema) } } },
      },
      responses: {
        200: { description: `Page ${action} succeeded.`, content: { 'application/json': { schema: ensureOpenApi(ApiResponseSchema(AdminSitePageDtoRef)) } } },
        ...stdWriteErrors,
      },
    });
  }

  registry.registerPath({
    method: 'get',
    path: '/api/v1/admin/settings',
    summary: 'Get global site settings',
    description: 'Retrieves singleton global site settings with version metadata.',
    tags: ['Admin Pages & Settings'],
    security: authSecurity,
    responses: {
      200: { description: 'Settings retrieved.', content: { 'application/json': { schema: GenericSuccess } } },
    },
  });

  registry.registerPath({
    method: 'patch',
    path: '/api/v1/admin/settings',
    summary: 'Update global site settings',
    description: 'Updates singleton global site settings, records revision, logs audit entry, and revalidates cache.',
    tags: ['Admin Pages & Settings'],
    security: writeSecurity,
    request: { body: { content: { 'application/json': { schema: ensureOpenApi(AdminUpdateSiteSettingsDtoSchema) } } } },
    responses: {
      200: { description: 'Settings updated.', content: { 'application/json': { schema: GenericSuccess } } },
      ...stdWriteErrors,
    },
  });

  // Users
  registry.registerPath({
    method: 'get',
    path: '/api/v1/admin/users',
    summary: 'List platform users',
    description: 'Returns paginated user accounts with masked phone numbers and zero secret exposure.',
    tags: ['Admin Users & Governance'],
    security: authSecurity,
    request: { query: ensureOpenApi(AdminUserListQuerySchema) },
    responses: {
      200: { description: 'Users listed.', content: { 'application/json': { schema: ensureOpenApi(ApiResponseSchema(z.array(AdminUserDtoRef))) } } },
    },
  });

  registry.registerPath({
    method: 'get',
    path: '/api/v1/admin/users/{userId}',
    summary: 'Get user governance details',
    description: 'Retrieves masked user account details and active session count.',
    tags: ['Admin Users & Governance'],
    security: authSecurity,
    request: { params: ensureOpenApi(UserIdParamSchema) },
    responses: {
      200: { description: 'User retrieved.', content: { 'application/json': { schema: ensureOpenApi(ApiResponseSchema(AdminUserDtoRef)) } } },
    },
  });

  registry.registerPath({
    method: 'patch',
    path: '/api/v1/admin/users/{userId}/status',
    summary: 'Update user account status',
    description: 'Updates user status (active, suspended, disabled) while protecting self and last super_admin, revoking sessions on deactivation.',
    tags: ['Admin Users & Governance'],
    security: writeSecurity,
    request: {
      params: ensureOpenApi(UserIdParamSchema),
      body: { content: { 'application/json': { schema: ensureOpenApi(AdminUpdateUserStatusDtoSchema) } } },
    },
    responses: {
      200: { description: 'User status updated.', content: { 'application/json': { schema: ensureOpenApi(ApiResponseSchema(AdminUserDtoRef)) } } },
      ...stdWriteErrors,
    },
  });

  registry.registerPath({
    method: 'patch',
    path: '/api/v1/admin/users/{userId}/roles',
    summary: 'Update user RBAC roles',
    description: 'Updates assigned roles with anti-escalation rules and last active super_admin protection.',
    tags: ['Admin Users & Governance'],
    security: writeSecurity,
    request: {
      params: ensureOpenApi(UserIdParamSchema),
      body: { content: { 'application/json': { schema: ensureOpenApi(AdminUpdateUserRolesDtoSchema) } } },
    },
    responses: {
      200: { description: 'User roles updated.', content: { 'application/json': { schema: ensureOpenApi(ApiResponseSchema(AdminUserDtoRef)) } } },
      ...stdWriteErrors,
    },
  });

  registry.registerPath({
    method: 'get',
    path: '/api/v1/admin/users/{userId}/sessions',
    summary: 'List user sessions',
    description: 'Lists recent authentication sessions for the specified user without exposing token hashes.',
    tags: ['Admin Users & Governance'],
    security: authSecurity,
    request: { params: ensureOpenApi(UserIdParamSchema) },
    responses: {
      200: { description: 'User sessions retrieved.', content: { 'application/json': { schema: ensureOpenApi(ApiResponseSchema(z.array(AdminUserSessionDtoRef))) } } },
    },
  });

  registry.registerPath({
    method: 'post',
    path: '/api/v1/admin/users/{userId}/revoke-sessions',
    summary: 'Revoke all active user sessions',
    description: 'Revokes all active sessions for a user and increments authVersion.',
    tags: ['Admin Users & Governance'],
    security: writeSecurity,
    request: {
      params: ensureOpenApi(UserIdParamSchema),
      body: { content: { 'application/json': { schema: ensureOpenApi(AdminRevokeSessionsDtoSchema) } } },
    },
    responses: {
      200: { description: 'User sessions revoked.', content: { 'application/json': { schema: GenericSuccess } } },
      ...stdWriteErrors,
    },
  });

  // Revisions & Audit Logs
  registry.registerPath({
    method: 'get',
    path: '/api/v1/admin/revisions',
    summary: 'List recent content revisions across CMS',
    description: 'Returns paginated revision snapshots optionally filtered by resourceType, resourceId, or search query.',
    tags: ['Admin Revisions & Audit'],
    security: authSecurity,
    responses: {
      200: { description: 'Revisions listed.', content: { 'application/json': { schema: GenericSuccess } } },
    },
  });

  registry.registerPath({
    method: 'get',
    path: '/api/v1/admin/revisions/{resourceType}/{resourceId}',
    summary: 'List content revisions for a resource',
    description: 'Returns immutable version history for a course, chapter, lesson, site page, or site settings.',
    tags: ['Admin Revisions & Audit'],
    security: authSecurity,
    request: { params: ensureOpenApi(RevisionResourceParamsSchema) },
    responses: {
      200: { description: 'Revisions listed.', content: { 'application/json': { schema: GenericSuccess } } },
    },
  });

  registry.registerPath({
    method: 'get',
    path: '/api/v1/admin/revisions/{revisionId}',
    summary: 'Get single revision snapshot',
    description: 'Retrieves full snapshot details and SHA-256 content hash for a specific revision.',
    tags: ['Admin Revisions & Audit'],
    security: authSecurity,
    request: { params: ensureOpenApi(RevisionIdParamSchema) },
    responses: {
      200: { description: 'Revision retrieved.', content: { 'application/json': { schema: GenericSuccess } } },
    },
  });

  registry.registerPath({
    method: 'post',
    path: '/api/v1/admin/revisions/{revisionId}/restore',
    summary: 'Restore resource from historical revision',
    description: 'Applies snapshot back onto resource creating a new version and revision record, validating publication rules and invalidating cache.',
    tags: ['Admin Revisions & Audit'],
    security: writeSecurity,
    request: {
      params: ensureOpenApi(RevisionIdParamSchema),
      body: { content: { 'application/json': { schema: ensureOpenApi(AdminRestoreRevisionDtoSchema) } } },
    },
    responses: {
      200: { description: 'Revision restored.', content: { 'application/json': { schema: GenericSuccess } } },
      ...stdWriteErrors,
    },
  });

  registry.registerPath({
    method: 'get',
    path: '/api/v1/admin/audit-logs',
    summary: 'Query immutable admin audit logs',
    description: 'Returns filtered and paginated audit logs for administrative governance.',
    tags: ['Admin Revisions & Audit'],
    security: authSecurity,
    request: { query: ensureOpenApi(AdminAuditLogQuerySchema) },
    responses: {
      200: { description: 'Audit logs retrieved.', content: { 'application/json': { schema: GenericSuccess } } },
    },
  });
}
