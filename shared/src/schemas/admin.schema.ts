import { z } from 'zod';
import {
  ObjectIdSchema,
  SlugSchema,
  StorageKeySchema,
  CourseLevelSchema,
  CourseIconSchema,
  PublicationStatusSchema,
  MediaCategorySchema,
  SeoMetadataSchema,
  CourseStatsSchema,
  UserRoleSchema,
  AccountStatusSchema,
  AuditActionSchema,
  AuditResultSchema,
  RevisionResourceTypeSchema,
  isSafeHttpUrl,
} from './primitives.schema';
import { CourseTagSchema } from './course.schema';
import { ContentBlockSchema, ContentBlock } from './content-blocks.schema';
import { getUtf8ByteLength } from './interactive-example.schema';
import {
  HomePageHeroSectionSchema,
  HomePageFeatureItemSchema,
} from './page.schema';
import { UpdateSiteSettingsDtoSchema } from './site-settings.schema';
import { MEDIA_STATUSES } from '../constants/content.constants';

// =============================================================================
// 1. Constants & Content Block Limits
// =============================================================================

export const MAX_LESSON_CONTENT_BLOCKS = 100;
export const MAX_LESSON_BLOCKS_PAYLOAD_BYTES = 2 * 1024 * 1024; // 2 MB

export const MEDIA_TYPES = ['image', 'video', 'document'] as const;
export type MediaType = (typeof MEDIA_TYPES)[number];

export const MEDIA_VISIBILITIES = ['public', 'admin'] as const;
export type MediaVisibility = (typeof MEDIA_VISIBILITIES)[number];

export const MediaTypeSchema = z.enum(MEDIA_TYPES);
export const MediaVisibilitySchema = z.enum(MEDIA_VISIBILITIES);
export const MediaStatusSchema = z.enum(MEDIA_STATUSES);

