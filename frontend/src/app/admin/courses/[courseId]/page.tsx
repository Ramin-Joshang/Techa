'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Archive,
  CheckCircle2,
  Eye,
  FolderTree,
  History,
  XCircle,
} from 'lucide-react';
import { AdminCreateCourseDto } from '@techa/shared';
import AdminGuard, { AdminGuardLoadingSkeleton } from '../../../../components/admin/auth/AdminGuard';
import {
  CourseForm,
  CourseFormValues,
  courseDtoToFormValues,
} from '../../../../components/admin/courses/CourseForm';
import {
  AdminButton,
  AdminConfirmModal,
  AdminErrorState,
  AdminModal,
  AdminPageHeader,
  ConflictResolutionModal,
  PublicationStatusLabel,
} from '../../../../components/admin/ui/AdminPrimitives';
import { useAdminToast } from '../../../../components/admin/ui/ToastProvider';
import { useAdminAuth } from '../../../../context/AdminAuthContext';
import { adminClient, AdminApiError } from '../../../../lib/admin/admin-client';
import { formatPersianNumber } from '../../../../lib/admin/admin-formatters';
import {
  AdminCourseDto,
  AdminCourseOutlineItem,
  AdminCoursePreviewDto,
  AdminCourseStatsDetailDto,
} from '../../../../lib/admin/admin-types';
import { useUnsavedChangesWarning } from '../../../../lib/admin/use-unsaved-guard';

