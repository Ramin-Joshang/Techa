import {
  AccountStatus,
  AuditAction,
  AuditResult,
  ContentBlock,
  ContentBlockType,
  CourseLevel,
  MediaCategory,
  MediaStatus,
  MediaType,
  PublicationStatus,
  RevisionResourceType,
  UserRole,
} from '@techa/shared';

export const PUBLICATION_STATUS_LABELS: Record<PublicationStatus, string> = {
  draft: 'پیش‌نویس',
  published: 'منتشر شده',
  archived: 'بایگانی شده',
};

export const COURSE_LEVEL_LABELS: Record<CourseLevel, string> = {
  beginner: 'مقدماتی',
  intermediate: 'متوسط',
  advanced: 'پیشرفته',
  all_levels: 'همه سطوح',
};

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  student: 'دانشجو',
  content_editor: 'ویرایشگر محتوا',
  content_manager: 'مدیر محتوا',
  admin: 'مدیر پلتفرم',
  super_admin: 'مدیر ارشد سیستم',
};

export const ACCOUNT_STATUS_LABELS: Record<AccountStatus, string> = {
  pending_verification: 'در انتظار تأیید',
  active: 'فعال',
  suspended: 'معلق',
  disabled: 'غیرفعال',
};

export const MEDIA_CATEGORY_LABELS: Record<MediaCategory, string> = {
  course_icon: 'آیکون دوره',
  course_cover: 'کاور دوره',
  lesson_image: 'تصویر درس',
  lesson_video: 'ویدیوی درس',
  downloadable_asset: 'فایل قابل دانلود',
  site_asset: 'دارایی عمومی سایت',
};

export const MEDIA_TYPE_LABELS: Record<MediaType, string> = {
  image: 'تصویر',
  video: 'ویدیو',
  document: 'سند / فایل',
};

export const MEDIA_STATUS_LABELS: Record<MediaStatus, string> = {
  uploading: 'در حال آپلود',
  ready: 'آماده',
  failed: 'ناموفق',
  archived: 'بایگانی شده',
};

export const REVISION_RESOURCE_LABELS: Record<RevisionResourceType, string> = {
  course: 'دوره',
  chapter: 'فصل',
  lesson: 'درس',
  site_page: 'صفحه سایت',
  site_settings: 'تنظیمات سایت',
};

export const AUDIT_ACTION_LABELS: Record<AuditAction, string> = {
  create: 'ایجاد',
  update: 'ویرایش',
  publish: 'انتشار',
  unpublish: 'لغو انتشار',
  archive: 'بایگانی',
  delete: 'حذف',
  restore: 'بازگردانی نسخه',
  role_change: 'تغییر نقش',
  login: 'ورود',
  logout: 'خروج',
  security_action: 'عملیات امنیتی',
  settings_update: 'به‌روزرسانی تنظیمات',
};

export const AUDIT_RESULT_LABELS: Record<AuditResult, string> = {
  success: 'موفق',
  failure: 'ناموفق',
  denied: 'غیرمجاز',
};

export const CONTENT_BLOCK_LABELS: Record<ContentBlockType, string> = {
  heading: 'تیتر (Heading)',
  paragraph: 'پاراگراف (Paragraph)',
  richText: 'متن غنی (Rich Text)',
  codeBlock: 'بلوک کد (Code Block)',
  image: 'تصویر (Image)',
  video: 'ویدیو (Video)',
  table: 'جدول (Table)',
  callout: 'جعبه هشدار / نکته (Callout)',
  quote: 'نقل‌قول (Quote)',
  divider: 'خط جداکننده (Divider)',
  downloadableFile: 'فایل دانلودی (Downloadable)',
  list: 'فهرست (List)',
  interactiveExample: 'مثال تعاملی زنده (Sandbox)',
};

export function formatPersianNumber(value: number | null | undefined): string {
  if (typeof value !== 'number' || Number.isNaN(value)) return '۰';
  return new Intl.NumberFormat('fa-IR').format(value);
}

export function formatBytes(bytes: number | null | undefined): string {
  if (typeof bytes !== 'number' || Number.isNaN(bytes) || bytes <= 0) {
    return '0 B';
  }
  const units = ['B', 'KB', 'MB', 'GB'];
  let idx = 0;
  let num = bytes;
  while (num >= 1024 && idx < units.length - 1) {
    num /= 1024;
    idx++;
  }
  const formatted = idx === 0 ? `${Math.round(num)}` : num.toFixed(1);
  return `${formatted} ${units[idx]}`;
}

