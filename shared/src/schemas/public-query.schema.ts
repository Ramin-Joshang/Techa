import { z } from 'zod';
import {
  SlugSchema,
  ObjectIdSchema,
  CourseLevelSchema,
  CourseStatsSchema,
  SeoMetadataSchema,
} from './primitives.schema';
import { CourseTagSchema, CoursePublicDtoSchema } from './course.schema';
import { ContentBlockSchema } from './content-blocks.schema';
import { HomePageHeroSectionSchema, HomePageFeatureItemSchema } from './page.schema';

export const CourseListSortSchema = z.enum(['order', 'title', 'recentlyUpdated']);

export const CourseListQuerySchema = z
  .object({
    page: z.coerce.number().int().positive('Page must be a positive integer').default(1),
    limit: z.coerce.number().int().positive('Limit must be a positive integer').max(50, 'Limit cannot exceed 50').default(20),
    level: CourseLevelSchema.optional(),
    tag: CourseTagSchema.optional(),
    q: z.string().min(1).max(100).optional(),
    sort: CourseListSortSchema.default('order'),
  })
  .strict();

export const CourseSlugParamSchema = z
  .object({
    courseSlug: SlugSchema,
  })
  .strict();

export const LessonSlugParamsSchema = z
  .object({
    courseSlug: SlugSchema,
    lessonSlug: SlugSchema,
  })
  .strict();

export const PageKeyParamSchema = z
  .object({
    pageKey: SlugSchema,
  })
  .strict();

export const LessonOutlineItemDtoSchema = z.object({
  id: ObjectIdSchema,
  title: z.string(),
  slug: SlugSchema,
  order: z.number().int(),
  readingTimeMinutes: z.number().int(),
});

export const ChapterOutlinePublicDtoSchema = z.object({
  id: ObjectIdSchema,
  title: z.string(),
  slug: SlugSchema,
  summary: z.string().optional(),
  order: z.number().int(),
  lessons: z.array(LessonOutlineItemDtoSchema),
});

export const CourseOutlinePublicDtoSchema = z.object({
  course: z.object({
    id: ObjectIdSchema,
    slug: SlugSchema,
    title: z.string(),
    stats: CourseStatsSchema,
  }),
  chapters: z.array(ChapterOutlinePublicDtoSchema),
});

export const SearchQuerySchema = z
  .object({
    q: z
      .string()
      .min(2, 'Search query must be at least 2 characters')
      .max(100, 'Search query cannot exceed 100 characters'),
    type: z.enum(['all', 'courses', 'lessons']).default('all'),
    limit: z.coerce.number().int().positive().max(20).default(10),
  })
  .strict();

export const SearchResultItemDtoSchema = z.object({
  id: z.string(),
  type: z.enum(['course', 'lesson']),
  title: z.string(),
  summary: z.string(),
  courseSlug: z.string(),
  lessonSlug: z.string().optional(),
  url: z.string(),
});

export const SearchResultDtoSchema = z.object({
  query: z.string(),
  type: z.enum(['all', 'courses', 'lessons']),
  total: z.number().int().nonnegative(),
  results: z.array(SearchResultItemDtoSchema),
});

export const PublicSitePageDtoSchema = z.object({
  pageKey: z.string(),
  title: z.string(),
  contentBlocks: z.array(ContentBlockSchema).default([]),
  seo: SeoMetadataSchema.optional(),
  publishedAt: z.string().datetime().nullable().optional(),
});

export const PublicPlatformStatsSchema = z.object({
  totalCourses: z.number().int().nonnegative().default(0),
  totalChapters: z.number().int().nonnegative().default(0),
  totalLessons: z.number().int().nonnegative().default(0),
  totalReadingTimeMinutes: z.number().int().nonnegative().default(0),
});

export const HomePublicDtoSchema = z.object({
  pageKey: z.literal('home').default('home'),
  title: z.string(),
  branding: z
    .object({
      siteName: z.string(),
      siteDescription: z.string(),
      logoMediaKey: z.string().optional(),
      faviconMediaKey: z.string().optional(),
    })
    .optional(),
  heroSection: HomePageHeroSectionSchema,
  features: z.array(HomePageFeatureItemSchema).default([]),
  featuredCourses: z.array(CoursePublicDtoSchema).default([]),
  statistics: PublicPlatformStatsSchema,
  footer: z
    .object({
      description: z.string().optional(),
      copyright: z.string().optional(),
      socialLinks: z
        .array(
          z.object({
            platform: z.string(),
            url: z.string(),
            label: z.string(),
          })
        )
        .optional(),
      navigationItems: z
        .array(
          z.object({
            id: z.string(),
            label: z.string(),
            path: z.string(),
            external: z.boolean().default(false),
            order: z.number().default(0),
          })
        )
        .optional(),
    })
    .optional(),
  seo: SeoMetadataSchema,
});

export type CourseListQuery = z.infer<typeof CourseListQuerySchema>;
export type CourseSlugParam = z.infer<typeof CourseSlugParamSchema>;
export type LessonSlugParams = z.infer<typeof LessonSlugParamsSchema>;
export type PageKeyParam = z.infer<typeof PageKeyParamSchema>;
export type LessonOutlineItemDto = z.infer<typeof LessonOutlineItemDtoSchema>;
export type ChapterOutlinePublicDto = z.infer<typeof ChapterOutlinePublicDtoSchema>;
export type CourseOutlinePublicDto = z.infer<typeof CourseOutlinePublicDtoSchema>;
export type SearchQuery = z.infer<typeof SearchQuerySchema>;
export type SearchResultItemDto = z.infer<typeof SearchResultItemDtoSchema>;
export type SearchResultDto = z.infer<typeof SearchResultDtoSchema>;
export type PublicSitePageDto = z.infer<typeof PublicSitePageDtoSchema>;
export type PublicPlatformStats = z.infer<typeof PublicPlatformStatsSchema>;
export type HomePublicDto = z.infer<typeof HomePublicDtoSchema>;
