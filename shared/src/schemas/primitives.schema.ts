import { z } from 'zod';
import {
  COURSE_LEVELS,
  PUBLICATION_STATUSES,
  MEDIA_CATEGORIES,
} from '../constants/content.constants';

export const ObjectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ObjectId format');

export const SlugSchema = z
  .string()
  .min(1, 'Slug cannot be empty')
  .max(100, 'Slug cannot exceed 100 characters')
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    'Slug must consist of lowercase alphanumeric words separated by single hyphens'
  );

export const StorageKeySchema = z
  .string()
  .min(3, 'Storage key must be at least 3 characters')
  .max(200, 'Storage key cannot exceed 200 characters')
  .superRefine((val, ctx) => {
    if (val.includes('\0')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Storage key contains forbidden null bytes',
      });
      return;
    }
    if (val.includes('\\')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Storage key must use forward slashes only',
      });
      return;
    }
    if (val.startsWith('/')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Storage key cannot start with a leading slash',
      });
      return;
    }
    if (val.endsWith('/')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Storage key cannot end with a trailing slash',
      });
      return;
    }

    const segments = val.split('/');
    for (const segment of segments) {
      if (segment.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Storage key cannot contain empty path segments',
        });
        return;
      }
      if (segment === '.' || segment === '..') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Storage key cannot contain relative traversal segments',
        });
        return;
      }
      if (!/^[a-zA-Z0-9_\-.]+$/.test(segment)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Storage key segment "${segment}" contains invalid characters`,
        });
        return;
      }
    }
  });

export const SystemIconSchema = z.object({
  kind: z.literal('system'),
  name: z
    .string()
    .min(1, 'System icon name is required')
    .max(100, 'System icon name cannot exceed 100 characters')
    .regex(/^[a-z0-9-]+:[a-z0-9-]+$/, 'System icon must follow format "pack:icon-name" (e.g. "lucide:code-2")'),
});

export const MediaIconSchema = z.object({
  kind: z.literal('media'),
  storageKey: StorageKeySchema,
});

export const CourseIconSchema = z.discriminatedUnion('kind', [
  SystemIconSchema,
  MediaIconSchema,
]);

export const CourseLevelSchema = z.enum(COURSE_LEVELS);
export const PublicationStatusSchema = z.enum(PUBLICATION_STATUSES);
export const MediaCategorySchema = z.enum(MEDIA_CATEGORIES);

export const SeoMetadataSchema = z.object({
  metaTitle: z.string().min(1, 'Meta title is required').max(100, 'Meta title cannot exceed 100 characters'),
  metaDescription: z.string().min(1, 'Meta description is required').max(300, 'Meta description cannot exceed 300 characters'),
  canonicalUrlOverride: z.string().url('Canonical URL must be a valid URL').max(255).optional(),
  ogImageStorageKey: StorageKeySchema.optional(),
});

export const PublishedSeoMetadataSchema = z.object({
  metaTitle: z
    .string()
    .min(5, 'Published meta title must be at least 5 characters')
    .max(70, 'Published meta title cannot exceed 70 characters'),
  metaDescription: z
    .string()
    .min(10, 'Published meta description must be at least 10 characters')
    .max(160, 'Published meta description cannot exceed 160 characters'),
  canonicalUrlOverride: z.string().url('Canonical URL must be a valid URL').max(255).optional(),
  ogImageStorageKey: StorageKeySchema.optional(),
});

export const CourseStatsSchema = z.object({
  totalChapters: z.number().int().nonnegative().default(0),
  totalLessons: z.number().int().nonnegative().default(0),
  estimatedReadingTimeMinutes: z.number().int().nonnegative().default(0),
});
