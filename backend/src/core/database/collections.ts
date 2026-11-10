import { Model } from 'mongoose';
import {
  TARGET_COLLECTIONS,
  TargetCollection,
} from '@techa/shared';
import {
  CourseModel,
  ChapterModel,
  LessonModel,
  MediaAssetModel,
  SitePageModel,
  SiteSettingsModel,
  UserModel,
  AuthSessionModel,
  OtpChallengeModel,
  ContentRevisionModel,
  AdminAuditLogModel,
} from '../../models';

export { TARGET_COLLECTIONS, TargetCollection };

export interface CollectionMetadata {
  name: TargetCollection;
  description: string;
  model: Model<any>;
  isCmsManaged: boolean;
  hasTtlIndex: boolean;
}

export const TARGET_COLLECTION_REGISTRY: Record<TargetCollection, CollectionMetadata> = {
  courses: {
    name: 'courses',
    description: 'دسوره‌ها و پکیج‌های آموزشی با متادیتا و قیمت‌گذاری',
    model: CourseModel,
    isCmsManaged: true,
    hasTtlIndex: false,
  },
  chapters: {
    name: 'chapters',
    description: 'سرفصل‌ها و فصول مرتبط با هر دوره',
    model: ChapterModel,
    isCmsManaged: true,
    hasTtlIndex: false,
  },
  lessons: {
    name: 'lessons',
    description: 'درس‌ها، جلسات آموزشی و بلوک‌های محتوایی استاندارد',
    model: LessonModel,
    isCmsManaged: true,
    hasTtlIndex: false,
  },
  media_assets: {
    name: 'media_assets',
    description: 'فایل‌های رسانه‌ای، تصاویر و مستندات ذخیره‌شده در فضای ابری/S3',
    model: MediaAssetModel,
    isCmsManaged: true,
    hasTtlIndex: false,
  },
  site_pages: {
    name: 'site_pages',
    description: 'صفحات مستقل سایت با موتور رندر بلوک‌های محتوایی',
    model: SitePageModel,
    isCmsManaged: true,
    hasTtlIndex: false,
  },
  site_settings: {
    name: 'site_settings',
    description: 'تنظیمات کلی سیستم، هدر، فوتر و متادیتا (سند تکین Global)',
    model: SiteSettingsModel,
    isCmsManaged: true,
    hasTtlIndex: false,
  },
  users: {
    name: 'users',
    description: 'حساب‌های کاربری بر مبنای شماره موبایل E.164 و نقش‌های سیستم',
    model: UserModel,
    isCmsManaged: false,
    hasTtlIndex: false,
  },
  auth_sessions: {
    name: 'auth_sessions',
    description: 'نشست‌های احراز هویت توکن‌های رفرش با قابلیت ابطال و انقضای خودکار',
    model: AuthSessionModel,
    isCmsManaged: false,
    hasTtlIndex: true,
  },
  otp_challenges: {
    name: 'otp_challenges',
    description: 'درخواست‌های رمز یکبارمصرف با کدهای هش‌شده و انقضای TTL',
    model: OtpChallengeModel,
    isCmsManaged: false,
    hasTtlIndex: true,
  },
  content_revisions: {
    name: 'content_revisions',
    description: 'تاریخچه تغییرات و نسخه‌بندی محتوا با اسنپ‌شات قطعی JSON',
    model: ContentRevisionModel,
    isCmsManaged: false,
    hasTtlIndex: false,
  },
  admin_audit_logs: {
    name: 'admin_audit_logs',
    description: 'لاگ وقایع امنیتی و تغییرات مدیریتی به صورت غیرقابل تغییر (Append-Only)',
    model: AdminAuditLogModel,
    isCmsManaged: false,
    hasTtlIndex: false,
  },
};
