export const COURSE_LEVELS = ['beginner', 'intermediate', 'advanced', 'all_levels'] as const;
export type CourseLevel = (typeof COURSE_LEVELS)[number];

export const PUBLICATION_STATUSES = ['draft', 'published', 'archived'] as const;
export type PublicationStatus = (typeof PUBLICATION_STATUSES)[number];

export const MEDIA_CATEGORIES = [
  'course_icon',
  'course_cover',
  'lesson_image',
  'lesson_video',
  'downloadable_asset',
  'site_asset',
] as const;
export type MediaCategory = (typeof MEDIA_CATEGORIES)[number];

export const MEDIA_STATUSES = ['uploading', 'ready', 'failed', 'archived'] as const;
export type MediaStatus = (typeof MEDIA_STATUSES)[number];

export const USER_ROLES = [
  'student',
  'content_editor',
  'content_manager',
  'admin',
  'super_admin',
] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const ACCOUNT_STATUSES = [
  'pending_verification',
  'active',
  'suspended',
  'disabled',
] as const;
export type AccountStatus = (typeof ACCOUNT_STATUSES)[number];

export const OTP_PURPOSES = [
  'registration_verification',
  'passwordless_login',
  'password_reset',
  'phone_change',
] as const;
export type OtpPurpose = (typeof OTP_PURPOSES)[number];

export const OTP_STATUSES = [
  'pending',
  'consumed',
  'expired',
  'locked',
  'failed',
  'invalidated',
] as const;
export type OtpStatus = (typeof OTP_STATUSES)[number];

export const REVISION_RESOURCE_TYPES = [
  'course',
  'chapter',
  'lesson',
  'site_page',
  'site_settings',
] as const;
export type RevisionResourceType = (typeof REVISION_RESOURCE_TYPES)[number];

export const AUDIT_ACTIONS = [
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
] as const;
export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export const AUDIT_RESULTS = ['success', 'failure', 'denied'] as const;
export type AuditResult = (typeof AUDIT_RESULTS)[number];

export const TARGET_COLLECTIONS = [
  'courses',
  'chapters',
  'lessons',
  'media_assets',
  'site_pages',
  'site_settings',
  'users',
  'auth_sessions',
  'otp_challenges',
  'content_revisions',
  'admin_audit_logs',
] as const;
export type TargetCollection = (typeof TARGET_COLLECTIONS)[number];

export const CONTENT_BLOCK_TYPES = [
  'heading',
  'paragraph',
  'richText',
  'codeBlock',
  'image',
  'video',
  'table',
  'callout',
  'quote',
  'divider',
  'downloadableFile',
  'list',
  'interactiveExample',
] as const;
export type ContentBlockType = (typeof CONTENT_BLOCK_TYPES)[number];

export const CODE_LANGUAGES = [
  'javascript',
  'typescript',
  'html',
  'css',
  'json',
  'markdown',
  'sql',
  'python',
  'bash',
  'rust',
  'go',
  'csharp',
  'php',
  'yaml',
] as const;
export type CodeLanguage = (typeof CODE_LANGUAGES)[number];

export const CALLOUT_TYPES = ['info', 'warning', 'tip', 'danger'] as const;
export type CalloutType = (typeof CALLOUT_TYPES)[number];

export const LIST_FORMATS = ['ordered', 'unordered'] as const;
export type ListFormat = (typeof LIST_FORMATS)[number];

export const INTERACTIVE_ENVIRONMENTS = ['html-css-js', 'react', 'react-tailwind'] as const;
export type InteractiveEnvironment = (typeof INTERACTIVE_ENVIRONMENTS)[number];

export const INTERACTIVE_PRESETS = [
  'preset-vanilla-v1',
  'preset-react-19-v1',
  'preset-react-tailwind-v1',
] as const;
export type InteractivePreset = (typeof INTERACTIVE_PRESETS)[number];

export const ALLOWED_PUBLIC_PAGE_ROUTES = [
  '/',
  '/courses',
  '/courses/:slug',
  '/courses/:courseSlug/lessons/:lessonSlug',
] as const;
