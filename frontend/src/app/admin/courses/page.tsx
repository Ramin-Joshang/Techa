'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Archive,
  BookOpen,
  CheckCircle2,
  Eye,
  FolderTree,
  Pencil,
  Plus,
  Search,
  XCircle,
} from 'lucide-react';
import { COURSE_LEVELS, PUBLICATION_STATUSES } from '@techa/shared';
import AdminGuard from '../../../components/admin/auth/AdminGuard';
import {
  AdminButton,
  AdminConfirmModal,
  AdminEmptyState,
  AdminErrorState,
  AdminModal,
  AdminPageHeader,
  AdminPagination,
  PublicationStatusLabel,
} from '../../../components/admin/ui/AdminPrimitives';
import { AdminInput, AdminSelect } from '../../../components/admin/ui/AdminFormFields';
import { useAdminToast } from '../../../components/admin/ui/ToastProvider';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import { adminClient } from '../../../lib/admin/admin-client';
import {
  COURSE_LEVEL_LABELS,
  PUBLICATION_STATUS_LABELS,
  formatPersianDateTime,
  formatPersianNumber,
} from '../../../lib/admin/admin-formatters';
import {
  AdminCourseDto,
  AdminCoursePreviewDto,
  PaginationMeta,
} from '../../../lib/admin/admin-types';

type LifecycleAction = 'publish' | 'unpublish' | 'archive';