export function formatPersianDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  try {
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return iso;
  }
}

export function formatPersianDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  try {
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  } catch {
    return iso;
  }
}

/**
 * Generates a unique block ID matching ^blk_[a-zA-Z0-9_-]{8,32}$
 */
export function generateBlockId(): string {
  const randomPart =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID().replace(/-/g, '').slice(0, 14)
      : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
  return `blk_${randomPart}`;
}

/**
 * Converts English/mixed input into a clean lowercase kebab-case slug.
 */
export function toSafeSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100);
}

/**
 * Validates that a post-login return URL stays strictly within /admin/*
 * and blocks open redirects (//evil.com, http://evil.com, javascript:, etc.).
 */
export function sanitizeAdminReturnPath(candidate: string | null | undefined): string {
  if (!candidate || typeof candidate !== 'string') {
    return '/admin';
  }
  const trimmed = candidate.trim();
  if (!trimmed.startsWith('/admin') || trimmed.startsWith('//') || trimmed.includes('\\')) {
    return '/admin';
  }
  if (trimmed === '/admin/login' || trimmed.startsWith('/admin/login?')) {
    return '/admin';
  }
  return trimmed;
}

/**
 * Resolves a CMS media storageKey into a renderable URL for admin preview.
 * Uploaded assets live under "media/..." and are served via /api/v1/public/media/...
 */
export function resolvePreviewMediaUrl(storageKey: string | undefined): string | undefined {
  if (!storageKey) return undefined;
  if (
    storageKey.startsWith('http://') ||
    storageKey.startsWith('https://') ||
    storageKey.startsWith('/')
  ) {
    return storageKey;
  }
  if (storageKey.startsWith('media/')) {
    return `/api/v1/public/media/${storageKey}`;
  }
  return storageKey;
}

/**
 * Transforms contentBlocks for Admin live preview so uploaded media storageKeys
 * resolve to /api/v1/public/media/... while preserving ContentBlocksRenderer's phase-1 behavior.
 */
export function prepareBlocksForPreview(blocks: ContentBlock[]): ContentBlock[] {
  return blocks.map((block) => {
    if (block.type === 'image') {
      const resolved = resolvePreviewMediaUrl(block.data.storageKey) || block.data.storageKey;
      if (resolved !== block.data.storageKey) {
        return { ...block, data: { ...block.data, storageKey: resolved } };
      }
    }
    if (block.type === 'video') {
      const resolved = resolvePreviewMediaUrl(block.data.storageKey) || block.data.storageKey;
      if (resolved !== block.data.storageKey) {
        return { ...block, data: { ...block.data, storageKey: resolved } };
      }
    }
    return block;
  });
}

export interface RevisionFieldDiff {
  key: string;
  status: 'added' | 'removed' | 'changed' | 'unchanged';
  beforeValue: unknown;
  afterValue: unknown;
}

const IGNORED_DIFF_KEYS = new Set(['_id', '__v', 'createdAt', 'updatedAt', 'updatedBy', 'createdBy']);

/**
 * Computes deterministic top-level snapshot differences between two revisions.
 */
export function diffRevisionSnapshots(
  older: Record<string, unknown> | null | undefined,
  newer: Record<string, unknown> | null | undefined
): RevisionFieldDiff[] {
  const left = older || {};
  const right = newer || {};
  const keys = Array.from(new Set([...Object.keys(left), ...Object.keys(right)])).filter(
    (k) => !IGNORED_DIFF_KEYS.has(k)
  );

  return keys.map((key) => {
    const hasLeft = key in left && left[key] !== undefined;
    const hasRight = key in right && right[key] !== undefined;
    const leftVal = left[key];
    const rightVal = right[key];

    if (!hasLeft && hasRight) {
      return { key, status: 'added', beforeValue: undefined, afterValue: rightVal };
    }
    if (hasLeft && !hasRight) {
      return { key, status: 'removed', beforeValue: leftVal, afterValue: undefined };
    }
    const same = JSON.stringify(leftVal) === JSON.stringify(rightVal);
    return {
      key,
      status: same ? 'unchanged' : 'changed',
      beforeValue: leftVal,
      afterValue: rightVal,
    };
  });
}
