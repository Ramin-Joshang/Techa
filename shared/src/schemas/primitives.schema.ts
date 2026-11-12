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

export function isSafeHttpUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('file:')
  ) {
    return false;
  }
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export const SafeHttpUrlSchema = z
  .string()
  .max(255, 'URL cannot exceed 255 characters')
  .refine(isSafeHttpUrl, 'URL must use http or https protocol');

export const SeoMetadataSchema = z.object({
  metaTitle: z.string().min(1, 'Meta title is required').max(100, 'Meta title cannot exceed 100 characters'),
  metaDescription: z.string().min(1, 'Meta description is required').max(300, 'Meta description cannot exceed 300 characters'),
  canonicalUrlOverride: SafeHttpUrlSchema.optional(),
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
  canonicalUrlOverride: SafeHttpUrlSchema.optional(),
  ogImageStorageKey: StorageKeySchema.optional(),
});

export const CourseStatsSchema = z.object({
  totalChapters: z.number().int().nonnegative().default(0),
  totalLessons: z.number().int().nonnegative().default(0),
  estimatedReadingTimeMinutes: z.number().int().nonnegative().default(0),
});

export const PhoneE164Schema = z
  .string()
  .trim()
  .regex(/^\+[1-9]\d{1,14}$/, 'Phone number must be in valid E.164 format (e.g. +989123456789)');

export const UserRoleSchema = z.enum([
  'student',
  'content_editor',
  'content_manager',
  'admin',
  'super_admin',
]);

export const AccountStatusSchema = z.enum([
  'pending_verification',
  'active',
  'suspended',
  'disabled',
]);

export const OtpPurposeSchema = z.enum([
  'registration',
  'login',
  'password_reset',
  'registration_verification',
  'passwordless_login',
  'phone_change',
]);

export const OtpStatusSchema = z.enum([
  'pending',
  'active',
  'consumed',
  'expired',
  'locked',
  'failed',
  'invalidated',
  'superseded',
  'delivery_failed',
]);

export const RevisionResourceTypeSchema = z.enum([
  'course',
  'chapter',
  'lesson',
  'site_page',
  'site_settings',
]);

export const AuditActionSchema = z.enum([
  'create',
  'update',
  'publish',
  'unpublish',
  'archive',
  'delete',
  'restore',
  'role_change',
  'login',
  'logout',
  'security_action',
  'settings_update',
]);

export const AuditResultSchema = z.enum(['success', 'failure', 'denied']);

export type CourseIcon = z.infer<typeof CourseIconSchema>;
export type SeoMetadata = z.infer<typeof SeoMetadataSchema>;

