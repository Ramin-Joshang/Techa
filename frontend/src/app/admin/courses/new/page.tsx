'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminGuard from '../../../../components/admin/auth/AdminGuard';
import {
  CourseForm,
  CourseFormValues,
  courseDtoToFormValues,
} from '../../../../components/admin/courses/CourseForm';
import { AdminPageHeader } from '../../../../components/admin/ui/AdminPrimitives';
import { useAdminToast } from '../../../../components/admin/ui/ToastProvider';
import { adminClient } from '../../../../lib/admin/admin-client';
import { useUnsavedChangesWarning } from '../../../../lib/admin/use-unsaved-guard';
import { AdminCreateCourseDto } from '@techa/shared';

function CreateCourseContent() {
  const router = useRouter();
  const toast = useAdminToast();
  const [values, setValues] = useState<CourseFormValues>(() => courseDtoToFormValues(null));
  const [isDirty, setIsDirty] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useUnsavedChangesWarning(isDirty);

  const handleSubmit = async (dto: AdminCreateCourseDto) => {
    setSubmitting(true);
    try {
      const created = await adminClient.createCourse(dto);
      setIsDirty(false);
      toast.success('دوره جدید با موفقیت ایجاد شد', created.title);
      router.replace(`/admin/courses/${created.id}`);
    } catch (err) {
      toast.error('ایجاد دوره ناموفق بود', err instanceof Error ? err.message : undefined);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="ایجاد دوره جدید"
        description="دوره ابتدا در وضعیت پیش‌نویس ساخته می‌شود تا پس از افزودن فصل‌ها و درس‌ها منتشر گردد."
        breadcrumbs={[
          { label: 'داشبورد', href: '/admin' },
          { label: 'دوره‌ها', href: '/admin/courses' },
          { label: 'دوره جدید' },
        ]}
      />
      <CourseForm
        values={values}
        onChange={(next) => {
          setValues(next);
          setIsDirty(true);
        }}
        onSubmit={handleSubmit}
        submitting={submitting}
        submitLabel="ایجاد دوره"
      />
    </div>
  );
}

export default function AdminNewCoursePage() {
  return (
    <AdminGuard requiredPermission="courses:create">
      <CreateCourseContent />
    </AdminGuard>
  );
}
