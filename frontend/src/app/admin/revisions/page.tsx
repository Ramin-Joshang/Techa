'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  Eye,
  GitCompare,
  History,
  RotateCcw,
  Search,
} from 'lucide-react';
import { REVISION_RESOURCE_TYPES, RevisionResourceType } from '@techa/shared';
import AdminGuard from '../../../components/admin/auth/AdminGuard';
import { AdminField, AdminInput, AdminSelect } from '../../../components/admin/ui/AdminFormFields';
import {
  AdminButton,
  AdminConfirmModal,
  AdminDrawer,
  AdminEmptyState,
  AdminErrorState,
  AdminModal,
  AdminPageHeader,
  AdminPagination,
} from '../../../components/admin/ui/AdminPrimitives';
import { useAdminToast } from '../../../components/admin/ui/ToastProvider';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import { adminClient } from '../../../lib/admin/admin-client';
import {
  REVISION_RESOURCE_LABELS,
  RevisionFieldDiff,
  diffRevisionSnapshots,
  formatPersianDateTime,
  formatPersianNumber,
} from '../../../lib/admin/admin-formatters';
import { AdminContentRevisionDto, PaginationMeta } from '../../../lib/admin/admin-types';

function formatDiffValue(val: unknown): string {
  if (val === undefined) return '— (حذف/ندارد)';
  if (val === null) return 'null';
  if (typeof val === 'string') return val;
  try {
    return JSON.stringify(val, null, 2);
  } catch {
    return String(val);
  }
}