function CoursesListContent() {
  const { hasPermission } = useAdminAuth();
  const toast = useAdminToast();

  const [courses, setCourses] = useState<AdminCourseDto[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 20,
    totalItems: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [level, setLevel] = useState('');
  const [sort, setSort] = useState('order');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);

  const [confirmState, setConfirmState] = useState<{
    course: AdminCourseDto;
    action: LifecycleAction;
  } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [previewData, setPreviewData] = useState<AdminCoursePreviewDto | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminClient.listCourses({
        page,
        limit: 20,
        q: q.trim() || undefined,
        status: status || undefined,
        level: level || undefined,
        sort,
        order,
      });
      setCourses(res.items);
      setPagination(res.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در بارگذاری فهرست دوره‌ها');
    } finally {
      setLoading(false);
    }
  }, [page, q, status, level, sort, order]);

  useEffect(() => {
    void fetchCourses();
  }, [fetchCourses]);

  const handleLifecycleConfirm = async () => {
    if (!confirmState) return;
    setActionLoading(true);
    try {
      const { course, action } = confirmState;
      let updated: AdminCourseDto;
      if (action === 'publish') {
        updated = await adminClient.publishCourse(course.id, { expectedVersion: course.version });
        toast.success('دوره با موفقیت منتشر شد', updated.title);
      } else if (action === 'unpublish') {
        updated = await adminClient.unpublishCourse(course.id, { expectedVersion: course.version });
        toast.success('دوره به حالت پیش‌نویس بازگشت', updated.title);
      } else {
        updated = await adminClient.archiveCourse(course.id, { expectedVersion: course.version });
        toast.success('دوره بایگانی شد', updated.title);
      }
      setCourses((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      setConfirmState(null);
    } catch (err) {
      toast.error('عملیات ناموفق بود', err instanceof Error ? err.message : undefined);
    } finally {
      setActionLoading(false);
    }
  };

  const openCoursePreview = async (courseId: string) => {
    setPreviewLoading(true);
    setPreviewData(null);
    try {
      const data = await adminClient.previewCourse(courseId);
      setPreviewData(data);
    } catch (err) {
      toast.error('خطا در دریافت پیش‌نمایش دوره', err instanceof Error ? err.message : undefined);
    } finally {
      setPreviewLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="مدیریت دوره‌ها"
        description="ایجاد، ویرایش، مدیریت سرفصل‌ها، انتشار و بایگانی دوره‌های آموزشی تکا"
        breadcrumbs={[{ label: 'داشبورد', href: '/admin' }, { label: 'دوره‌ها' }]}
        actions={
          hasPermission('courses:create') && (
            <Link
              href="/admin/courses/new"
              className="inline-flex items-center gap-2 min-h-[40px] px-4 py-2 rounded-lg bg-[#042A1B] hover:bg-[#063b26] text-white text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>دوره جدید</span>
            </Link>
          )
        }
      />

      {/* Search & Filters */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="relative lg:col-span-2">
          <AdminInput
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="جستجو در عنوان یا اسلاگ دوره..."
            className="pl-9"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <AdminSelect
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">همه وضعیت‌ها</option>
          {PUBLICATION_STATUSES.map((st) => (
            <option key={st} value={st}>
              {PUBLICATION_STATUS_LABELS[st]}
            </option>
          ))}
        </AdminSelect>

        <AdminSelect
          value={level}
          onChange={(e) => {
            setLevel(e.target.value);
            setPage(1);
          }}
        >
          <option value="">همه سطوح</option>
          {COURSE_LEVELS.map((lvl) => (
            <option key={lvl} value={lvl}>
              {COURSE_LEVEL_LABELS[lvl]}
            </option>
          ))}
        </AdminSelect>

        <AdminSelect
          value={`${sort}:${order}`}
          onChange={(e) => {
            const [s, o] = e.target.value.split(':');
            setSort(s);
            setOrder(o as 'asc' | 'desc');
            setPage(1);
          }}
        >
          <option value="order:asc">ترتیب نمایش (صعودی)</option>
          <option value="updatedAt:desc">جدیدترین ویرایش</option>
          <option value="createdAt:desc">جدیدترین ایجاد</option>
          <option value="title:asc">عنوان (الفبا)</option>
        </AdminSelect>
      </div>

      {loading ? (
        <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-3 animate-pulse">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-12 bg-slate-100 rounded" />
          ))}
        </div>
      ) : error ? (
        <AdminErrorState message={error} onRetry={fetchCourses} />
      ) : courses.length === 0 ? (
        <AdminEmptyState
          title="دوره‌ای یافت نشد"
          description="هیچ دوره‌ای مطابق فیلترهای انتخاب‌شده پیدا نشد."
          icon={<BookOpen className="w-6 h-6" />}
          action={
            hasPermission('courses:create') ? (
              <Link
                href="/admin/courses/new"
                className="inline-flex items-center gap-2 min-h-[40px] px-4 py-2 rounded-lg bg-[#042A1B] text-white text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                <span>ایجاد اولین دوره</span>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <th className="px-4 py-3 font-semibold">عنوان و اسلاگ</th>
                  <th className="px-4 py-3 font-semibold">سطح</th>
                  <th className="px-4 py-3 font-semibold">وضعیت</th>
                  <th className="px-4 py-3 font-semibold">آمار محتوا</th>
                  <th className="px-4 py-3 font-semibold">نسخه</th>
                  <th className="px-4 py-3 font-semibold">آخرین ویرایش</th>
                  <th className="px-4 py-3 font-semibold">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {courses.map((course) => (
                  <tr key={course.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3.5 max-w-xs">
                      <Link
                        href={`/admin/courses/${course.id}`}
                        className="font-bold text-sm text-slate-900 hover:text-emerald-700 block truncate"
                      >
                        {course.title}
                      </Link>
                      <span dir="ltr" className="font-mono text-[11px] text-slate-500 block truncate mt-0.5">
                        /{course.slug}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-700 whitespace-nowrap">
                      {COURSE_LEVEL_LABELS[course.level]}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <PublicationStatusLabel status={course.status} />
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 whitespace-nowrap tabular-nums">
                      {formatPersianNumber(course.stats?.totalChapters || 0)} فصل ·{' '}
                      {formatPersianNumber(course.stats?.totalLessons || 0)} درس
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-600 whitespace-nowrap tabular-nums">
                      v{course.version}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap tabular-nums">
                      {formatPersianDateTime(course.updatedAt)}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/admin/courses/${course.id}`}
                          className="p-2 rounded-md border border-slate-200 bg-white hover:bg-slate-100 text-slate-700"
                          title="ویرایش دوره"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                          href={`/admin/courses/${course.id}/chapters`}
                          className="p-2 rounded-md border border-slate-200 bg-white hover:bg-slate-100 text-slate-700"
                          title="مدیریت فصل‌ها و درس‌ها"
                        >
                          <FolderTree className="w-3.5 h-3.5" />
                        </Link>
                        {hasPermission('preview:read') && (
                          <button
                            type="button"
                            onClick={() => openCoursePreview(course.id)}
                            className="p-2 rounded-md border border-slate-200 bg-white hover:bg-slate-100 text-slate-700"
                            title="پیش‌نمایش ساختار دوره"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {hasPermission('courses:publish') && course.status !== 'published' && (
                          <button
                            type="button"
                            onClick={() => setConfirmState({ course, action: 'publish' })}
                            className="p-2 rounded-md border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800"
                            title="انتشار دوره"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {hasPermission('courses:publish') && course.status === 'published' && (
                          <button
                            type="button"
                            onClick={() => setConfirmState({ course, action: 'unpublish' })}
                            className="p-2 rounded-md border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800"
                            title="لغو انتشار (پیش‌نویس)"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {hasPermission('courses:archive') && course.status !== 'archived' && (
                          <button
                            type="button"
                            onClick={() => setConfirmState({ course, action: 'archive' })}
                            className="p-2 rounded-md border border-slate-200 bg-white hover:bg-red-50 text-slate-600 hover:text-red-700"
                            title="بایگانی دوره"
                          >
                            <Archive className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 pb-4">
            <AdminPagination pagination={pagination} onPageChange={setPage} />
          </div>
        </div>
      )}

      {/* Lifecycle Confirmation Modal */}
      <AdminConfirmModal
        open={Boolean(confirmState)}
        onClose={() => setConfirmState(null)}
        onConfirm={handleLifecycleConfirm}
        isLoading={actionLoading}
        variant={confirmState?.action === 'archive' ? 'danger' : 'primary'}
        title={
          confirmState?.action === 'publish'
            ? 'تأیید انتشار دوره'
            : confirmState?.action === 'unpublish'
              ? 'لغو انتشار دوره'
              : 'بایگانی دوره'
        }
        confirmLabel={
          confirmState?.action === 'publish'
            ? 'انتشار دوره'
            : confirmState?.action === 'unpublish'
              ? 'بازگشت به پیش‌نویس'
              : 'بایگانی'
        }
        message={
          confirmState
            ? confirmState.action === 'publish'
              ? `آیا از انتشار دوره «${confirmState.course.title}» اطمینان دارید؟ سئوی دوره پیش از انتشار توسط سرور بررسی می‌شود.`
              : confirmState.action === 'unpublish'
                ? `آیا می‌خواهید دوره «${confirmState.course.title}» را از حالت انتشار خارج کنید؟`
                : `آیا از بایگانی دوره «${confirmState.course.title}» اطمینان دارید؟`
            : ''
        }
      />

      {/* Preview Course Outline Modal */}
      <AdminModal
        open={previewLoading || Boolean(previewData)}
        onClose={() => setPreviewData(null)}
        title={previewData ? `پیش‌نمایش دوره: ${previewData.course.title}` : 'در حال بارگذاری پیش‌نمایش...'}
        maxWidthClass="max-w-2xl"
      >
        {previewLoading ? (
          <div className="py-10 text-center text-sm text-slate-500">در حال دریافت پیش‌نمایش...</div>
        ) : (
          previewData && (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-slate-900">{previewData.course.title}</span>
                  <PublicationStatusLabel status={previewData.course.status} />
                </div>
                <p className="text-xs text-slate-600">{previewData.course.summary}</p>
              </div>
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-700">ساختار فصل‌ها و درس‌ها</h3>
                {previewData.outline.length === 0 ? (
                  <p className="text-xs text-slate-500">هنوز فصلی برای این دوره ثبت نشده است.</p>
                ) : (
                  previewData.outline.map((ch) => (
                    <div key={ch.id} className="border border-slate-200 rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                        <span>{ch.title}</span>
                        <PublicationStatusLabel status={ch.status} />
                      </div>
                      {ch.lessons.length > 0 ? (
                        <ul className="space-y-1 pr-3 border-r border-slate-200">
                          {ch.lessons.map((l) => (
                            <li
                              key={l.id}
                              className="flex items-center justify-between text-xs text-slate-600 py-0.5"
                            >
                              <Link
                                href={`/admin/lessons/${l.id}`}
                                className="hover:text-emerald-700 hover:underline"
                              >
                                {l.title}
                              </Link>
                              <PublicationStatusLabel status={l.status} />
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-[11px] text-slate-400">بدون درس</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )
        )}
      </AdminModal>
    </div>
  );
}

export default function AdminCoursesPage() {
  return (
    <AdminGuard requiredPermission="courses:read">
      <CoursesListContent />
    </AdminGuard>
  );
}