function CourseDetailContent() {
  const params = useParams<{ courseId: string }>();
  const router = useRouter();
  const courseId = params?.courseId || '';
  const { hasPermission } = useAdminAuth();
  const toast = useAdminToast();

  const [course, setCourse] = useState<AdminCourseDto | null>(null);
  const [stats, setStats] = useState<AdminCourseStatsDetailDto | null>(null);
  const [outline, setOutline] = useState<AdminCourseOutlineItem[]>([]);
  const [formValues, setFormValues] = useState<CourseFormValues>(() => courseDtoToFormValues(null));
  const [isDirty, setIsDirty] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [conflictState, setConflictState] = useState<{
    open: boolean;
    serverVersion?: number;
    message?: string;
  }>({ open: false });

  const [confirmAction, setConfirmAction] = useState<'publish' | 'unpublish' | 'archive' | null>(null);
  const [lifecycleLoading, setLifecycleLoading] = useState(false);

  const [previewData, setPreviewData] = useState<AdminCoursePreviewDto | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  useUnsavedChangesWarning(isDirty);

  const loadCourseData = useCallback(async () => {
    if (!courseId) return;
    setLoading(true);
    setError(null);
    try {
      const [courseRes, statsRes, outlineRes] = await Promise.all([
        adminClient.getCourse(courseId),
        adminClient.getCourseStats(courseId),
        adminClient.getCourseOutline(courseId),
      ]);
      setCourse(courseRes);
      setStats(statsRes);
      setOutline(outlineRes);
      setFormValues(courseDtoToFormValues(courseRes));
      setIsDirty(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در دریافت اطلاعات دوره');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    void loadCourseData();
  }, [loadCourseData]);

  const handleSave = async (dto: AdminCreateCourseDto) => {
    if (!course) return;
    setSubmitting(true);
    try {
      const updated = await adminClient.updateCourse(course.id, {
        ...dto,
        expectedVersion: course.version,
      });
      setCourse(updated);
      setFormValues(courseDtoToFormValues(updated));
      setIsDirty(false);
      toast.success('تغییرات دوره ذخیره شد');
      router.push('/admin/courses');
    } catch (err) {
      if (err instanceof AdminApiError && err.status === 409) {
        const details = err.details as { currentVersion?: number } | undefined;
        setConflictState({
          open: true,
          serverVersion: details?.currentVersion,
          message: err.message,
        });
      } else {
        toast.error('ذخیره تغییرات ناموفق بود', err instanceof Error ? err.message : undefined);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleLifecycle = async () => {
    if (!course || !confirmAction) return;
    setLifecycleLoading(true);
    try {
      let updated: AdminCourseDto;
      if (confirmAction === 'publish') {
        updated = await adminClient.publishCourse(course.id, { expectedVersion: course.version });
        toast.success('دوره منتشر شد');
      } else if (confirmAction === 'unpublish') {
        updated = await adminClient.unpublishCourse(course.id, { expectedVersion: course.version });
        toast.success('دوره به پیش‌نویس تغییر یافت');
      } else {
        updated = await adminClient.archiveCourse(course.id, { expectedVersion: course.version });
        toast.success('دوره بایگانی شد');
      }
      setCourse(updated);
      setConfirmAction(null);
    } catch (err) {
      if (err instanceof AdminApiError && err.status === 409) {
        const details = err.details as { currentVersion?: number } | undefined;
        setConfirmAction(null);
        setConflictState({
          open: true,
          serverVersion: details?.currentVersion,
          message: err.message,
        });
      } else {
        toast.error('عملیات ناموفق بود', err instanceof Error ? err.message : undefined);
      }
    } finally {
      setLifecycleLoading(false);
    }
  };

  const handleOpenPreview = async () => {
    if (!course) return;
    setPreviewLoading(true);
    setPreviewData(null);
    try {
      const res = await adminClient.previewCourse(course.id);
      setPreviewData(res);
    } catch (err) {
      toast.error('خطا در دریافت پیش‌نمایش', err instanceof Error ? err.message : undefined);
    } finally {
      setPreviewLoading(false);
    }
  };

  if (loading) return <AdminGuardLoadingSkeleton />;
  if (error || !course) {
    return (
      <AdminErrorState
        message={error || 'دوره مورد نظر یافت نشد.'}
        onRetry={loadCourseData}
      />
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={course.title}
        description={`نسخه فعلی: v${course.version} · اسلاگ: /${course.slug}`}
        breadcrumbs={[
          { label: 'داشبورد', href: '/admin' },
          { label: 'دوره‌ها', href: '/admin/courses' },
          { label: course.title },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <PublicationStatusLabel status={course.status} />
            <Link
              href={`/admin/courses/${course.id}/chapters`}
              className="inline-flex items-center gap-1.5 min-h-[36px] px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-medium text-slate-800"
            >
              <FolderTree className="w-4 h-4 text-emerald-700" />
              <span>فصل‌ها و درس‌ها</span>
            </Link>
            {hasPermission('revisions:read') && (
              <Link
                href={`/admin/revisions?resourceType=course&resourceId=${course.id}`}
                className="inline-flex items-center gap-1.5 min-h-[36px] px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-medium text-slate-800"
              >
                <History className="w-4 h-4 text-slate-500" />
                <span>تاریخچه نسخه‌ها</span>
              </Link>
            )}
            {hasPermission('preview:read') && (
              <AdminButton
                variant="outline"
                size="sm"
                onClick={handleOpenPreview}
                icon={<Eye className="w-4 h-4" />}
              >
                پیش‌نمایش
              </AdminButton>
            )}
            {hasPermission('courses:publish') && course.status !== 'published' && (
              <AdminButton
                variant="secondary"
                size="sm"
                onClick={() => setConfirmAction('publish')}
                icon={<CheckCircle2 className="w-4 h-4" />}
              >
                انتشار دوره
              </AdminButton>
            )}
            {hasPermission('courses:publish') && course.status === 'published' && (
              <AdminButton
                variant="outline"
                size="sm"
                onClick={() => setConfirmAction('unpublish')}
                icon={<XCircle className="w-4 h-4 text-amber-600" />}
              >
                لغو انتشار
              </AdminButton>
            )}
            {hasPermission('courses:archive') && course.status !== 'archived' && (
              <AdminButton
                variant="outline"
                size="sm"
                onClick={() => setConfirmAction('archive')}
                icon={<Archive className="w-4 h-4 text-red-600" />}
              >
                بایگانی
              </AdminButton>
            )}
          </div>
        }
      />

      {/* Stats & Outline Summary Row */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-white border border-slate-200 rounded-lg p-3.5">
            <div className="text-[11px] text-slate-500">کل فصل‌ها</div>
            <div className="text-lg font-bold text-slate-900 tabular-nums mt-1">
              {formatPersianNumber(stats.totalChapters)}
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-3.5">
            <div className="text-[11px] text-slate-500">فصل‌های منتشر شده</div>
            <div className="text-lg font-bold text-emerald-700 tabular-nums mt-1">
              {formatPersianNumber(stats.publishedChapters)}
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-3.5">
            <div className="text-[11px] text-slate-500">کل درس‌ها</div>
            <div className="text-lg font-bold text-slate-900 tabular-nums mt-1">
              {formatPersianNumber(stats.totalLessons)}
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-3.5">
            <div className="text-[11px] text-slate-500">درس‌های منتشر شده</div>
            <div className="text-lg font-bold text-emerald-700 tabular-nums mt-1">
              {formatPersianNumber(stats.publishedLessons)}
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-3.5">
            <div className="text-[11px] text-slate-500">زمان مطالعه کل</div>
            <div className="text-lg font-bold text-slate-900 tabular-nums mt-1">
              {formatPersianNumber(stats.estimatedReadingTimeMinutes)} دقیقه
            </div>
          </div>
        </div>
      )}

      {/* Quick Outline Snapshot */}
      {outline.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-slate-800">فهرست سرفصل‌های دوره</h2>
            <Link
              href={`/admin/courses/${course.id}/chapters`}
              className="text-xs font-medium text-emerald-700 hover:underline"
            >
              مدیریت و مرتب‌سازی فصل‌ها
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {outline.map((ch, idx) => (
              <Link
                key={ch.id}
                href={`/admin/chapters/${ch.id}`}
                className="px-3 py-1.5 rounded-md border border-slate-200 bg-slate-50 hover:border-emerald-600 text-xs text-slate-800 transition-colors"
              >
                <span className="font-mono text-slate-400 ml-1.5">{idx + 1}.</span>
                <span className="font-medium">{ch.title}</span>
                <span className="text-slate-400 mr-1.5 tabular-nums">
                  ({formatPersianNumber(ch.lessons.length)} درس)
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <CourseForm
        values={formValues}
        onChange={(next) => {
          setFormValues(next);
          setIsDirty(true);
        }}
        onSubmit={handleSave}
        submitting={submitting}
        submitLabel="ذخیره تغییرات دوره"
        readOnly={!hasPermission('courses:update')}
        isEdit
      />

      <ConflictResolutionModal
        open={conflictState.open}
        onClose={() => setConflictState({ open: false })}
        onReloadServer={() => {
          setConflictState({ open: false });
          void loadCourseData();
        }}
        localVersion={course.version}
        serverVersion={conflictState.serverVersion}
        message={conflictState.message}
      />

      <AdminConfirmModal
        open={Boolean(confirmAction)}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleLifecycle}
        isLoading={lifecycleLoading}
        variant={confirmAction === 'archive' ? 'danger' : 'primary'}
        title={
          confirmAction === 'publish'
            ? 'انتشار دوره'
            : confirmAction === 'unpublish'
              ? 'لغو انتشار دوره'
              : 'بایگانی دوره'
        }
        confirmLabel={
          confirmAction === 'publish'
            ? 'انتشار'
            : confirmAction === 'unpublish'
              ? 'بازگشت به پیش‌نویس'
              : 'بایگانی'
        }
        message={
          confirmAction === 'publish'
            ? `آیا از انتشار دوره «${course.title}» اطمینان دارید؟`
            : confirmAction === 'unpublish'
              ? `آیا می‌خواهید دوره «${course.title}» از سایت عمومی مخفی شود؟`
              : `آیا از بایگانی دوره «${course.title}» اطمینان دارید؟`
        }
      />

      <AdminModal
        open={previewLoading || Boolean(previewData)}
        onClose={() => setPreviewData(null)}
        title={previewData ? `پیش‌نمایش: ${previewData.course.title}` : 'در حال بارگذاری پیش‌نمایش...'}
        maxWidthClass="max-w-2xl"
      >
        {previewLoading ? (
          <div className="py-10 text-center text-sm text-slate-500">در حال بارگذاری...</div>
        ) : (
          previewData && (
            <div className="space-y-4">
              <p className="text-sm text-slate-700 leading-relaxed">{previewData.course.description}</p>
              <div className="space-y-2">
                {previewData.outline.map((ch) => (
                  <div key={ch.id} className="border border-slate-200 rounded-lg p-3">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-900 mb-2">
                      <span>{ch.title}</span>
                      <PublicationStatusLabel status={ch.status} />
                    </div>
                    <ul className="space-y-1 text-xs text-slate-600 pr-3 border-r border-slate-200">
                      {ch.lessons.map((l) => (
                        <li key={l.id} className="flex items-center justify-between">
                          <span>{l.title}</span>
                          <PublicationStatusLabel status={l.status} />
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )
        )}
      </AdminModal>
    </div>
  );
}

export default function AdminCourseDetailPage() {
  return (
    <AdminGuard requiredPermission="courses:read">
      <CourseDetailContent />
    </AdminGuard>
  );
}
