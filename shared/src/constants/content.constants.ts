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
] as const;
export type MediaCategory = (typeof MEDIA_CATEGORIES)[number];

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
