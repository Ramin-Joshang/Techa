'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminCreateSitePageDto } from '@techa/shared';
import AdminGuard from '../../../../components/admin/auth/AdminGuard';
import {
  SitePageForm,
  SitePageFormValues,
  sitePageDtoToFormValues,
} from '../../../../components/admin/pages/SitePageForm';
import { AdminPageHeader } from '../../../../components/admin/ui/AdminPrimitives';
import { useAdminToast } from '../../../../components/admin/ui/ToastProvider';
import { adminClient } from '../../../../lib/admin/admin-client';
import { useUnsavedChangesWarning } from '../../../../lib/admin/use-unsaved-guard';

function CreateSitePageContent() {
  const router = useRouter();
  const toast = useAdminToast();
  const [values, setValues] = useState<SitePageFormValues>(() => sitePageDtoToFormValues(null));
  const [isDirty, setIsDirty] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useUnsavedChangesWarning(isDirty);

  const handleSubmit = async (dto: AdminCreateSitePageDto) => {
    setSubmitting(true);
    try {
      const created = await adminClient.createPage(dto);
      setIsDirty(false);
      toast.success('صفحه جدید ایجاد شد', created.title);
      router.replace(`/admin/pages/${created.id}`);
    } catch (err) {
      toast.error('ایجاد صفحه ناموفق بود', err instanceof Error ? err.message : undefined);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="ایجاد صفحه جدید"
        description="ایجاد صفحه جدید سایت به همراه بلوک‌های محتوا و تنظیمات سئو"
        breadcrumbs={[
          { label: 'داشبورد', href: '/admin' },
          { label: 'صفحات سایت', href: '/admin/pages' },
          { label: 'صفحه جدید' },
        ]}
      />
      <SitePageForm
        values={values}
        onChange={(next) => {
          setValues(next);
          setIsDirty(true);
        }}
        onSubmit={handleSubmit}
        submitting={submitting}
        submitLabel="ایجاد صفحه"
      />
    </div>
  );
}

export default function AdminNewSitePage() {
  return (
    <AdminGuard requiredPermission="pages:create">
      <CreateSitePageContent />
    </AdminGuard>
  );
}
