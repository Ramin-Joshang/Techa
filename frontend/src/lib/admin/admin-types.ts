import {
  AccountStatus,
  AdminChapterDto,
  AdminCourseDto,
  AdminDashboardSummaryDto,
  AdminLessonDto,
  AdminMediaDto,
  AdminSitePageDto,
  AdminUserDto,
  AdminUserSessionDto,
  AuditAction,
  AuditResult,
  ContentBlock,
  CourseLevel,
  MediaCategory,
  MediaStatus,
  MediaType,
  MediaUsageItem,
  MediaVisibility,
  PublicationStatus,
  ReadinessResponse,
  RevisionResourceType,
  SiteSettings,
  UserRole,
} from '@techa/shared';

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}

export interface AdminCourseOutlineItem {
  id: string;
  title: string;
  slug: string;
  order: number;
  status: PublicationStatus;
  lessons: Array<{
    id: string;
    title: string;
    slug: string;
    order: number;
    status: PublicationStatus;
    readingTimeMinutes: number;
  }>;
}

export interface AdminCoursePreviewDto {
  previewMode: boolean;
  course: AdminCourseDto;
  outline: AdminCourseOutlineItem[];
}

export interface AdminLessonPreviewDto {
  previewMode: boolean;
  lesson: AdminLessonDto;
  parentCourse: {
    id: string;
    title: string;
    slug: string;
    status: PublicationStatus;
  } | null;
  parentChapter: {
    id: string;
    title: string;
    slug: string;
    status: PublicationStatus;
  } | null;
}

export interface AdminCourseStatsDetailDto {
  totalChapters: number;
  totalLessons: number;
  publishedChapters: number;
  publishedLessons: number;
  estimatedReadingTimeMinutes: number;
}

export interface AdminAuditLogDto {
  id: string;
  actorUserId: string | null;
  actorRole: UserRole;
  action: AuditAction;
  resourceType: string;
  resourceId: string;
  result: AuditResult;
  requestId: string;
  changedFields: string[];
  changeSummary: string;
  createdAt: string;
}

export interface AdminContentRevisionDto {
  id: string;
  resourceType: RevisionResourceType;
  resourceId: string;
  revisionNumber: number;
  changeSummary: string;
  contentHash: string;
  snapshot: Record<string, unknown>;
  createdBy: string | null;
  createdAt: string;
}

export interface AdminSiteSettingsDto extends SiteSettings {
  id: string;
  version: number;
}

export interface AdminUserDetailDto {
  user: AdminUserDto;
  activeSessionsCount: number;
}

export interface AdminMediaUploadResponse {
  media: AdminMediaDto;
}

export type {
  AccountStatus,
  AdminChapterDto,
  AdminCourseDto,
  AdminDashboardSummaryDto,
  AdminLessonDto,
  AdminMediaDto,
  AdminSitePageDto,
  AdminUserDto,
  AdminUserSessionDto,
  AuditAction,
  AuditResult,
  ContentBlock,
  CourseLevel,
  MediaCategory,
  MediaStatus,
  MediaType,
  MediaUsageItem,
  MediaVisibility,
  PublicationStatus,
  ReadinessResponse,
  RevisionResourceType,
  SiteSettings,
  UserRole,
};
