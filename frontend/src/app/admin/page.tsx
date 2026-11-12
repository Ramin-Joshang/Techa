'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  FileText,
  Image as ImageIcon,
  Layers,
  Plus,
  RefreshCw,
  Settings,
  ShieldCheck,
  Users,
  History,
  ArrowUpLeft,
} from 'lucide-react';
import AdminGuard, { AdminGuardLoadingSkeleton } from '../../components/admin/auth/AdminGuard';
import {
  AdminButton,
  AdminEmptyState,
  AdminErrorState,
  AdminPageHeader,
  AuditResultLabel,
} from '../../components/admin/ui/AdminPrimitives';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { adminClient } from '../../lib/admin/admin-client';
import {
  AUDIT_ACTION_LABELS,
  USER_ROLE_LABELS,
  formatBytes,
  formatPersianDateTime,
  formatPersianNumber,
} from '../../lib/admin/admin-formatters';
import {
  AdminAuditLogDto,
  AdminDashboardSummaryDto,
  ReadinessResponse,
} from '../../lib/admin/admin-types';

const RESOURCE_TYPE_LABELS: Record<string, string> = {
  course: 'دوره',
  chapter: 'فصل',
  lesson: 'درس',
  media_asset: 'رسانه',
  site_page: 'صفحه سایت',
  site_settings: 'تنظیمات سایت',
  user: 'کاربر',
  revision: 'نسخه',
};

function getResourceHref(resourceType: string, resourceId: string): string | null {
  if (!resourceId) return null;
  switch (resourceType) {
    case 'course':
      return `/admin/courses/${resourceId}`;
    case 'chapter':
      return `/admin/chapters/${resourceId}`;
    case 'lesson':
      return `/admin/lessons/${resourceId}`;
    case 'site_page':
      return `/admin/pages/${resourceId}`;
    case 'site_settings':
      return '/admin/settings';
    case 'user':
      return `/admin/users/${resourceId}`;
    case 'media_asset':
      return '/admin/media';
    default:
      return null;
  }
}

