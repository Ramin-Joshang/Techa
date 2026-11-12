'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Archive,
  CheckCircle2,
  FileText,
  Pencil,
  Plus,
  Search,
  XCircle,
} from 'lucide-react';
import { PUBLICATION_STATUSES } from '@techa/shared';
import AdminGuard from '../../../components/admin/auth/AdminGuard';
import {
  AdminConfirmModal,
  AdminEmptyState,
  AdminErrorState,
  AdminPageHeader,
  AdminPagination,
  PublicationStatusLabel,
} from '../../../components/admin/ui/AdminPrimitives';
import { AdminInput, AdminSelect } from '../../../components/admin/ui/AdminFormFields';
import { useAdminToast } from '../../../components/admin/ui/ToastProvider';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import { adminClient } from '../../../lib/admin/admin-client';
import {
  PUBLICATION_STATUS_LABELS,
  formatPersianDateTime,
  formatPersianNumber,
} from '../../../lib/admin/admin-formatters';
import { AdminSitePageDto, PaginationMeta } from '../../../lib/admin/admin-types';

function PagesListContent() {
  const { hasPermission } = useAdminAuth();
  const toast = useAdminToast();

  const [pages, setPages] = useState<AdminSitePageDto[]>([]);
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
  const [page, setPage] = useState(1);

  const [confirmState, setConfirmState] = useState<{
    sitePage: AdminSitePageDto;
    action: 'publish' | 'unpublish' | 'archive';
  } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminClient.listPages({
        page,
        limit: 20,
        q: q.trim() || undefined,
        status: status || undefined,
      });
      setPages(res.items);
      setPagination(res.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در بارگذاری فهرست صفحات');
    } finally {
      setLoading(false);
    }
  }, [page, q, status]);

  useEffect(() => {
    void fetchPages();
  }, [fetchPages]);

  const handleLifecycle = async () => {
    if (!confirmState) return;
    setActionLoading(true);
    try {
      const { sitePage, action } = confirmState;
      const updated =
        action === 'publish'
          ? await adminClient.publishPage(sitePage.id, { expectedVersion: sitePage.version })
          : action === 'unpublish'
            ? await adminClient.unpublishPage(sitePage.id, { expectedVersion: sitePage.version })
            : await adminClient.archivePage(sitePage.id, { expectedVersion: sitePage.version });
      setPages((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      setConfirmState(null);
      toast.success('وضعیت صفحه به‌روزرسانی شد');
    } catch (err) {
      toast.error('عملیات ناموفق بود', err instanceof Error ? err.message : undefined);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="مدیریت صفحات سایت"
        description="مدیریت صفحه اصلی (Home) و سایر صفحات محتوایی پلتفرم"
        breadcrumbs={[{ label: 'داشبورد', href: '/admin' }, { label: 'صفحات سایت' }]}
        actions={
          hasPermission('pages:create') && (
            <Link
              href="/admin/pages/new"
              className="inline-flex items-center gap-2 min-h-[40px] px-4 py-2 rounded-lg bg-[#042A1B] hover:bg-[#063b26] text-white text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>صفحه جدید</span>
            </Link>
          )
        }
      />

      <div className="bg-white border border-slate-200 rounded-lg p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative sm:col-span-2">
          <AdminInput
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="جستجو در عنوان یا pageKey..."
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
      </div>

      {loading ? (
        <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-3 animate-pulse">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-12 bg-slate-100 rounded" />
          ))}
        </div>
      ) : error ? (
        <AdminErrorState message={error} onRetry={fetchPages} />
      ) : pages.length === 0 ? (
        <AdminEmptyState
          title="صفحه‌ای ثبت نشده است"
          description="می‌توانید صفحه اصلی (home) یا صفحات راهنمای جدید ایجاد کنید."
          icon={<FileText className="w-6 h-6" />}
          action={
            hasPermission('pages:create') ? (
              <Link
                href="/admin/pages/new"
                className="inline-flex items-center gap-2 min-h-[40px] px-4 py-2 rounded-lg bg-[#042A1B] text-white text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                <span>ایجاد صفحه جدید</span>
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
                  <th className="px-4 py-3 font-semibold">عنوان صفحه</th>
                  <th className="px-4 py-3 font-semibold">pageKey</th>
                  <th className="px-4 py-3 font-semibold">وضعیت</th>
                  <th className="px-4 py-3 font-semibold">بلوک‌ها</th>
                  <th className="px-4 py-3 font-semibold">نسخه</th>
                  <th className="px-4 py-3 font-semibold">آخرین ویرایش</th>
                  <th className="px-4 py-3 font-semibold">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pages.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3.5 font-bold text-slate-900">
                      <Link href={`/admin/pages/${p.id}`} className="hover:text-emerald-700">
                        {p.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-600" dir="ltr">
                      {p.pageKey}
                    </td>
                    <td className="px-4 py-3.5">
                      <PublicationStatusLabel status={p.status} />
                    </td>
                    <td className="px-4 py-3.5 tabular-nums text-slate-600">
                      {formatPersianNumber(p.contentBlocks?.length || 0)}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-600 tabular-nums">
                      v{p.version}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 tabular-nums">
                      {formatPersianDateTime(p.updatedAt)}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/admin/pages/${p.id}`}
                          className="p-2 rounded-md border border-slate-200 bg-white hover:bg-slate-100 text-slate-700"
                          title="ویرایش صفحه"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Link>
                        {hasPermission('pages:publish') && p.status !== 'published' && (
                          <button
                            type="button"
                            onClick={() => setConfirmState({ sitePage: p, action: 'publish' })}
                            className="p-2 rounded-md border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                            title="انتشار"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {hasPermission('pages:publish') && p.status === 'published' && (
                          <button
                            type="button"
                            onClick={() => setConfirmState({ sitePage: p, action: 'unpublish' })}
                            className="p-2 rounded-md border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100"
                            title="لغو انتشار"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {hasPermission('pages:archive') && p.status !== 'archived' && (
                          <button
                            type="button"
                            onClick={() => setConfirmState({ sitePage: p, action: 'archive' })}
                            className="p-2 rounded-md border border-slate-200 text-slate-600 hover:text-red-700 hover:bg-red-50"
                            title="بایگانی"
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

      <AdminConfirmModal
        open={Boolean(confirmState)}
        onClose={() => setConfirmState(null)}
        onConfirm={handleLifecycle}
        isLoading={actionLoading}
        variant={confirmState?.action === 'archive' ? 'danger' : 'primary'}
        title="تأیید تغییر وضعیت صفحه"
        message={
          confirmState
            ? `آیا از انجام این عملیات برای صفحه «${confirmState.sitePage.title}» اطمینان دارید؟`
            : ''
        }
      />
    </div>
  );
}

export default function AdminPagesListPage() {
  return (
    <AdminGuard requiredPermission="pages:read">
      <PagesListContent />
    </AdminGuard>
  );
}
