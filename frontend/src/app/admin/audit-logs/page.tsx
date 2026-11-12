'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { FileCheck, Search } from 'lucide-react';
import { AUDIT_ACTIONS, AUDIT_RESULTS } from '@techa/shared';
import AdminGuard from '../../../components/admin/auth/AdminGuard';
import { AdminInput, AdminSelect } from '../../../components/admin/ui/AdminFormFields';
import {
  AdminButton,
  AdminDrawer,
  AdminEmptyState,
  AdminErrorState,
  AdminPageHeader,
  AdminPagination,
  AuditResultLabel,
} from '../../../components/admin/ui/AdminPrimitives';
import { adminClient } from '../../../lib/admin/admin-client';
import {
  AUDIT_ACTION_LABELS,
  AUDIT_RESULT_LABELS,
  USER_ROLE_LABELS,
  formatPersianDateTime,
} from '../../../lib/admin/admin-formatters';
import { AdminAuditLogDto, PaginationMeta } from '../../../lib/admin/admin-types';

const RESOURCE_TYPE_OPTIONS = [
  'course',
  'chapter',
  'lesson',
  'media',
  'site_page',
  'site_settings',
  'user',
  'auth_session',
  'content_revision',
];

function AuditLogsContent() {
  const [logs, setLogs] = useState<AdminAuditLogDto[]>([]);
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
  const [action, setAction] = useState('');
  const [resourceType, setResourceType] = useState('');
  const [result, setResult] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [order, setOrder] = useState<'desc' | 'asc'>('desc');
  const [page, setPage] = useState(1);

  const [selectedLog, setSelectedLog] = useState<AdminAuditLogDto | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fromIso = fromDate ? new Date(`${fromDate}T00:00:00.000Z`).toISOString() : undefined;
      const toIso = toDate ? new Date(`${toDate}T23:59:59.999Z`).toISOString() : undefined;
      const res = await adminClient.listAuditLogs({
        page,
        limit: 20,
        q: q.trim() || undefined,
        action: action || undefined,
        resourceType: resourceType || undefined,
        result: result || undefined,
        from: fromIso,
        to: toIso,
        order,
      });
      setLogs(res.items);
      setPagination(res.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در دریافت گزارش‌های ممیزی');
    } finally {
      setLoading(false);
    }
  }, [page, q, action, resourceType, result, fromDate, toDate, order]);

  useEffect(() => {
    void fetchLogs();
  }, [fetchLogs]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="گزارش‌های ممیزی و رویدادها (Audit Logs)"
        description="ثبت تغییرناپذیر تمام عملیات مدیریتی، امنیتی، تغییرات محتوا و دسترسی‌ها"
        breadcrumbs={[{ label: 'داشبورد', href: '/admin' }, { label: 'گزارش‌های ممیزی' }]}
      />

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <AdminInput
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              placeholder="جستجو در شرح یا شناسه درخواست..."
              className="pl-9"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <AdminSelect
            value={action}
            onChange={(e) => {
              setAction(e.target.value);
              setPage(1);
            }}
          >
            <option value="">همه عملیات‌ها</option>
            {AUDIT_ACTIONS.map((a) => (
              <option key={a} value={a}>
                {AUDIT_ACTION_LABELS[a]}
              </option>
            ))}
          </AdminSelect>

          <AdminSelect
            value={resourceType}
            onChange={(e) => {
              setResourceType(e.target.value);
              setPage(1);
            }}
          >
            <option value="">همه منابع</option>
            {RESOURCE_TYPE_OPTIONS.map((rt) => (
              <option key={rt} value={rt}>
                {rt}
              </option>
            ))}
          </AdminSelect>

          <AdminSelect
            value={result}
            onChange={(e) => {
              setResult(e.target.value);
              setPage(1);
            }}
          >
            <option value="">همه نتایج</option>
            {AUDIT_RESULTS.map((resOpt) => (
              <option key={resOpt} value={resOpt}>
                {AUDIT_RESULT_LABELS[resOpt]}
              </option>
            ))}
          </AdminSelect>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">از تاریخ</label>
            <AdminInput
              type="date"
              dir="ltr"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">تا تاریخ</label>
            <AdminInput
              type="date"
              dir="ltr"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">ترتیب زمانی</label>
            <AdminSelect
              value={order}
              onChange={(e) => {
                setOrder(e.target.value as 'desc' | 'asc');
                setPage(1);
              }}
            >
              <option value="desc">جدیدترین ابتدا</option>
              <option value="asc">قدیمی‌ترین ابتدا</option>
            </AdminSelect>
          </div>
          <div className="flex justify-end">
            <AdminButton
              variant="outline"
              onClick={() => {
                setQ('');
                setAction('');
                setResourceType('');
                setResult('');
                setFromDate('');
                setToDate('');
                setOrder('desc');
                setPage(1);
              }}
              className="w-full sm:w-auto"
            >
              بازنشانی فیلترها
            </AdminButton>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-3 animate-pulse">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="h-11 bg-slate-100 rounded" />
          ))}
        </div>
      ) : error ? (
        <AdminErrorState message={error} onRetry={fetchLogs} />
      ) : logs.length === 0 ? (
        <AdminEmptyState
          title="گزارش ممیزی یافت نشد"
          description="هیچ رویدادی مطابق فیلترهای انتخاب‌شده پیدا نشد."
          icon={<FileCheck className="w-6 h-6" />}
        />
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <th className="px-4 py-3 font-semibold">عملیات</th>
                  <th className="px-4 py-3 font-semibold">منبع</th>
                  <th className="px-4 py-3 font-semibold">خلاصه رویداد</th>
                  <th className="px-4 py-3 font-semibold">نقش عامل</th>
                  <th className="px-4 py-3 font-semibold">نتیجه</th>
                  <th className="px-4 py-3 font-semibold">زمان</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 font-semibold text-slate-900 whitespace-nowrap">
                      {AUDIT_ACTION_LABELS[log.action] || log.action}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-700">
                      <span>{log.resourceType}</span>
                      <span dir="ltr" className="block font-mono text-[10px] text-slate-400">
                        {log.resourceId}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-md truncate text-slate-700">
                      {log.changeSummary}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                      {USER_ROLE_LABELS[log.actorRole] || log.actorRole}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <AuditResultLabel result={log.result} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap tabular-nums text-slate-500">
                      {formatPersianDateTime(log.createdAt)}
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

      {/* Audit Detail Drawer */}
      <AdminDrawer
        open={Boolean(selectedLog)}
        onClose={() => setSelectedLog(null)}
        title={selectedLog ? `جزئیات گزارش ممیزی (${AUDIT_ACTION_LABELS[selectedLog.action] || selectedLog.action})` : ''}
        subtitle={selectedLog ? formatPersianDateTime(selectedLog.createdAt) : undefined}
        widthClass="max-w-xl"
      >
        {selectedLog && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 bg-slate-50 border border-slate-200 rounded-lg p-4">
              <div>
                <span className="text-slate-500 block">نتیجه</span>
                <div className="mt-1">
                  <AuditResultLabel result={selectedLog.result} />
                </div>
              </div>
              <div>
                <span className="text-slate-500 block">نقش عامل</span>
                <strong className="text-slate-900 mt-1 block">
                  {USER_ROLE_LABELS[selectedLog.actorRole] || selectedLog.actorRole}
                </strong>
              </div>
              <div>
                <span className="text-slate-500 block">شناسه عامل (Actor ID)</span>
                <span dir="ltr" className="font-mono text-slate-800 mt-1 block break-all">
                  {selectedLog.actorUserId || 'system'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">شناسه درخواست (Request ID)</span>
                <span dir="ltr" className="font-mono text-slate-800 mt-1 block break-all">
                  {selectedLog.requestId}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">نوع منبع</span>
                <span className="text-slate-900 font-medium mt-1 block">{selectedLog.resourceType}</span>
              </div>
              <div>
                <span className="text-slate-500 block">شناسه منبع</span>
                <span dir="ltr" className="font-mono text-slate-800 mt-1 block break-all">
                  {selectedLog.resourceId}
                </span>
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg p-4 space-y-2">
              <span className="text-slate-500 block font-semibold">شرح رویداد</span>
              <p className="text-slate-800 leading-relaxed text-sm">{selectedLog.changeSummary}</p>
            </div>

            <div className="border border-slate-200 rounded-lg p-4 space-y-2">
              <span className="text-slate-500 block font-semibold">فیلدهای تغییریافته</span>
              {selectedLog.changedFields.length === 0 ? (
                <p className="text-slate-400">فیلد مشخصی ثبت نشده است.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5" dir="ltr">
                  {selectedLog.changedFields.map((field) => (
                    <span
                      key={field}
                      className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-[11px] text-slate-800"
                    >
                      {field}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </AdminDrawer>
    </div>
  );
}

export default function AdminAuditLogsPage() {
  return (
    <AdminGuard requiredPermission="audit:read">
      <AuditLogsContent />
    </AdminGuard>
  );
}