function DashboardContent() {
  const { hasPermission } = useAdminAuth();
  const [summary, setSummary] = useState<AdminDashboardSummaryDto | null>(null);
  const [readiness, setReadiness] = useState<ReadinessResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [summaryData, readinessData] = await Promise.all([
        adminClient.getDashboardSummary(),
        adminClient.getReadiness(),
      ]);
      setSummary(summaryData);
      setReadiness(readinessData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در بارگذاری خلاصه داشبورد');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  if (loading) {
    return <AdminGuardLoadingSkeleton />;
  }

  if (error || !summary) {
    return (
      <div className="space-y-6">
        <AdminPageHeader
          title="داشبورد مدیریت"
          description="نمای کلی وضعیت دوره‌ها، رسانه‌ها، صفحات، کاربران و فعالیت‌های اخیر"
          breadcrumbs={[{ label: 'پنل مدیریت' }]}
        />
        <AdminErrorState
          message={error || 'اطلاعات داشبورد در دسترس نیست.'}
          onRetry={loadDashboard}
        />
      </div>
    );
  }

  const recentLogs = (summary.recentAuditLogs || []) as AdminAuditLogDto[];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="داشبورد مدیریت"
        description="وضعیت واقعی دوره‌ها، درس‌ها، کتابخانه رسانه، کاربران و آخرین عملیات ثبت‌شده در سیستم"
        breadcrumbs={[{ label: 'داشبورد' }]}
        actions={
          <AdminButton
            variant="outline"
            size="sm"
            onClick={loadDashboard}
            icon={<RefreshCw className="w-4 h-4" />}
          >
            به‌روزرسانی آمار
          </AdminButton>
        }
      />

      {/* Top KPI Grid (Max 4 high-signal cards, real API data only) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">دوره‌های آموزشی</span>
            <BookOpen className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 tabular-nums">
            {formatPersianNumber(summary.courses.total)}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 tabular-nums">
            <span className="text-emerald-700 font-medium">
              {formatPersianNumber(summary.courses.published)} منتشر شده
            </span>
            <span>{formatPersianNumber(summary.courses.draft)} پیش‌نویس</span>
            <span>{formatPersianNumber(summary.courses.archived)} بایگانی</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">فصل‌ها و درس‌ها</span>
            <Layers className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 tabular-nums">
            {formatPersianNumber(summary.lessons.total)} درس
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 tabular-nums">
            <span>{formatPersianNumber(summary.chapters.total)} فصل</span>
            <span className="text-emerald-700 font-medium">
              {formatPersianNumber(summary.lessons.published)} درس منتشر شده
            </span>
            <span>{formatPersianNumber(summary.lessons.draft)} پیش‌نویس</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">کتابخانه رسانه و صفحات</span>
            <ImageIcon className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 tabular-nums">
            {formatPersianNumber(summary.media.total)} فایل
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 tabular-nums">
            <span dir="ltr" className="font-mono">
              {formatBytes(summary.media.totalBytes)}
            </span>
            <span>·</span>
            <span>
              {formatPersianNumber(summary.pages.published)} /{' '}
              {formatPersianNumber(summary.pages.total)} صفحه منتشر شده
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">کاربران و وضعیت سرویس</span>
            <Users className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 tabular-nums">
            {formatPersianNumber(summary.users.total)} کاربر
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 tabular-nums">
            <span className="text-emerald-700 font-medium">
              {formatPersianNumber(summary.users.active)} فعال
            </span>
            <span>{formatPersianNumber(summary.users.admins)} مدیر/ویرایشگر</span>
            {readiness && (
              <span
                className={
                  readiness.database === 'connected' ? 'text-emerald-700' : 'text-red-600'
                }
              >
                · {readiness.database === 'connected' ? 'MongoDB متصل' : 'MongoDB قطع'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Permission-gated Quick Actions */}
      <section className="bg-white border border-slate-200 rounded-lg p-5">
        <h2 className="text-sm font-bold text-slate-900 mb-3">دسترسی سریع</h2>
        <div className="flex flex-wrap gap-2.5">
          {hasPermission('courses:create') && (
            <Link
              href="/admin/courses/new"
              className="inline-flex items-center gap-2 min-h-[40px] px-4 py-2 rounded-lg bg-[#042A1B] hover:bg-[#063b26] text-white text-xs font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>ایجاد دوره جدید</span>
            </Link>
          )}
          {hasPermission('courses:read') && (
            <Link
              href="/admin/courses"
              className="inline-flex items-center gap-2 min-h-[40px] px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-medium transition-colors"
            >
              <BookOpen className="w-4 h-4 text-slate-500" />
              <span>فهرست دوره‌ها</span>
            </Link>
          )}
          {hasPermission('media:read') && (
            <Link
              href="/admin/media"
              className="inline-flex items-center gap-2 min-h-[40px] px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-medium transition-colors"
            >
              <ImageIcon className="w-4 h-4 text-slate-500" />
              <span>مدیریت رسانه‌ها</span>
            </Link>
          )}
          {hasPermission('pages:read') && (
            <Link
              href="/admin/pages"
              className="inline-flex items-center gap-2 min-h-[40px] px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-medium transition-colors"
            >
              <FileText className="w-4 h-4 text-slate-500" />
              <span>صفحات سایت</span>
            </Link>
          )}
          {hasPermission('settings:read') && (
            <Link
              href="/admin/settings"
              className="inline-flex items-center gap-2 min-h-[40px] px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-medium transition-colors"
            >
              <Settings className="w-4 h-4 text-slate-500" />
              <span>تنظیمات عمومی سایت</span>
            </Link>
          )}
          {hasPermission('revisions:read') && (
            <Link
              href="/admin/revisions"
              className="inline-flex items-center gap-2 min-h-[40px] px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-medium transition-colors"
            >
              <History className="w-4 h-4 text-slate-500" />
              <span>تاریخچه نسخه‌ها</span>
            </Link>
          )}
          {hasPermission('audit:read') && (
            <Link
              href="/admin/audit-logs"
              className="inline-flex items-center gap-2 min-h-[40px] px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-medium transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-slate-500" />
              <span>گزارش‌های ممیزی</span>
            </Link>
          )}
        </div>
      </section>

      {/* Recent Activity Audit Table */}
      <section className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">آخرین رویدادها و تغییرات</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              داده‌های ثبت‌شده در Audit Log واقعی سیستم
            </p>
          </div>
          {hasPermission('audit:read') && (
            <Link
              href="/admin/audit-logs"
              className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:text-emerald-800"
            >
              <span>مشاهده همه گزارش‌ها</span>
              <ArrowUpLeft className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {recentLogs.length === 0 ? (
          <div className="p-8">
            <AdminEmptyState
              title="هنوز رویدادی ثبت نشده است"
              description="با ایجاد یا ویرایش دوره‌ها، رسانه‌ها و تنظیمات، فعالیت‌ها در این بخش نمایش داده می‌شوند."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <th className="px-4 py-3 font-semibold">عملیات</th>
                  <th className="px-4 py-3 font-semibold">بخش / منبع</th>
                  <th className="px-4 py-3 font-semibold">خلاصه تغییر</th>
                  <th className="px-4 py-3 font-semibold">نقش عامل</th>
                  <th className="px-4 py-3 font-semibold">نتیجه</th>
                  <th className="px-4 py-3 font-semibold">زمان</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentLogs.map((log) => {
                  const href = getResourceHref(log.resourceType, log.resourceId);
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-900 whitespace-nowrap">
                        {AUDIT_ACTION_LABELS[log.action] || log.action}
                      </td>
                      <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                        {href ? (
                          <Link href={href} className="text-emerald-700 hover:underline font-medium">
                            {RESOURCE_TYPE_LABELS[log.resourceType] || log.resourceType}
                          </Link>
                        ) : (
                          <span>{RESOURCE_TYPE_LABELS[log.resourceType] || log.resourceType}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600 max-w-md truncate">
                        {log.changeSummary || '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        {USER_ROLE_LABELS[log.actorRole] || log.actorRole}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <AuditResultLabel result={log.result} />
                      </td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap tabular-nums">
                        {formatPersianDateTime(log.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <AdminGuard requiredPermission="dashboard:read">
      <DashboardContent />
    </AdminGuard>
  );
}