export const AdminContentBlocksArraySchema = z
  .array(ContentBlockSchema)
  .max(
    MAX_LESSON_CONTENT_BLOCKS,
    `Lesson cannot contain more than ${MAX_LESSON_CONTENT_BLOCKS} content blocks`
  )
  .superRefine((blocks: ContentBlock[], ctx) => {
    const seenIds = new Set<string>();
    for (let i = 0; i < blocks.length; i++) {
      const id = blocks[i].id;
      if (seenIds.has(id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [i, 'id'],
          message: `Duplicate content block id "${id}" detected`,
        });
      }
      seenIds.add(id);
    }

    const totalBytes = getUtf8ByteLength(JSON.stringify(blocks));
    if (totalBytes > MAX_LESSON_BLOCKS_PAYLOAD_BYTES) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Total contentBlocks payload exceeds 2 MB limit (${totalBytes} bytes)`,
      });
    }
  });

// =============================================================================
// 2. Common Admin Query, Params & Concurrency Schemas
// =============================================================================

export const SortOrderSchema = z.enum(['asc', 'desc']).default('desc');

export const AdminPaginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  q: z.string().trim().max(150).optional(),
  sort: z.string().trim().max(50).optional(),
  order: SortOrderSchema,
});

export const ExpectedVersionBodySchema = z.object({
  expectedVersion: z.number().int().positive().optional(),
  changeSummary: z.string().trim().min(1).max(500).optional(),
});

export const CourseIdParamSchema = z.object({ courseId: ObjectIdSchema }).strict();
export const ChapterIdParamSchema = z.object({ chapterId: ObjectIdSchema }).strict();
export const LessonIdParamSchema = z.object({ lessonId: ObjectIdSchema }).strict();
export const MediaIdParamSchema = z.object({ mediaId: ObjectIdSchema }).strict();
export const PageIdParamSchema = z.object({ pageId: ObjectIdSchema }).strict();
export const UserIdParamSchema = z.object({ userId: ObjectIdSchema }).strict();
export const RevisionIdParamSchema = z.object({ revisionId: ObjectIdSchema }).strict();
export const RevisionResourceParamsSchema = z
  .object({
    resourceType: RevisionResourceTypeSchema,
    resourceId: z.string().trim().min(1).max(100),
  })
  .strict();

// =============================================================================
// 3. Admin Courses Schemas
// =============================================================================

export const AdminCourseListQuerySchema = AdminPaginationQuerySchema.extend({
  status: PublicationStatusSchema.optional(),
  level: CourseLevelSchema.optional(),
  sort: z.enum(['order', 'title', 'createdAt', 'updatedAt', 'publishedAt']).default('order'),
  order: z.enum(['asc', 'desc']).default('asc'),
});

export const AdminCreateCourseDtoSchema = z.object({
  slug: SlugSchema,
  title: z.string().trim().min(1).max(150),
  summary: z.string().trim().min(1).max(300),
  description: z.string().trim().min(1).max(5000),
  level: CourseLevelSchema,
  icon: CourseIconSchema,
  coverStorageKey: StorageKeySchema.optional(),
  tags: z.array(CourseTagSchema).max(10).default([]),
  prerequisites: z.array(z.string().trim().min(1).max(150)).max(10).default([]),
  targetAudience: z.array(z.string().trim().min(1).max(150)).max(10).default([]),
  order: z.number().int().nonnegative().default(0),
  seo: SeoMetadataSchema,
  changeSummary: z.string().trim().min(1).max(500).optional(),
});

export const AdminUpdateCourseDtoSchema = AdminCreateCourseDtoSchema.partial().extend({
  expectedVersion: z.number().int().positive(),
  changeSummary: z.string().trim().min(1).max(500).optional(),
});

export const AdminCourseDtoSchema = z.object({
  id: ObjectIdSchema,
  slug: SlugSchema,
  title: z.string(),
  summary: z.string(),
  description: z.string(),
  level: CourseLevelSchema,
  icon: CourseIconSchema,
  coverStorageKey: StorageKeySchema.optional(),
  tags: z.array(z.string()),
  prerequisites: z.array(z.string()),
  targetAudience: z.array(z.string()),
  order: z.number().int(),
  status: PublicationStatusSchema,
  version: z.number().int().positive(),
  stats: CourseStatsSchema,
  seo: SeoMetadataSchema,
  publishedAt: z.string().datetime().nullable().optional(),
  lastPublishedAt: z.string().datetime().nullable().optional(),
  archivedAt: z.string().datetime().nullable().optional(),
  createdBy: ObjectIdSchema.nullable().optional(),
  updatedBy: ObjectIdSchema.nullable().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// =============================================================================
// 4. Admin Chapters Schemas
// =============================================================================

export const AdminChapterListQuerySchema = z.object({
  status: PublicationStatusSchema.optional(),
});

export const AdminCreateChapterDtoSchema = z.object({
  title: z.string().trim().min(1).max(150),
  slug: SlugSchema,
  summary: z.string().trim().max(300).optional(),
  order: z.number().int().nonnegative().default(0),
  changeSummary: z.string().trim().min(1).max(500).optional(),
});

export const AdminUpdateChapterDtoSchema = AdminCreateChapterDtoSchema.partial().extend({
  expectedVersion: z.number().int().positive(),
  changeSummary: z.string().trim().min(1).max(500).optional(),
});

export const AdminReorderChaptersDtoSchema = z.object({
  orderedChapterIds: z.array(ObjectIdSchema).min(1).max(200),
  changeSummary: z.string().trim().min(1).max(500).optional(),
});

export const AdminChapterDtoSchema = z.object({
  id: ObjectIdSchema,
  courseId: ObjectIdSchema,
  title: z.string(),
  slug: SlugSchema,
  summary: z.string().optional(),
  order: z.number().int(),
  status: PublicationStatusSchema,
  version: z.number().int().positive(),
  publishedAt: z.string().datetime().nullable().optional(),
  archivedAt: z.string().datetime().nullable().optional(),
  createdBy: ObjectIdSchema.nullable().optional(),
  updatedBy: ObjectIdSchema.nullable().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// =============================================================================
// 5. Admin Lessons Schemas
// =============================================================================

export const AdminLessonListQuerySchema = z.object({
  status: PublicationStatusSchema.optional(),
});

export const AdminCreateLessonDtoSchema = z.object({
  title: z.string().trim().min(1).max(150),
  slug: SlugSchema,
  order: z.number().int().nonnegative().default(0),
  readingTimeMinutes: z.number().int().min(1).max(600).default(1),
  contentSchemaVersion: z.literal(1).default(1),
  contentBlocks: AdminContentBlocksArraySchema.default([]),
  seo: SeoMetadataSchema,
  changeSummary: z.string().trim().min(1).max(500).optional(),
});

export const AdminUpdateLessonDtoSchema = AdminCreateLessonDtoSchema.partial().extend({
  chapterId: ObjectIdSchema.optional(),
  expectedVersion: z.number().int().positive(),
  changeSummary: z.string().trim().min(1).max(500).optional(),
});

export const AdminReorderLessonsDtoSchema = z.object({
  orderedLessonIds: z.array(ObjectIdSchema).min(1).max(500),
  changeSummary: z.string().trim().min(1).max(500).optional(),
});

export const AdminLessonDtoSchema = z.object({
  id: ObjectIdSchema,
  courseId: ObjectIdSchema,
  chapterId: ObjectIdSchema,
  title: z.string(),
  slug: SlugSchema,
  order: z.number().int(),
  readingTimeMinutes: z.number().int(),
  contentSchemaVersion: z.literal(1),
  contentBlocks: z.array(ContentBlockSchema),
  status: PublicationStatusSchema,
  version: z.number().int().positive(),
  seo: SeoMetadataSchema,
  publishedAt: z.string().datetime().nullable().optional(),
  lastPublishedAt: z.string().datetime().nullable().optional(),
  archivedAt: z.string().datetime().nullable().optional(),
  createdBy: ObjectIdSchema.nullable().optional(),
  updatedBy: ObjectIdSchema.nullable().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// =============================================================================
// 6. Admin Media Schemas
// =============================================================================

export const AdminMediaListQuerySchema = AdminPaginationQuerySchema.extend({
  category: MediaCategorySchema.optional(),
  mediaType: MediaTypeSchema.optional(),
  status: MediaStatusSchema.optional(),
  sort: z.enum(['createdAt', 'updatedAt', 'sizeBytes', 'originalFileName']).default('createdAt'),
});

export const AdminUpdateMediaDtoSchema = z.object({
  altText: z.string().trim().max(200).optional(),
  category: MediaCategorySchema.optional(),
  visibility: MediaVisibilitySchema.optional(),
  status: MediaStatusSchema.optional(),
});

export const AdminMediaDtoSchema = z.object({
  id: ObjectIdSchema,
  storageKey: StorageKeySchema,
  safeFilename: z.string().optional(),
  originalFileName: z.string(),
  mimeType: z.string(),
  mediaType: MediaTypeSchema,
  sizeBytes: z.number().int(),
  width: z.number().int().optional(),
  height: z.number().int().optional(),
  checksumSha256: z.string().optional(),
  category: MediaCategorySchema,
  storageProvider: z.literal('local').default('local'),
  visibility: MediaVisibilitySchema.default('public'),
  status: MediaStatusSchema,
  altText: z.string().optional(),
  uploadedBy: ObjectIdSchema.nullable().optional(),
  archivedAt: z.string().datetime().nullable().optional(),
  publicUrl: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const MediaUsageItemSchema = z.object({
  resourceType: z.enum(['course', 'lesson', 'site_page', 'site_settings']),
  resourceId: z.string(),
  title: z.string(),
  slug: z.string().optional(),
  status: z.string().optional(),
  field: z.string(),
});

// =============================================================================
// 7. Admin Site Pages & Site Settings Schemas
// =============================================================================

export const AdminSitePageListQuerySchema = AdminPaginationQuerySchema.extend({
  status: PublicationStatusSchema.optional(),
  sort: z.enum(['createdAt', 'updatedAt', 'title', 'pageKey']).default('updatedAt'),
});

export const AdminCreateSitePageDtoSchema = z
  .object({
    pageKey: SlugSchema,
    title: z.string().trim().min(1).max(150),
    heroSection: HomePageHeroSectionSchema.optional(),
    features: z.array(HomePageFeatureItemSchema).min(1).max(6).optional(),
    contentBlocks: AdminContentBlocksArraySchema.default([]),
    seo: SeoMetadataSchema,
    changeSummary: z.string().trim().min(1).max(500).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.pageKey === 'home') {
      if (!data.heroSection) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['heroSection'],
          message: 'Home page requires heroSection',
        });
      }
      if (!data.features || data.features.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['features'],
          message: 'Home page requires at least 1 feature',
        });
      }
    }
  });

export const AdminUpdateSitePageDtoSchema = z.object({
  title: z.string().trim().min(1).max(150).optional(),
  heroSection: HomePageHeroSectionSchema.optional(),
  features: z.array(HomePageFeatureItemSchema).min(1).max(6).optional(),
  contentBlocks: AdminContentBlocksArraySchema.optional(),
  seo: SeoMetadataSchema.optional(),
  expectedVersion: z.number().int().positive(),
  changeSummary: z.string().trim().min(1).max(500).optional(),
});

export const AdminSitePageDtoSchema = z.object({
  id: ObjectIdSchema,
  pageKey: SlugSchema,
  title: z.string(),
  heroSection: HomePageHeroSectionSchema.optional(),
  features: z.array(HomePageFeatureItemSchema).optional(),
  contentBlocks: z.array(ContentBlockSchema).default([]),
  seo: SeoMetadataSchema,
  status: PublicationStatusSchema,
  version: z.number().int().positive(),
  publishedAt: z.string().datetime().nullable().optional(),
  archivedAt: z.string().datetime().nullable().optional(),
  createdBy: ObjectIdSchema.nullable().optional(),
  updatedBy: ObjectIdSchema.nullable().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const AdminUpdateSiteSettingsDtoSchema = UpdateSiteSettingsDtoSchema.omit({
  updatedBy: true,
})
  .extend({
    expectedVersion: z.number().int().positive().optional(),
    changeSummary: z.string().trim().min(1).max(500).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.footer?.socialLinks) {
      data.footer.socialLinks.forEach((link, idx) => {
        if (!isSafeHttpUrl(link.url)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['footer', 'socialLinks', idx, 'url'],
            message: 'Social link URL must use http or https protocol',
          });
        }
      });
    }
    const checkNav = (items: Array<{ path: string; external?: boolean }> | undefined, basePath: (string | number)[]) => {
      if (!items) return;
      items.forEach((item, idx) => {
        const lower = item.path.trim().toLowerCase();
        if (
          lower.startsWith('javascript:') ||
          lower.startsWith('data:') ||
          lower.startsWith('vbscript:')
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [...basePath, idx, 'path'],
            message: 'Navigation path contains forbidden URL scheme',
          });
        }
      });
    };
    checkNav(data.header?.navigationItems, ['header', 'navigationItems']);
    data.footer?.linkGroups?.forEach((grp, gIdx) => {
      checkNav(grp.links, ['footer', 'linkGroups', gIdx, 'links']);
    });
    if (data.header?.ctaButton?.url) {
      const lower = data.header.ctaButton.url.trim().toLowerCase();
      if (
        lower.startsWith('javascript:') ||
        lower.startsWith('data:') ||
        lower.startsWith('vbscript:')
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['header', 'ctaButton', 'url'],
          message: 'CTA URL contains forbidden URL scheme',
        });
      }
    }
  });

// =============================================================================
// 8. Admin Users, Revisions, Audit Logs & Dashboard Schemas
// =============================================================================

export const AdminUserListQuerySchema = AdminPaginationQuerySchema.extend({
  role: UserRoleSchema.optional(),
  status: AccountStatusSchema.optional(),
  sort: z.enum(['createdAt', 'updatedAt', 'lastLoginAt']).default('createdAt'),
});

export const AdminUpdateUserStatusDtoSchema = z.object({
  status: AccountStatusSchema,
  reason: z.string().trim().min(3).max(500),
});

export const AdminUpdateUserRolesDtoSchema = z.object({
  roles: z.array(UserRoleSchema).min(1).max(5),
  reason: z.string().trim().min(3).max(500),
});

export const AdminRevokeSessionsDtoSchema = z.object({
  reason: z.string().trim().min(3).max(500).default('admin_session_revocation'),
});

export const AdminUserDtoSchema = z.object({
  id: ObjectIdSchema,
  maskedPhone: z.string(),
  firstName: z.string().nullable().optional(),
  lastName: z.string().nullable().optional(),
  roles: z.array(UserRoleSchema),
  status: AccountStatusSchema,
  phoneVerifiedAt: z.string().datetime().nullable().optional(),
  lastLoginAt: z.string().datetime().nullable().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const AdminUserSessionDtoSchema = z.object({
  id: ObjectIdSchema,
  userId: ObjectIdSchema,
  issuedAt: z.string().datetime(),
  lastUsedAt: z.string().datetime(),
  expiresAt: z.string().datetime(),
  revokedAt: z.string().datetime().nullable().optional(),
  revokeReason: z.string().nullable().optional(),
  userAgent: z.string().nullable().optional(),
});

export const AdminRestoreRevisionDtoSchema = z.object({
  expectedVersion: z.number().int().positive().optional(),
  changeSummary: z.string().trim().min(1).max(500).optional(),
});

export const AdminAuditLogQuerySchema = AdminPaginationQuerySchema.extend({
  actorUserId: ObjectIdSchema.optional(),
  action: AuditActionSchema.optional(),
  resourceType: z.string().trim().max(50).optional(),
  resourceId: z.string().trim().max(100).optional(),
  result: AuditResultSchema.optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  sort: z.enum(['createdAt']).default('createdAt'),
});

export const AdminDashboardSummaryDtoSchema = z.object({
  courses: z.object({
    total: z.number().int().nonnegative(),
    published: z.number().int().nonnegative(),
    draft: z.number().int().nonnegative(),
    archived: z.number().int().nonnegative(),
  }),
  chapters: z.object({
    total: z.number().int().nonnegative(),
    published: z.number().int().nonnegative(),
    draft: z.number().int().nonnegative(),
  }),
  lessons: z.object({
    total: z.number().int().nonnegative(),
    published: z.number().int().nonnegative(),
    draft: z.number().int().nonnegative(),
  }),
  media: z.object({
    total: z.number().int().nonnegative(),
    totalBytes: z.number().int().nonnegative(),
  }),
  pages: z.object({
    total: z.number().int().nonnegative(),
    published: z.number().int().nonnegative(),
  }),
  users: z.object({
    total: z.number().int().nonnegative(),
    active: z.number().int().nonnegative(),
    admins: z.number().int().nonnegative(),
  }),
  recentAuditLogs: z.array(z.any()),
});

export type AdminCourseListQuery = z.infer<typeof AdminCourseListQuerySchema>;
export type AdminCreateCourseDto = z.input<typeof AdminCreateCourseDtoSchema>;
export type AdminUpdateCourseDto = z.input<typeof AdminUpdateCourseDtoSchema>;
export type AdminCourseDto = z.infer<typeof AdminCourseDtoSchema>;
export type AdminCreateChapterDto = z.input<typeof AdminCreateChapterDtoSchema>;
export type AdminUpdateChapterDto = z.input<typeof AdminUpdateChapterDtoSchema>;
export type AdminReorderChaptersDto = z.infer<typeof AdminReorderChaptersDtoSchema>;
export type AdminChapterDto = z.infer<typeof AdminChapterDtoSchema>;
export type AdminCreateLessonDto = z.input<typeof AdminCreateLessonDtoSchema>;
export type AdminUpdateLessonDto = z.input<typeof AdminUpdateLessonDtoSchema>;
export type AdminReorderLessonsDto = z.infer<typeof AdminReorderLessonsDtoSchema>;
export type AdminLessonDto = z.infer<typeof AdminLessonDtoSchema>;
export type AdminMediaListQuery = z.infer<typeof AdminMediaListQuerySchema>;
export type AdminUpdateMediaDto = z.input<typeof AdminUpdateMediaDtoSchema>;
export type AdminMediaDto = z.infer<typeof AdminMediaDtoSchema>;
export type MediaUsageItem = z.infer<typeof MediaUsageItemSchema>;
export type AdminSitePageListQuery = z.infer<typeof AdminSitePageListQuerySchema>;
export type AdminCreateSitePageDto = z.input<typeof AdminCreateSitePageDtoSchema>;
export type AdminUpdateSitePageDto = z.input<typeof AdminUpdateSitePageDtoSchema>;
export type AdminSitePageDto = z.infer<typeof AdminSitePageDtoSchema>;
export type AdminUpdateSiteSettingsDto = z.input<typeof AdminUpdateSiteSettingsDtoSchema>;
export type AdminUserListQuery = z.infer<typeof AdminUserListQuerySchema>;
export type AdminUpdateUserStatusDto = z.infer<typeof AdminUpdateUserStatusDtoSchema>;
export type AdminUpdateUserRolesDto = z.infer<typeof AdminUpdateUserRolesDtoSchema>;
export type AdminUserDto = z.infer<typeof AdminUserDtoSchema>;
export type AdminUserSessionDto = z.infer<typeof AdminUserSessionDtoSchema>;
export type AdminRestoreRevisionDto = z.infer<typeof AdminRestoreRevisionDtoSchema>;
export type AdminAuditLogQuery = z.infer<typeof AdminAuditLogQuerySchema>;
export type AdminDashboardSummaryDto = z.infer<typeof AdminDashboardSummaryDtoSchema>;
