import { IndexDefinition, IndexOptions } from 'mongoose';
import { TargetCollection } from '@techa/shared';

export interface IndexSpecification {
  fields: IndexDefinition;
  options?: IndexOptions;
  description: string;
}

export const TARGET_INDEX_SPECIFICATIONS: Record<TargetCollection, IndexSpecification[]> = {
  courses: [
    {
      fields: { slug: 1 },
      options: { unique: true, name: 'uniq_courses_slug' },
      description: 'یکتایی شناسه پیوند یکتا (Slug) دوره',
    },
    {
      fields: { status: 1, order: 1 },
      options: { name: 'idx_courses_status_order' },
      description: 'مرتب‌سازی و فیلتر دوره‌های منتشر شده در کاتالوگ عمومی و پنل مدیریت',
    },
    {
      fields: { status: 1, tags: 1, order: 1 },
      options: { name: 'idx_courses_status_tags_order' },
      description: 'فیلتر دوره‌ها بر اساس برچسب و وضعیت انتشار',
    },
  ],
  chapters: [
    {
      fields: { courseId: 1, slug: 1 },
      options: { unique: true, name: 'uniq_chapters_courseId_slug' },
      description: 'یکتایی پیوند یکتای سرفصل در محدوده همان دوره',
    },
    {
      fields: { courseId: 1, order: 1 },
      options: { name: 'idx_chapters_courseId_order' },
      description: 'مرتب‌سازی سرفصل‌های دوره بر اساس ترتیب نمایش',
    },
  ],
  lessons: [
    {
      fields: { courseId: 1, slug: 1 },
      options: { unique: true, name: 'uniq_lessons_courseId_slug' },
      description: 'یکتایی پیوند یکتای درس در محدوده همان دوره',
    },
    {
      fields: { chapterId: 1, order: 1 },
      options: { name: 'idx_lessons_chapterId_order' },
      description: 'مرتب‌سازی درس‌های هر سرفصل بر مبنای ترتیب چینش',
    },
    {
      fields: { status: 1 },
      options: { name: 'idx_lessons_status' },
      description: 'فیلتر درس‌های عمومی و منتشر شده در صفحات مستندات',
    },
  ],
  media_assets: [
    {
      fields: { storageKey: 1 },
      options: { unique: true, name: 'uniq_media_assets_storageKey' },
      description: 'یکتایی کلید ذخیره‌سازی فایل در فضای ذخیره‌سازی',
    },
    {
      fields: { status: 1, category: 1, createdAt: -1 },
      options: { name: 'idx_media_assets_status_category_createdAt' },
      description: 'فهرست‌بندی رسانه‌ها بر اساس وضعیت، دسته‌بندی و تاریخ',
    },
    {
      fields: { uploadedBy: 1, createdAt: -1 },
      options: { name: 'idx_media_assets_uploadedBy_createdAt' },
      description: 'فهرست رسانه‌های آپلود شده توسط کاربر',
    },
    {
      fields: { checksumSha256: 1 },
      options: { name: 'idx_media_assets_checksumSha256' },
      description: 'جستجو و بررسی یکپارچگی فایل با SHA-256',
    },
  ],
  site_pages: [
    {
      fields: { pageKey: 1 },
      options: { unique: true, name: 'uniq_site_pages_pageKey' },
      description: 'یکتایی شناسه صفحات مستقل سایت',
    },
    {
      fields: { status: 1 },
      options: { name: 'idx_site_pages_status' },
      description: 'فیلتر صفحات با وضعیت انتشار فعال',
    },
  ],
  site_settings: [
    {
      fields: { settingsKey: 1 },
      options: { unique: true, name: 'uniq_site_settings_settingsKey' },
      description: 'یکتایی کلید تنظیمات کلی (تضمین سند تکین global)',
    },
  ],
  users: [
    {
      fields: { phoneE164: 1 },
      options: { unique: true, name: 'uniq_users_phoneE164' },
      description: 'یکتایی شماره موبایل کاربر مطابق فرمت استاندارد بین‌المللی E.164',
    },
    {
      fields: { status: 1, roles: 1 },
      options: { name: 'idx_users_status_roles' },
      description: 'جستجو و کنترل دسترسی بر اساس وضعیت حساب کاربری و نقش‌ها',
    },
  ],
  auth_sessions: [
    {
      fields: { tokenHash: 1 },
      options: { unique: true, name: 'uniq_auth_sessions_tokenHash' },
      description: 'یکتایی هش توکن رفرش برای جلوگیری از استفاده تکراری',
    },
    {
      fields: { userId: 1, expiresAt: 1 },
      options: { name: 'idx_auth_sessions_userId_expiresAt' },
      description: 'بررسی نشست‌های فعال کاربر و ابطال دسته‌جمعی',
    },
    {
      fields: { familyId: 1 },
      options: { name: 'idx_auth_sessions_familyId' },
      description: 'شناسایی و ابطال زنجیره رفرش توکن در صورت تشخیص سرقت یا Replay Attack',
    },
    {
      fields: { expiresAt: 1 },
      options: { expireAfterSeconds: 0, name: 'ttl_auth_sessions_expiresAt' },
      description: 'شاخص انقضای خودکار (TTL Index) برای پاکسازی نشست‌های منقضی‌شده',
    },
  ],
  otp_challenges: [
    {
      fields: { phoneE164: 1, purpose: 1, status: 1, createdAt: -1 },
      options: { name: 'idx_otp_challenges_lookup' },
      description: 'جستجوی سریع آخرین چالش فعال رمز یکبارمصرف کاربر',
    },
    {
      fields: { expiresAt: 1 },
      options: { expireAfterSeconds: 0, name: 'ttl_otp_challenges_expiresAt' },
      description: 'شاخص انقضای خودکار (TTL Index) برای حذف چالش‌های منقضی پس از پایان مهلت',
    },
  ],
  content_revisions: [
    {
      fields: { resourceType: 1, resourceId: 1, revisionNumber: 1 },
      options: { unique: true, name: 'uniq_content_revisions_version' },
      description: 'یکتایی شماره نسخه برای هر موجودیت محتوایی مستقل',
    },
    {
      fields: { resourceId: 1, createdAt: -1 },
      options: { name: 'idx_content_revisions_history' },
      description: 'بازیابی تاریخچه تغییرات موجودیت به ترتیب نزولی زمان',
    },
  ],
  admin_audit_logs: [
    {
      fields: { actorUserId: 1, createdAt: -1 },
      options: { name: 'idx_admin_audit_logs_actor' },
      description: 'ردیابی تاریخچه فعالیت‌های انجام‌شده توسط مدیر مشخص',
    },
    {
      fields: { resourceType: 1, resourceId: 1, createdAt: -1 },
      options: { name: 'idx_admin_audit_logs_resource' },
      description: 'مشاهده سابقه کلیه تغییرات اعمال‌شده بر روی یک منبع خاص',
    },
    {
      fields: { createdAt: -1 },
      options: { name: 'idx_admin_audit_logs_timeline' },
      description: 'فهرست‌بندی زمانی وقایع امنیتی و مدیریتی سیستم',
    },
  ],
};
