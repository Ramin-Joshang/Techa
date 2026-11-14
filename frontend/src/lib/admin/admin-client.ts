import {
  AdminCreateChapterDto,
  AdminCreateCourseDto,
  AdminCreateLessonDto,
  AdminCreateSitePageDto,
  AdminReorderChaptersDto,
  AdminReorderLessonsDto,
  AdminRestoreRevisionDto,
  AdminUpdateChapterDto,
  AdminUpdateCourseDto,
  AdminUpdateLessonDto,
  AdminUpdateMediaDto,
  AdminUpdateSitePageDto,
  AdminUpdateSiteSettingsDto,
  AdminUpdateUserRolesDto,
  AdminUpdateUserStatusDto,
  AuthUser,
  LoginRequest,
  MediaCategory,
  MediaVisibility,
  OtpChallengeResponse,
  RevisionResourceType,
} from '@techa/shared';
import {
  AdminAuditLogDto,
  AdminChapterDto,
  AdminContentRevisionDto,
  AdminCourseDto,
  AdminCourseOutlineItem,
  AdminCoursePreviewDto,
  AdminCourseStatsDetailDto,
  AdminDashboardSummaryDto,
  AdminLessonDto,
  AdminLessonPreviewDto,
  AdminMediaDto,
  AdminSitePageDto,
  AdminSiteSettingsDto,
  AdminUserDetailDto,
  AdminUserDto,
  AdminUserSessionDto,
  MediaUsageItem,
  PaginatedResponse,
  PaginationMeta,
  ReadinessResponse,
} from './admin-types';