function RevisionsContent() {
  const { hasPermission } = useAdminAuth();
  const canRestore = hasPermission('revisions:restore');
  const toast = useAdminToast();

  const [revisions, setRevisions] = useState<AdminContentRevisionDto[]>([]);
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

  const [resourceType, setResourceType] = useState<string>('');
  const [resourceId, setResourceId] = useState<string>('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [initializedFromQuery, setInitializedFromQuery] = useState(false);

  // Snapshot inspector drawer
  const [inspectedRevision, setInspectedRevision] = useState<AdminContentRevisionDto | null>(null);
  const [inspectLoading, setInspectLoading] = useState(false);

  // Diff comparison state
  const [diffModalOpen, setDiffModalOpen] = useState(false);
  const [diffLeft, setDiffLeft] = useState<AdminContentRevisionDto | null>(null);
  const [diffRight, setDiffRight] = useState<AdminContentRevisionDto | null>(null);
  const [diffCandidates, setDiffCandidates] = useState<AdminContentRevisionDto[]>([]);
  const [diffOnlyChanges, setDiffOnlyChanges] = useState(true);
  const [diffLoading, setDiffLoading] = useState(false);

  // Restore modal state
  const [restoreTarget, setRestoreTarget] = useState<AdminContentRevisionDto | null>(null);
  const [restoreSummary, setRestoreSummary] = useState('');
  const [restoring, setRestoring] = useState(false);

  // Safely hydrate optional ?resourceType=...&resourceId=... without Next 16 useSearchParams static bailout
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const sp = new URLSearchParams(window.location.search);
      const rt = sp.get('resourceType');
      const rid = sp.get('resourceId');
      if (rt && (REVISION_RESOURCE_TYPES as readonly string[]).includes(rt)) {
        setResourceType(rt);
      }
      if (rid) {
        setResourceId(rid.trim());
      }
    }
    setInitializedFromQuery(true);
  }, []);

  const fetchRevisions = useCallback(async () => {
    if (!initializedFromQuery) return;
    setLoading(true);
    setError(null);
    try {
      const res = await adminClient.listAllRevisions({
        page,
        limit: 20,
        q: q.trim() || undefined,
        resourceType: (resourceType as RevisionResourceType) || undefined,
        resourceId: resourceId.trim() || undefined,
      });
      setRevisions(res.items);
      setPagination(res.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در بارگذاری تاریخچه نسخه‌ها');
    } finally {
      setLoading(false);
    }
  }, [initializedFromQuery, page, q, resourceType, resourceId]);

  useEffect(() => {
    void fetchRevisions();
  }, [fetchRevisions]);

  const openInspector = async (rev: AdminContentRevisionDto) => {
    setInspectedRevision(rev);
    setInspectLoading(true);
    try {
      const full = await adminClient.getRevision(rev.id);
      setInspectedRevision(full);
    } catch (err) {
      toast.error('خطا در دریافت جزئیات نسخه', err instanceof Error ? err.message : undefined);
    } finally {
      setInspectLoading(false);
    }
  };

  const openDiffCompare = async (rev: AdminContentRevisionDto) => {
    setDiffModalOpen(true);
    setDiffLoading(true);
    setDiffRight(rev);
    setDiffLeft(null);
    try {
      const [fullRev, siblingsRes] = await Promise.all([
        adminClient.getRevision(rev.id),
        adminClient.listResourceRevisions(rev.resourceType, rev.resourceId, { page: 1, limit: 30 }),
      ]);
      setDiffRight(fullRev);
      setDiffCandidates(siblingsRes.items);
      // Pick previous revision (lower revisionNumber) by default if present
      const previous =
        siblingsRes.items.find((item) => item.revisionNumber < fullRev.revisionNumber) ||
        siblingsRes.items.find((item) => item.id !== fullRev.id) ||
        null;
      if (previous) {
        const fullPrev = await adminClient.getRevision(previous.id).catch(() => previous);
        setDiffLeft(fullPrev);
      }
    } catch (err) {
      toast.error('خطا در بارگذاری نسخه‌های منبع برای مقایسه', err instanceof Error ? err.message : undefined);
    } finally {
      setDiffLoading(false);
    }
  };

  const handleSelectLeftRevision = async (revId: string) => {
    const candidate = diffCandidates.find((c) => c.id === revId);
    if (!candidate) return;
    try {
      const full = await adminClient.getRevision(candidate.id);
      setDiffLeft(full);
    } catch {
      setDiffLeft(candidate);
    }
  };

  const handleRestoreConfirm = async () => {
    if (!restoreTarget) return;
    setRestoring(true);
    try {
      await adminClient.restoreRevision(restoreTarget.id, {
        changeSummary: restoreSummary.trim() || undefined,
      });
      toast.success(
        'نسخه با موفقیت بازگردانی شد',
        `نسخه #${formatPersianNumber(restoreTarget.revisionNumber)} روی منبع اعمال گردید.`
      );
      setRestoreTarget(null);
      setRestoreSummary('');
      await fetchRevisions();
    } catch (err) {
      toast.error('بازگردانی نسخه ناموفق بود', err instanceof Error ? err.message : undefined);
    } finally {
      setRestoring(false);
    }
  };

  const diffs: RevisionFieldDiff[] =
    diffLeft && diffRight ? diffRevisionSnapshots(diffLeft.snapshot, diffRight.snapshot) : [];
  const displayedDiffs = diffOnlyChanges ? diffs.filter((d) => d.status !== 'unchanged') : diffs;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="تاریخچه نسخه‌ها (Revisions)"
        description="بررسی اسنپ‌شات نسخه‌های قبلی دوره‌ها، فصل‌ها، درس‌ها، صفحات و تنظیمات سایت، مقایسه تفاوت‌ها و بازگردانی"
        breadcrumbs={[{ label: 'داشبورد', href: '/admin' }, { label: 'تاریخچه نسخه‌ها' }]}
      />

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative">
          <AdminInput
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="جستجو در خلاصه تغییر یا شناسه..."
            className="pl-9"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <AdminSelect
          value={resourceType}
          onChange={(e) => {
            setResourceType(e.target.value);
            setPage(1);
          }}
        >
          <option value="">همه انواع منبع</option>
          {REVISION_RESOURCE_TYPES.map((rt) => (
            <option key={rt} value={rt}>
              {REVISION_RESOURCE_LABELS[rt]}
            </option>
          ))}
        </AdminSelect>

        <AdminInput
          dir="ltr"
          value={resourceId}
          onChange={(e) => {
            setResourceId(e.target.value);
            setPage(1);
          }}
          placeholder="فیلتر بر اساس Resource ID..."
          className="font-mono text-xs"
        />

        <div className="flex items-center justify-end">
          <AdminButton
            variant="outline"
            onClick={() => {
              setQ('');
              setResourceType('');
              setResourceId('');
              setPage(1);
            }}
            className="w-full sm:w-auto"
          >
            پاک کردن فیلترها
          </AdminButton>
        </div>
      </div>

      {loading ? (
        <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-3 animate-pulse">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-12 bg-slate-100 rounded" />
          ))}
        </div>
      ) : error ? (
        <AdminErrorState message={error} onRetry={fetchRevisions} />
      ) : revisions.length === 0 ? (
        <AdminEmptyState
          title="نسخه‌ای یافت نشد"
          description="هیچ نسخه ثبت‌شده‌ای مطابق فیلترهای فعلی وجود ندارد."
          icon={<History className="w-6 h-6" />}
        />
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <th className="px-4 py-3 font-semibold">شماره نسخه</th>
                  <th className="px-4 py-3 font-semibold">نوع منبع</th>
                  <th className="px-4 py-3 font-semibold">شناسه منبع</th>
                  <th className="px-4 py-3 font-semibold">خلاصه تغییر</th>
                  <th className="px-4 py-3 font-semibold">هش محتوا</th>
                  <th className="px-4 py-3 font-semibold">تاریخ ثبت</th>
                  <th className="px-4 py-3 font-semibold">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {revisions.map((rev) => (
                  <tr key={rev.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3.5 font-mono font-bold text-slate-900 whitespace-nowrap tabular-nums">
                      #{rev.revisionNumber}
                    </td>
                    <td className="px-4 py-3.5 text-slate-700 whitespace-nowrap">
                      {REVISION_RESOURCE_LABELS[rev.resourceType] || rev.resourceType}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => {
                          setResourceType(rev.resourceType);
                          setResourceId(rev.resourceId);
                          setPage(1);
                        }}
                        className="font-mono text-[11px] text-emerald-700 hover:underline"
                        title="فیلتر همه نسخه‌های این منبع"
                      >
                        {rev.resourceId}
                      </button>
                    </td>
                    <td className="px-4 py-3.5 max-w-xs truncate text-slate-800">
                      {rev.changeSummary || '—'}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-[11px] text-slate-400 whitespace-nowrap" dir="ltr">
                      {rev.contentHash.slice(0, 12)}...
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap tabular-nums">
                      {formatPersianDateTime(rev.createdAt)}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openInspector(rev)}
                          className="p-2 rounded-md border border-slate-200 bg-white hover:bg-slate-100 text-slate-700"
                          title="مشاهده اسنپ‌شات"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openDiffCompare(rev)}
                          className="p-2 rounded-md border border-slate-200 bg-white hover:bg-slate-100 text-slate-700"
                          title="مقایسه تفاوت‌ها (Diff)"
                        >
                          <GitCompare className="w-3.5 h-3.5" />
                        </button>
                        {canRestore && (
                          <button
                            type="button"
                            onClick={() => setRestoreTarget(rev)}
                            className="p-2 rounded-md border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800"
                            title="بازگردانی به این نسخه"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
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

      {/* Snapshot Drawer */}
      <AdminDrawer
        open={Boolean(inspectedRevision)}
        onClose={() => setInspectedRevision(null)}
        title={
          inspectedRevision
            ? `اسنپ‌شات نسخه #${inspectedRevision.revisionNumber}`
            : 'مشاهده نسخه'
        }
        subtitle={
          inspectedRevision
            ? `${REVISION_RESOURCE_LABELS[inspectedRevision.resourceType]} · ${inspectedRevision.resourceId}`
            : undefined
        }
        widthClass="max-w-2xl"
      >
        {inspectedRevision && (
          <div className="space-y-4">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 text-xs space-y-1.5">
              <div>
                <span className="text-slate-500">خلاصه تغییر: </span>
                <strong className="text-slate-900">{inspectedRevision.changeSummary}</strong>
              </div>
              <div>
                <span className="text-slate-500">تاریخ ثبت: </span>
                <span className="tabular-nums text-slate-800">
                  {formatPersianDateTime(inspectedRevision.createdAt)}
                </span>
              </div>
              <div className="break-all">
                <span className="text-slate-500">SHA-256: </span>
                <span dir="ltr" className="font-mono text-[11px] text-slate-700">
                  {inspectedRevision.contentHash}
                </span>
              </div>
            </div>

            {inspectLoading ? (
              <div className="text-xs text-slate-500 py-8 text-center">در حال بارگذاری کامل اسنپ‌شات...</div>
            ) : (
              <pre
                dir="ltr"
                className="bg-slate-950 text-slate-100 rounded-lg p-4 text-xs font-mono overflow-auto max-h-[65vh] leading-relaxed"
              >
                {JSON.stringify(inspectedRevision.snapshot, null, 2)}
              </pre>
            )}
          </div>
        )}
      </AdminDrawer>

      {/* Diff Compare Modal */}
      <AdminModal
        open={diffModalOpen}
        onClose={() => setDiffModalOpen(false)}
        title="مقایسه تفاوت نسخه‌ها (Revision Diff)"
        description={
          diffRight
            ? `${REVISION_RESOURCE_LABELS[diffRight.resourceType]} · ${diffRight.resourceId}`
            : undefined
        }
        maxWidthClass="max-w-4xl"
      >
        {diffLoading ? (
          <div className="py-12 text-center text-sm text-slate-500">
            در حال بارگذاری نسخه‌های منبع برای مقایسه...
          </div>
        ) : !diffRight ? null : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-3 bg-slate-50 border border-slate-200 rounded-lg p-3">
              <div className="flex flex-wrap items-center gap-3">
                <AdminField label="نسخه مبنا (قدیمی‌تر)">
                  <AdminSelect
                    value={diffLeft?.id || ''}
                    onChange={(e) => handleSelectLeftRevision(e.target.value)}
                    className="min-w-[220px] text-xs"
                  >
                    <option value="">انتخاب نسخه جهت مقایسه...</option>
                    {diffCandidates
                      .filter((c) => c.id !== diffRight.id)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          #{c.revisionNumber} — {c.changeSummary.slice(0, 40)}
                        </option>
                      ))}
                  </AdminSelect>
                </AdminField>

                <div className="text-xs text-slate-600 pt-5">
                  در برابر نسخه هدف:{' '}
                  <strong className="font-mono text-slate-900">#{diffRight.revisionNumber}</strong>
                </div>
              </div>

              <label className="inline-flex items-center gap-2 text-xs text-slate-700 pb-2">
                <input
                  type="checkbox"
                  checked={diffOnlyChanges}
                  onChange={(e) => setDiffOnlyChanges(e.target.checked)}
                />
                <span>فقط فیلدهای تغییریافته نمایش داده شوند</span>
              </label>
            </div>

            {!diffLeft ? (
              <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-lg">
                نسخه دیگری برای این منبع جهت مقایسه وجود ندارد یا انتخاب نشده است.
              </div>
            ) : displayedDiffs.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 border border-slate-200 rounded-lg">
                تفاوتی بین دو نسخه انتخاب‌شده مشاهده نشد.
              </div>
            ) : (
              <div className="space-y-3">
                {displayedDiffs.map((diff) => {
                  const statusLabel =
                    diff.status === 'added'
                      ? 'افزوده‌شده'
                      : diff.status === 'removed'
                        ? 'حذف‌شده'
                        : diff.status === 'changed'
                          ? 'تغییریافته'
                          : 'بدون تغییر';
                  const badgeClass =
                    diff.status === 'added'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : diff.status === 'removed'
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : diff.status === 'changed'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-slate-50 text-slate-500 border-slate-200';

                  return (
                    <div key={diff.key} className="border border-slate-200 rounded-lg overflow-hidden">
                      <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                        <span dir="ltr" className="font-mono text-xs font-bold text-slate-900">
                          {diff.key}
                        </span>
                        <span className={`px-2 py-0.5 rounded border text-[11px] font-medium ${badgeClass}`}>
                          {statusLabel}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x md:divide-x-reverse divide-slate-200 text-xs">
                        <div className="p-3 bg-red-50/20">
                          <div className="text-[11px] text-slate-500 mb-1">
                            نسخه #{diffLeft.revisionNumber}
                          </div>
                          <pre
                            dir="ltr"
                            className="font-mono text-[11px] text-slate-700 whitespace-pre-wrap break-words max-h-60 overflow-auto"
                          >
                            {formatDiffValue(diff.beforeValue)}
                          </pre>
                        </div>
                        <div className="p-3 bg-emerald-50/20">
                          <div className="text-[11px] text-slate-500 mb-1">
                            نسخه #{diffRight.revisionNumber}
                          </div>
                          <pre
                            dir="ltr"
                            className="font-mono text-[11px] text-slate-800 whitespace-pre-wrap break-words max-h-60 overflow-auto"
                          >
                            {formatDiffValue(diff.afterValue)}
                          </pre>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </AdminModal>

      {/* Restore Confirmation Modal */}
      <AdminConfirmModal
        open={Boolean(restoreTarget)}
        onClose={() => setRestoreTarget(null)}
        onConfirm={handleRestoreConfirm}
        isLoading={restoring}
        variant="secondary"
        title="تأیید بازگردانی نسخه"
        confirmLabel="بازگردانی نسخه"
        message={
          restoreTarget
            ? `آیا از بازگردانی منبع به نسخه #${formatPersianNumber(restoreTarget.revisionNumber)} اطمینان دارید؟ یک نسخه جدید از وضعیت بازگردانی‌شده ثبت خواهد شد.`
            : ''
        }
      >
        <AdminField label="توضیح بازگردانی (اختیاری)">
          <AdminInput
            value={restoreSummary}
            onChange={(e) => setRestoreSummary(e.target.value)}
            placeholder="مثلاً: بازگردانی به نسخه پایدار قبل از ویرایش اشتباه"
          />
        </AdminField>
      </AdminConfirmModal>
    </div>
  );
}

export default function AdminRevisionsPage() {
  return (
    <AdminGuard requiredPermission="revisions:read">
      <RevisionsContent />
    </AdminGuard>
  );
}
