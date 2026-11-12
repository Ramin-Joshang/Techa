'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Archive, CheckCircle2, History, XCircle } from 'lucide-react';
import { AdminCreateSitePageDto } from '@techa/shared';
import AdminGuard, { AdminGuardLoadingSkeleton } from '../../../../components/admin/auth/AdminGuard';
import {
  SitePageForm,
  SitePageFormValues,
  sitePageDtoToFormValues,
} from '../../../../components/admin/pages/SitePageForm';
import {
  AdminButton,
  AdminConfirmModal,
  AdminErrorState,
  AdminPageHeader,
  ConflictResolutionModal,
  PublicationStatusLabel,
} from '../../../../components/admin/ui/AdminPrimitives';
import { useAdminToast } from '../../../../components/admin/ui/ToastProvider';
import { useAdminAuth } from '../../../../context/AdminAuthContext';
import { adminClient, AdminApiError } from '../../../../lib/admin/admin-client';
import { AdminSitePageDto } from '../../../../lib/admin/admin-types';
import { useUnsavedChangesWarning } from '../../../../lib/admin/use-unsaved-guard';

function SitePageDetailContent() {
  const params = useParams<{ pageId: string }>();
  const pageId = params?.pageId || '';
  const { hasPermission } = useAdminAuth();
  const toast = useAdminToast();

  const [sitePage, setSitePage] = useState<AdminSitePageDto | null>(null);
  const [formValues, setFormValues] = useState<SitePageFormValues>(() =>
    sitePageDtoToFormValues(null)
  );
  const [isDirty, setIsDirty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [conflictState, setConflictState] = useState<{
    open: boolean;
    serverVersion?: number;
    message?: string;
  }>({ open: false });

  const [confirmAction, setConfirmAction] = useState<'publish' | 'unpublish' | 'archive' | null>(
    null
  );
  const [lifecycleLoading, setLifecycleLoading] = useState(false);

  useUnsavedChangesWarning(isDirty);

  const loadPage = useCallback(async () => {
    if (!pageId) return;
    setLoading(true);
    setError(null);
    try {
      const doc = await adminClient.getPage(pageId);
      setSitePage(doc);
      setFormValues(sitePageDtoToFormValues(doc));
      setIsDirty(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در دریافت اطلاعات صفحه');
    } finally {
      setLoading(false);
    }
  }, [pageId]);

  useEffect(() => {
    void loadPage();
  }, [loadPage]);

  const handleSave = async (dto: AdminCreateSitePageDto) => {
    if (!sitePage) return;
    setSubmitting(true);
    try {
      const { pageKey: _unusedKey, ...updateFields } = dto;
      const updated = await adminClient.updatePage(sitePage.id, {
        ...updateFields,
        expectedVersion: sitePage.version,
      });
      setSitePage(updated);
      setFormValues(sitePageDtoToFormValues(updated));
      setIsDirty(false);
      toast.success('صفحه با موفقیت ذخیره شد');
    } catch (err) {
      if (err instanceof AdminApiError && err.status === 409) {
        const details = err.details as { currentVersion?: number } | undefined;
        setConflictState({
          open: true,
          serverVersion: details?.currentVersion,
          message: err.message,
        });
      } else {
        toast.error('خطا در ذخیره صفحه', err instanceof Error ? err.message : undefined);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleLifecycle = async () => {
    if (!sitePage || !confirmAction) return;
    setLifecycleLoading(true);
    try {
      const updated =
        confirmAction === 'publish'
          ? await adminClient.publishPage(sitePage.id, { expectedVersion: sitePage.version })
          : confirmAction === 'unpublish'
            ? await adminClient.unpublishPage(sitePage.id, { expectedVersion: sitePage.version })
            : await adminClient.archivePage(sitePage.id, { expectedVersion: sitePage.version });
      setSitePage(updated);
      setConfirmAction(null);
      toast.success('وضعیت صفحه به‌روزرسانی شد');
    } catch (err) {
      toast.error('عملیات ناموفق بود', err instanceof Error ? err.message : undefined);
    } finally {
      setLifecycleLoading(false);
    }
  };

  if (loading) return <AdminGuardLoadingSkeleton />;
  if (error || !sitePage) {
    return <AdminErrorState message={error || 'صفحه یافت نشد.'} onRetry={loadPage} />;
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={sitePage.title}
        description={`pageKey: ${sitePage.pageKey} · نسخه v${sitePage.version}`}
        breadcrumbs={[
          { label: 'داشبورد', href: '/admin' },
          { label: 'صفحات سایت', href: '/admin/pages' },
          { label: sitePage.title },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <PublicationStatusLabel status={sitePage.status} />
            {hasPermission('revisions:read') && (
              <Link
                href={`/admin/revisions?resourceType=site_page&resourceId=${sitePage.id}`}
                className="inline-flex items-center gap-1.5 min-h-[36px] px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-medium text-slate-800"
              >
                <History className="w-4 h-4 text-slate-500" />
                <span>تاریخچه نسخه‌ها</span>
              </Link>
            )}
            {hasPermission('pages:publish') && sitePage.status !== 'published' && (
              <AdminButton
                variant="secondary"
                size="sm"
                onClick={() => setConfirmAction('publish')}
                icon={<CheckCircle2 className="w-4 h-4" />}
              >
                انتشار صفحه
              </AdminButton>
            )}
            {hasPermission('pages:publish') && sitePage.status === 'published' && (
              <AdminButton
                variant="outline"
                size="sm"
                onClick={() => setConfirmAction('unpublish')}
                icon={<XCircle className="w-4 h-4 text-amber-600" />}
              >
                لغو انتشار
              </AdminButton>
            )}
            {hasPermission('pages:archive') && sitePage.status !== 'archived' && (
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

      <SitePageForm
        values={formValues}
        onChange={(next) => {
          setFormValues(next);
          setIsDirty(true);
        }}
        onSubmit={handleSave}
        submitting={submitting}
        submitLabel="ذخیره تغییرات صفحه"
        isEdit
        readOnly={!hasPermission('pages:update')}
      />

      <ConflictResolutionModal
        open={conflictState.open}
        onClose={() => setConflictState({ open: false })}
        onReloadServer={() => {
          setConflictState({ open: false });
          void loadPage();
        }}
        localVersion={sitePage.version}
        serverVersion={conflictState.serverVersion}
        message={conflictState.message}
      />

      <AdminConfirmModal
        open={Boolean(confirmAction)}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleLifecycle}
        isLoading={lifecycleLoading}
        variant={confirmAction === 'archive' ? 'danger' : 'primary'}
        title="تأیید تغییر وضعیت صفحه"
        message={`آیا از تغییر وضعیت صفحه «${sitePage.title}» اطمینان دارید؟`}
      />
    </div>
  );
}

export default function AdminSitePageDetailPage() {
  return (
    <AdminGuard requiredPermission="pages:read">
      <SitePageDetailContent />
    </AdminGuard>
  );
}