export class AdminApiError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = 'AdminApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }

  public isUnauthorized(): boolean {
    return this.status === 401;
  }

  public isForbidden(): boolean {
    return this.status === 403;
  }

  public isConflict(): boolean {
    return this.status === 409;
  }

  public isValidationError(): boolean {
    return this.status === 400 || this.status === 422;
  }
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(^|;\\s*)(${name})=([^;]*)`));
  return match ? decodeURIComponent(match[3]) : null;
}

const DEFAULT_PAGINATION: PaginationMeta = {
  page: 1,
  limit: 20,
  totalItems: 0,
  totalPages: 1,
  hasNextPage: false,
  hasPreviousPage: false,
};

let inflightRefreshPromise: Promise<boolean> | null = null;
let inflightCsrfPromise: Promise<string> | null = null;

async function ensureCsrfToken(): Promise<string | null> {
  const existing = getCookie('techa_csrf');
  if (existing) return existing;

  if (!inflightCsrfPromise) {
    inflightCsrfPromise = (async () => {
      try {
        const res = await fetch('/api/v1/auth/csrf', {
          method: 'GET',
          credentials: 'include',
        });
        const body = await res.json().catch(() => null);
        return (body?.data?.csrfToken as string) || getCookie('techa_csrf') || '';
      } catch {
        return '';
      } finally {
        inflightCsrfPromise = null;
      }
    })();
  }

  const token = await inflightCsrfPromise;
  return token || null;
}

async function refreshSessionSingleFlight(): Promise<boolean> {
  if (!inflightRefreshPromise) {
    inflightRefreshPromise = (async () => {
      try {
        const csrfToken = await ensureCsrfToken();
        const headers = new Headers();
        if (csrfToken) {
          headers.set('x-csrf-token', csrfToken);
        }
        const res = await fetch('/api/v1/auth/refresh', {
          method: 'POST',
          credentials: 'include',
          headers,
        });
        return res.ok;
      } catch {
        return false;
      } finally {
        inflightRefreshPromise = null;
      }
    })();
  }
  return inflightRefreshPromise;
}

function buildQueryString(params: Record<string, string | number | boolean | undefined | null>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') {
      sp.set(k, String(v));
    }
  }
  const qs = sp.toString();
  return qs ? `?${qs}` : '';
}

interface InternalRequestOptions extends RequestInit {
  skipRefresh?: boolean;
}

async function rawAdminRequest<T>(
  path: string,
  options: InternalRequestOptions = {},
  attempt = 0
): Promise<{ data: T; meta?: { pagination?: PaginationMeta }; message?: string }> {
  const method = (options.method || 'GET').toUpperCase();
  const headers = new Headers(options.headers || {});
  const isWriteMethod = ['POST', 'PATCH', 'PUT', 'DELETE'].includes(method);

  if (options.body && typeof options.body === 'string' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (isWriteMethod) {
    const csrfToken = await ensureCsrfToken();
    if (csrfToken) {
      headers.set('x-csrf-token', csrfToken);
    }
  }

  let response: Response;
  try {
    response = await fetch(path, {
      ...options,
      method,
      headers,
      credentials: 'include',
      cache: 'no-store',
    });
  } catch {
    throw new AdminApiError(
      0,
      'NETWORK_ERROR',
      'امکان برقراری ارتباط با سرور وجود ندارد. اتصال شبکه یا وضعیت سرویس را بررسی کنید.'
    );
  }

  if (response.status === 401 && attempt === 0 && !options.skipRefresh) {
    const refreshed = await refreshSessionSingleFlight();
    if (refreshed) {
      return rawAdminRequest<T>(path, options, 1);
    }
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const errObj = payload?.error || {};
    const status = response.status;
    const code = typeof errObj.code === 'string' ? errObj.code : `HTTP_${status}`;
    const fallbackMessage =
      status === 401
        ? 'نشست کاربری شما منقضی شده یا وارد نشده‌اید.'
        : status === 403
          ? 'شما دسترسی لازم برای انجام این عملیات را ندارید.'
          : status === 409
            ? 'این منبع همزمان تغییر کرده است یا تداخل وجود دارد.'
            : `خطای سرور (${status})`;
    const message =
      typeof errObj.message === 'string' && errObj.message.trim().length > 0
        ? errObj.message
        : fallbackMessage;

    throw new AdminApiError(status, code, message, errObj.details);
  }

  return {
    data: payload?.data as T,
    meta: payload?.meta,
    message: payload?.message,
  };
}

async function requestData<T>(path: string, options?: InternalRequestOptions): Promise<T> {
  const res = await rawAdminRequest<T>(path, options);
  return res.data;
}

async function requestPaginated<T>(
  path: string,
  options?: InternalRequestOptions
): Promise<PaginatedResponse<T>> {
  const res = await rawAdminRequest<T[]>(path, options);
  return {
    items: Array.isArray(res.data) ? res.data : [],
    pagination: res.meta?.pagination || DEFAULT_PAGINATION,
  };
}

export interface UploadMediaOptions {
  file: File;
  category: MediaCategory;
  visibility?: MediaVisibility;
  altText?: string;
  onProgress?: (percent: number) => void;
}

function sendMediaXhr(
  options: UploadMediaOptions,
  csrfToken: string | null
): Promise<AdminMediaDto> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/v1/admin/media/upload', true);
    xhr.withCredentials = true;

    if (csrfToken) {
      xhr.setRequestHeader('x-csrf-token', csrfToken);
    }

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && options.onProgress) {
        const percent = Math.min(100, Math.round((event.loaded / event.total) * 100));
        options.onProgress(percent);
      }
    };

    xhr.onerror = () => {
      reject(
        new AdminApiError(
          0,
          'NETWORK_ERROR',
          'خطای شبکه هنگام بارگذاری فایل رخ داد.'
        )
      );
    };

    xhr.onload = () => {
      let parsed: any = null;
      try {
        parsed = JSON.parse(xhr.responseText);
      } catch {
        parsed = null;
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        if (options.onProgress) options.onProgress(100);
        resolve(parsed?.data as AdminMediaDto);
        return;
      }

      const errObj = parsed?.error || {};
      const message =
        typeof errObj.message === 'string' && errObj.message
          ? errObj.message
          : `خطا در بارگذاری فایل (${xhr.status})`;
      const code = typeof errObj.code === 'string' ? errObj.code : `HTTP_${xhr.status}`;
      reject(new AdminApiError(xhr.status, code, message, errObj.details));
    };

    const formData = new FormData();
    formData.append('file', options.file);
    formData.append('category', options.category);
    if (options.visibility) formData.append('visibility', options.visibility);
    if (options.altText) formData.append('altText', options.altText);

    xhr.send(formData);
  });
}

export const adminClient = {
  // ---------------------------------------------------------------------------
  // Auth & Health
  // ---------------------------------------------------------------------------
  initCsrf: async (): Promise<string> => {
    const res = await requestData<{ csrfToken: string }>('/api/v1/auth/csrf', {
      method: 'GET',
      skipRefresh: true,
    });
    return res?.csrfToken || '';
  },

  getMe: async (): Promise<{ user: AuthUser }> => {
    return requestData<{ user: AuthUser }>('/api/v1/auth/me', { method: 'GET' });
  },

  login: async (input: LoginRequest): Promise<{ user: AuthUser; csrfToken: string }> => {
    return requestData<{ user: AuthUser; csrfToken: string }>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(input),
      skipRefresh: true,
    });
  },

  requestLoginOtp: async (phone: string): Promise<OtpChallengeResponse> => {
    return requestData<OtpChallengeResponse>('/api/v1/auth/otp/request', {
      method: 'POST',
      body: JSON.stringify({ phone, purpose: 'login' }),
      skipRefresh: true,
    });
  },

  verifyLoginOtp: async (input: {
    challengeId: string;
    code: string;
  }): Promise<{ user: AuthUser; csrfToken: string; message: string }> => {
    return requestData<{ user: AuthUser; csrfToken: string; message: string }>(
      '/api/v1/auth/otp/verify',
      {
        method: 'POST',
        body: JSON.stringify(input),
        skipRefresh: true,
      }
    );
  },

  resendOtp: async (challengeId: string): Promise<OtpChallengeResponse> => {
    return requestData<OtpChallengeResponse>('/api/v1/auth/otp/resend', {
      method: 'POST',
      body: JSON.stringify({ challengeId }),
      skipRefresh: true,
    });
  },

  logout: async (): Promise<void> => {
    await requestData<unknown>('/api/v1/auth/logout', {
      method: 'POST',
      skipRefresh: true,
    });
  },

  getReadiness: async (): Promise<ReadinessResponse> => {
    try {
      const response = await fetch('/api/v1/health/readiness', {
        method: 'GET',
        cache: 'no-store',
      });
      const json = await response.json().catch(() => null);
      if (response.ok && json?.data) {
        return json.data as ReadinessResponse;
      }
      const details = json?.error?.details;
      if (details && typeof details.status === 'string') {
        return details as ReadinessResponse;
      }
      return {
        status: 'not_ready',
        database: 'disconnected',
        timestamp: new Date().toISOString(),
      };
    } catch {
      return {
        status: 'not_ready',
        database: 'disconnected',
        timestamp: new Date().toISOString(),
      };
    }
  },

  // ---------------------------------------------------------------------------
  // 1. Dashboard & Preview
  // ---------------------------------------------------------------------------
  getDashboardSummary: () =>
    requestData<AdminDashboardSummaryDto>('/api/v1/admin/dashboard/summary'),

  previewCourse: (courseId: string) =>
    requestData<AdminCoursePreviewDto>(`/api/v1/admin/preview/courses/${courseId}`),

  previewLesson: (lessonId: string) =>
    requestData<AdminLessonPreviewDto>(`/api/v1/admin/preview/lessons/${lessonId}`),

  // ---------------------------------------------------------------------------
  // 2. Courses
  // ---------------------------------------------------------------------------
  listCourses: (query: {
    page?: number;
    limit?: number;
    q?: string;
    status?: string;
    level?: string;
    sort?: string;
    order?: string;
  } = {}) => requestPaginated<AdminCourseDto>(`/api/v1/admin/courses${buildQueryString(query)}`),

  getCourse: (courseId: string) =>
    requestData<AdminCourseDto>(`/api/v1/admin/courses/${courseId}`),

  createCourse: (dto: AdminCreateCourseDto) =>
    requestData<AdminCourseDto>('/api/v1/admin/courses', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),

  updateCourse: (courseId: string, dto: AdminUpdateCourseDto) =>
    requestData<AdminCourseDto>(`/api/v1/admin/courses/${courseId}`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    }),

  publishCourse: (courseId: string, body?: { expectedVersion?: number; changeSummary?: string }) =>
    requestData<AdminCourseDto>(`/api/v1/admin/courses/${courseId}/publish`, {
      method: 'POST',
      body: JSON.stringify(body || {}),
    }),

  unpublishCourse: (courseId: string, body?: { expectedVersion?: number; changeSummary?: string }) =>
    requestData<AdminCourseDto>(`/api/v1/admin/courses/${courseId}/unpublish`, {
      method: 'POST',
      body: JSON.stringify(body || {}),
    }),

  archiveCourse: (courseId: string, body?: { expectedVersion?: number; changeSummary?: string }) =>
    requestData<AdminCourseDto>(`/api/v1/admin/courses/${courseId}/archive`, {
      method: 'POST',
      body: JSON.stringify(body || {}),
    }),

  getCourseStats: (courseId: string) =>
    requestData<AdminCourseStatsDetailDto>(`/api/v1/admin/courses/${courseId}/stats`),

  getCourseOutline: (courseId: string) =>
    requestData<AdminCourseOutlineItem[]>(`/api/v1/admin/courses/${courseId}/outline`),

  // ---------------------------------------------------------------------------
  // 3. Chapters
  // ---------------------------------------------------------------------------
  listChapters: (courseId: string, query: { status?: string } = {}) =>
    requestData<AdminChapterDto[]>(
      `/api/v1/admin/courses/${courseId}/chapters${buildQueryString(query)}`
    ),

  createChapter: (courseId: string, dto: AdminCreateChapterDto) =>
    requestData<AdminChapterDto>(`/api/v1/admin/courses/${courseId}/chapters`, {
      method: 'POST',
      body: JSON.stringify(dto),
    }),

  reorderChapters: (courseId: string, dto: AdminReorderChaptersDto) =>
    requestData<AdminChapterDto[]>(`/api/v1/admin/courses/${courseId}/chapters/reorder`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    }),

  getChapter: (chapterId: string) =>
    requestData<AdminChapterDto>(`/api/v1/admin/chapters/${chapterId}`),

  updateChapter: (chapterId: string, dto: AdminUpdateChapterDto) =>
    requestData<AdminChapterDto>(`/api/v1/admin/chapters/${chapterId}`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    }),

  publishChapter: (chapterId: string, body?: { expectedVersion?: number; changeSummary?: string }) =>
    requestData<AdminChapterDto>(`/api/v1/admin/chapters/${chapterId}/publish`, {
      method: 'POST',
      body: JSON.stringify(body || {}),
    }),

  unpublishChapter: (chapterId: string, body?: { expectedVersion?: number; changeSummary?: string }) =>
    requestData<AdminChapterDto>(`/api/v1/admin/chapters/${chapterId}/unpublish`, {
      method: 'POST',
      body: JSON.stringify(body || {}),
    }),

  archiveChapter: (chapterId: string, body?: { expectedVersion?: number; changeSummary?: string }) =>
    requestData<AdminChapterDto>(`/api/v1/admin/chapters/${chapterId}/archive`, {
      method: 'POST',
      body: JSON.stringify(body || {}),
    }),

  // ---------------------------------------------------------------------------
  // 4. Lessons
  // ---------------------------------------------------------------------------
  listLessons: (chapterId: string, query: { status?: string } = {}) =>
    requestData<AdminLessonDto[]>(
      `/api/v1/admin/chapters/${chapterId}/lessons${buildQueryString(query)}`
    ),

  createLesson: (chapterId: string, dto: AdminCreateLessonDto) =>
    requestData<AdminLessonDto>(`/api/v1/admin/chapters/${chapterId}/lessons`, {
      method: 'POST',
      body: JSON.stringify(dto),
    }),

  reorderLessons: (chapterId: string, dto: AdminReorderLessonsDto) =>
    requestData<AdminLessonDto[]>(`/api/v1/admin/chapters/${chapterId}/lessons/reorder`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    }),

  getLesson: (lessonId: string) =>
    requestData<AdminLessonDto>(`/api/v1/admin/lessons/${lessonId}`),

  updateLesson: (lessonId: string, dto: AdminUpdateLessonDto) =>
    requestData<AdminLessonDto>(`/api/v1/admin/lessons/${lessonId}`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    }),

  publishLesson: (lessonId: string, body?: { expectedVersion?: number; changeSummary?: string }) =>
    requestData<AdminLessonDto>(`/api/v1/admin/lessons/${lessonId}/publish`, {
      method: 'POST',
      body: JSON.stringify(body || {}),
    }),

  unpublishLesson: (lessonId: string, body?: { expectedVersion?: number; changeSummary?: string }) =>
    requestData<AdminLessonDto>(`/api/v1/admin/lessons/${lessonId}/unpublish`, {
      method: 'POST',
      body: JSON.stringify(body || {}),
    }),

  archiveLesson: (lessonId: string, body?: { expectedVersion?: number; changeSummary?: string }) =>
    requestData<AdminLessonDto>(`/api/v1/admin/lessons/${lessonId}/archive`, {
      method: 'POST',
      body: JSON.stringify(body || {}),
    }),

  // ---------------------------------------------------------------------------
  // 5. Media
  // ---------------------------------------------------------------------------
  listMedia: (query: {
    page?: number;
    limit?: number;
    q?: string;
    category?: string;
    mediaType?: string;
    status?: string;
    sort?: string;
    order?: string;
  } = {}) => requestPaginated<AdminMediaDto>(`/api/v1/admin/media${buildQueryString(query)}`),

  getMedia: (mediaId: string) =>
    requestData<AdminMediaDto>(`/api/v1/admin/media/${mediaId}`),

  uploadMediaFile: async (options: UploadMediaOptions): Promise<AdminMediaDto> => {
    const csrfToken = await ensureCsrfToken();
    try {
      return await sendMediaXhr(options, csrfToken);
    } catch (err) {
      if (err instanceof AdminApiError && err.status === 401) {
        const refreshed = await refreshSessionSingleFlight();
        if (refreshed) {
          const newCsrf = await ensureCsrfToken();
          return sendMediaXhr(options, newCsrf);
        }
      }
      throw err;
    }
  },

  updateMedia: (mediaId: string, dto: AdminUpdateMediaDto) =>
    requestData<AdminMediaDto>(`/api/v1/admin/media/${mediaId}`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    }),

  deleteMedia: (mediaId: string) =>
    requestData<{ deleted: boolean; id: string }>(`/api/v1/admin/media/${mediaId}`, {
      method: 'DELETE',
    }),

  getMediaUsage: async (mediaId: string): Promise<MediaUsageItem[]> => {
    const res = await requestData<
      MediaUsageItem[] | { usages?: MediaUsageItem[] }
    >(`/api/v1/admin/media/${mediaId}/usage`);
    return Array.isArray(res) ? res : Array.isArray(res?.usages) ? res.usages : [];
  },

  // ---------------------------------------------------------------------------
  // 6. Site Pages & Settings
  // ---------------------------------------------------------------------------
  listPages: (query: {
    page?: number;
    limit?: number;
    q?: string;
    status?: string;
    sort?: string;
    order?: string;
  } = {}) => requestPaginated<AdminSitePageDto>(`/api/v1/admin/pages${buildQueryString(query)}`),

  createPage: (dto: AdminCreateSitePageDto) =>
    requestData<AdminSitePageDto>('/api/v1/admin/pages', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),

  getPage: (pageId: string) =>
    requestData<AdminSitePageDto>(`/api/v1/admin/pages/${pageId}`),

  updatePage: (pageId: string, dto: AdminUpdateSitePageDto) =>
    requestData<AdminSitePageDto>(`/api/v1/admin/pages/${pageId}`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    }),

  publishPage: (pageId: string, body?: { expectedVersion?: number; changeSummary?: string }) =>
    requestData<AdminSitePageDto>(`/api/v1/admin/pages/${pageId}/publish`, {
      method: 'POST',
      body: JSON.stringify(body || {}),
    }),

  unpublishPage: (pageId: string, body?: { expectedVersion?: number; changeSummary?: string }) =>
    requestData<AdminSitePageDto>(`/api/v1/admin/pages/${pageId}/unpublish`, {
      method: 'POST',
      body: JSON.stringify(body || {}),
    }),

  archivePage: (pageId: string, body?: { expectedVersion?: number; changeSummary?: string }) =>
    requestData<AdminSitePageDto>(`/api/v1/admin/pages/${pageId}/archive`, {
      method: 'POST',
      body: JSON.stringify(body || {}),
    }),

  getSettings: () =>
    requestData<AdminSiteSettingsDto>('/api/v1/admin/settings'),

  updateSettings: (dto: AdminUpdateSiteSettingsDto) =>
    requestData<AdminSiteSettingsDto>('/api/v1/admin/settings', {
      method: 'PATCH',
      body: JSON.stringify(dto),
    }),

  // ---------------------------------------------------------------------------
  // 7. Users
  // ---------------------------------------------------------------------------
  listUsers: (query: {
    page?: number;
    limit?: number;
    q?: string;
    role?: string;
    status?: string;
    sort?: string;
    order?: string;
  } = {}) => requestPaginated<AdminUserDto>(`/api/v1/admin/users${buildQueryString(query)}`),

  getUserDetail: async (userId: string): Promise<AdminUserDetailDto> => {
    const res = await requestData<
      AdminUserDetailDto | (AdminUserDto & { activeSessionsCount?: number })
    >(`/api/v1/admin/users/${userId}`);
    if (res && 'user' in res && res.user) {
      return {
        user: res.user,
        activeSessionsCount: res.activeSessionsCount ?? 0,
      };
    }
    const { activeSessionsCount = 0, ...userFields } = res as AdminUserDto & {
      activeSessionsCount?: number;
    };
    return {
      user: userFields as AdminUserDto,
      activeSessionsCount,
    };
  },

  updateUserStatus: (userId: string, dto: AdminUpdateUserStatusDto) =>
    requestData<AdminUserDto>(`/api/v1/admin/users/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    }),

  updateUserRoles: (userId: string, dto: AdminUpdateUserRolesDto) =>
    requestData<AdminUserDto>(`/api/v1/admin/users/${userId}/roles`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    }),

  getUserSessions: (userId: string) =>
    requestData<AdminUserSessionDto[]>(`/api/v1/admin/users/${userId}/sessions`),

  revokeUserSessions: (userId: string, reason: string) =>
    requestData<{ revokedCount: number }>(`/api/v1/admin/users/${userId}/revoke-sessions`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),

  // ---------------------------------------------------------------------------
  // 8. Revisions & Audit Logs
  // ---------------------------------------------------------------------------
  listAllRevisions: (query: {
    page?: number;
    limit?: number;
    q?: string;
    resourceType?: RevisionResourceType;
    resourceId?: string;
  } = {}) =>
    requestPaginated<AdminContentRevisionDto>(
      `/api/v1/admin/revisions${buildQueryString(query)}`
    ),

  listResourceRevisions: (
    resourceType: RevisionResourceType,
    resourceId: string,
    query: { page?: number; limit?: number } = {}
  ) =>
    requestPaginated<AdminContentRevisionDto>(
      `/api/v1/admin/revisions/${resourceType}/${resourceId}${buildQueryString(query)}`
    ),

  getRevision: (revisionId: string) =>
    requestData<AdminContentRevisionDto>(`/api/v1/admin/revisions/${revisionId}`),

  restoreRevision: (
    revisionId: string,
    body?: { expectedVersion?: number; changeSummary?: string }
  ) =>
    requestData<{ resourceType: RevisionResourceType; resource: unknown }>(
      `/api/v1/admin/revisions/${revisionId}/restore`,
      {
        method: 'POST',
        body: JSON.stringify(body || {}),
      }
    ),

  listAuditLogs: (query: {
    page?: number;
    limit?: number;
    q?: string;
    actorUserId?: string;
    action?: string;
    resourceType?: string;
    resourceId?: string;
    result?: string;
    from?: string;
    to?: string;
    order?: string;
  } = {}) =>
    requestPaginated<AdminAuditLogDto>(`/api/v1/admin/audit-logs${buildQueryString(query)}`),
};
