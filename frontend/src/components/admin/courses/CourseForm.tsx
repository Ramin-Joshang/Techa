'use client';

import React, { useState } from 'react';
import { Image as ImageIcon, Sparkles } from 'lucide-react';
import {
  AdminCreateCourseDto,
  AdminCreateCourseDtoSchema,
  COURSE_LEVELS,
  CourseIcon,
  CourseLevel,
  SeoMetadata,
} from '@techa/shared';
import {
  COURSE_LEVEL_LABELS,
  resolvePreviewMediaUrl,
  toSafeSlug,
} from '../../../lib/admin/admin-formatters';
import { AdminCourseDto } from '../../../lib/admin/admin-types';
import { MediaPickerModal } from '../media/MediaPickerModal';
import { SeoFieldsSection } from '../shared/SeoFieldsSection';
import { AdminButton } from '../ui/AdminPrimitives';
import {
  AdminField,
  AdminInput,
  AdminSelect,
  AdminStringListInput,
  AdminTextarea,
} from '../ui/AdminFormFields';

const SYSTEM_ICON_PRESETS = [
  { value: 'lucide:code-2', label: 'کدنویسی (lucide:code-2)' },
  { value: 'lucide:terminal', label: 'ترمینال (lucide:terminal)' },
  { value: 'lucide:layers', label: 'معماری و لایه‌ها (lucide:layers)' },
  { value: 'lucide:globe', label: 'وب (lucide:globe)' },
  { value: 'lucide:database', label: 'دیتابیس (lucide:database)' },
  { value: 'lucide:cpu', label: 'مهندسی سیستم (lucide:cpu)' },
  { value: 'lucide:book-open', label: 'مستندات (lucide:book-open)' },
];

export interface CourseFormValues {
  title: string;
  slug: string;
  summary: string;
  description: string;
  level: CourseLevel;
  order: number;
  icon: CourseIcon;
  coverStorageKey?: string;
  tags: string[];
  prerequisites: string[];
  targetAudience: string[];
  seo: SeoMetadata;
  changeSummary?: string;
}

export function courseDtoToFormValues(course?: AdminCourseDto | null): CourseFormValues {
  if (!course) {
    return {
      title: '',
      slug: '',
      summary: '',
      description: '',
      level: 'beginner',
      order: 0,
      icon: { kind: 'system', name: 'lucide:code-2' },
      coverStorageKey: undefined,
      tags: [],
      prerequisites: [],
      targetAudience: [],
      seo: {
        metaTitle: '',
        metaDescription: '',
      },
      changeSummary: '',
    };
  }

  return {
    title: course.title,
    slug: course.slug,
    summary: course.summary,
    description: course.description,
    level: course.level,
    order: course.order ?? 0,
    icon: course.icon,
    coverStorageKey: course.coverStorageKey,
    tags: [...(course.tags || [])],
    prerequisites: [...(course.prerequisites || [])],
    targetAudience: [...(course.targetAudience || [])],
    seo: {
      metaTitle: course.seo?.metaTitle || '',
      metaDescription: course.seo?.metaDescription || '',
      canonicalUrlOverride: course.seo?.canonicalUrlOverride,
      ogImageStorageKey: course.seo?.ogImageStorageKey,
    },
    changeSummary: '',
  };
}

export function CourseForm({
  values,
  onChange,
  onSubmit,
  submitting,
  submitLabel,
  readOnly = false,
  isEdit = false,
}: {
  values: CourseFormValues;
  onChange: (next: CourseFormValues) => void;
  onSubmit: (cleanedDto: AdminCreateCourseDto) => Promise<void>;
  submitting: boolean;
  submitLabel: string;
  readOnly?: boolean;
  isEdit?: boolean;
}) {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [pickerTarget, setPickerTarget] = useState<'cover' | 'icon' | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    const payload: AdminCreateCourseDto = {
      title: values.title.trim(),
      slug: values.slug.trim(),
      summary: values.summary.trim(),
      description: values.description.trim(),
      level: values.level,
      order: Number.isFinite(values.order) ? Math.max(0, Math.trunc(values.order)) : 0,
      icon: values.icon,
      coverStorageKey: values.coverStorageKey?.trim() || undefined,
      tags: values.tags,
      prerequisites: values.prerequisites,
      targetAudience: values.targetAudience,
      seo: {
        metaTitle: values.seo.metaTitle.trim(),
        metaDescription: values.seo.metaDescription.trim(),
        canonicalUrlOverride: values.seo.canonicalUrlOverride?.trim() || undefined,
        ogImageStorageKey: values.seo.ogImageStorageKey?.trim() || undefined,
      },
      changeSummary: values.changeSummary?.trim() || undefined,
    };

    const parsed = AdminCreateCourseDtoSchema.safeParse(payload);
    if (!parsed.success) {
      const nextErrs: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join('.');
        if (!nextErrs[key]) nextErrs[key] = issue.message;
      }
      setFieldErrors(nextErrs);
      return;
    }

    await onSubmit(parsed.data);
  };

  const coverPreview = resolvePreviewMediaUrl(values.coverStorageKey);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {Object.keys(fieldErrors).length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3.5 text-xs text-red-800">
          لطفاً خطاهای مشخص‌شده در فرم را برطرف کنید.
        </div>
      )}

      {/* Basic Info Card */}
      <section className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
        <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
          اطلاعات پایه دوره
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AdminField
            label="عنوان دوره"
            required
            counter={`${values.title.length}/150`}
            error={fieldErrors.title}
          >
            <AdminInput
              value={values.title}
              maxLength={150}
              disabled={readOnly}
              hasError={Boolean(fieldErrors.title)}
              onChange={(e) => onChange({ ...values, title: e.target.value })}
              placeholder="مثال: آموزش جامع Next.js 16"
            />
          </AdminField>

          <AdminField
            label="اسلاگ URL (انگلیسی، حروف کوچک و خط تیره)"
            required
            error={fieldErrors.slug}
          >
            <div className="flex gap-2">
              <AdminInput
                dir="ltr"
                className="font-mono text-xs"
                value={values.slug}
                maxLength={100}
                disabled={readOnly}
                hasError={Boolean(fieldErrors.slug)}
                onChange={(e) => onChange({ ...values, slug: e.target.value })}
                placeholder="nextjs-16-mastery"
              />
              {!isEdit && !readOnly && (
                <AdminButton
                  variant="outline"
                  onClick={() =>
                    onChange({ ...values, slug: toSafeSlug(values.title) || values.slug })
                  }
                  title="ساخت اسلاگ از عنوان"
                  icon={<Sparkles className="w-3.5 h-3.5" />}
                >
                  تولید
                </AdminButton>
              )}
            </div>
          </AdminField>
        </div>

        <AdminField
          label="خلاصه کوتاه دوره"
          required
          counter={`${values.summary.length}/300`}
          error={fieldErrors.summary}
        >
          <AdminInput
            value={values.summary}
            maxLength={300}
            disabled={readOnly}
            hasError={Boolean(fieldErrors.summary)}
            onChange={(e) => onChange({ ...values, summary: e.target.value })}
            placeholder="توضیح یک‌خطی برای نمایش در کارت‌های دوره..."
          />
        </AdminField>

        <AdminField
          label="توضیحات کامل دوره"
          required
          counter={`${values.description.length}/5000`}
          error={fieldErrors.description}
        >
          <AdminTextarea
            rows={5}
            value={values.description}
            maxLength={5000}
            disabled={readOnly}
            hasError={Boolean(fieldErrors.description)}
            onChange={(e) => onChange({ ...values, description: e.target.value })}
            placeholder="معرفی کامل سرفصل‌ها، اهداف دوره و دستاوردهای یادگیری..."
          />
        </AdminField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AdminField label="سطح دوره" required error={fieldErrors.level}>
            <AdminSelect
              value={values.level}
              disabled={readOnly}
              onChange={(e) => onChange({ ...values, level: e.target.value as CourseLevel })}
            >
              {COURSE_LEVELS.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {COURSE_LEVEL_LABELS[lvl]}
                </option>
              ))}
            </AdminSelect>
          </AdminField>

          <AdminField label="ترتیب نمایش" error={fieldErrors.order}>
            <AdminInput
              type="number"
              min={0}
              dir="ltr"
              disabled={readOnly}
              value={values.order}
              onChange={(e) =>
                onChange({ ...values, order: Math.max(0, Number(e.target.value) || 0) })
              }
            />
          </AdminField>
        </div>
      </section>

      {/* Media & Icon Card */}
      <section className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
        <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
          تصویر کاور و آیکون دوره
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-3">
            <AdminField label="نوع آیکون دوره">
              <AdminSelect
                value={values.icon.kind}
                disabled={readOnly}
                onChange={(e) => {
                  const kind = e.target.value as 'system' | 'media';
                  if (kind === 'system') {
                    onChange({ ...values, icon: { kind: 'system', name: 'lucide:code-2' } });
                  } else {
                    onChange({ ...values, icon: { kind: 'media', storageKey: '' } });
                  }
                }}
              >
                <option value="system">آیکون سیستمی (Lucide)</option>
                <option value="media">فایل تصویر از کتابخانه رسانه</option>
              </AdminSelect>
            </AdminField>

            {values.icon.kind === 'system' ? (
              <AdminField
                label="شناسه آیکون سیستمی"
                error={fieldErrors['icon.name']}
                hint="مثال: lucide:code-2"
              >
                <AdminSelect
                  value={values.icon.name}
                  disabled={readOnly}
                  onChange={(e) =>
                    onChange({ ...values, icon: { kind: 'system', name: e.target.value } })
                  }
                >
                  {SYSTEM_ICON_PRESETS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                  {!SYSTEM_ICON_PRESETS.some((p) => p.value === (values.icon as any).name) && (
                    <option value={values.icon.name}>{values.icon.name}</option>
                  )}
                </AdminSelect>
              </AdminField>
            ) : (
              <AdminField label="StorageKey آیکون" error={fieldErrors['icon.storageKey']}>
                <div className="flex gap-2">
                  <AdminInput
                    dir="ltr"
                    className="font-mono text-xs"
                    value={values.icon.storageKey}
                    disabled={readOnly}
                    onChange={(e) =>
                      onChange({
                        ...values,
                        icon: { kind: 'media', storageKey: e.target.value },
                      })
                    }
                    placeholder="media/course_icon/..."
                  />
                  <AdminButton
                    variant="outline"
                    disabled={readOnly}
                    onClick={() => setPickerTarget('icon')}
                  >
                    انتخاب
                  </AdminButton>
                </div>
              </AdminField>
            )}
          </div>

          <div className="space-y-3">
            <AdminField
              label="تصویر کاور دوره (StorageKey اختیاری)"
              error={fieldErrors.coverStorageKey}
            >
              <div className="flex gap-2">
                <AdminInput
                  dir="ltr"
                  className="font-mono text-xs"
                  value={values.coverStorageKey || ''}
                  disabled={readOnly}
                  onChange={(e) =>
                    onChange({
                      ...values,
                      coverStorageKey: e.target.value.trim() ? e.target.value : undefined,
                    })
                  }
                  placeholder="media/course_cover/..."
                />
                <AdminButton
                  variant="outline"
                  disabled={readOnly}
                  onClick={() => setPickerTarget('cover')}
                  icon={<ImageIcon className="w-4 h-4" />}
                >
                  انتخاب
                </AdminButton>
              </div>
            </AdminField>

            {coverPreview && coverPreview.startsWith('/') && (
              <div className="border border-slate-200 rounded-lg p-2 bg-slate-50 inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={coverPreview}
                  alt={values.title || 'کاور دوره'}
                  className="max-h-28 rounded object-contain"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Curriculum Metadata Arrays */}
      <section className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
        <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
          برچسب‌ها، پیش‌نیازها و مخاطبان هدف
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <AdminStringListInput
            label="برچسب‌ها (Tags)"
            values={values.tags}
            onChange={(tags) => onChange({ ...values, tags })}
            placeholder="مثلاً react یا typescript"
            error={fieldErrors.tags}
          />
          <AdminStringListInput
            label="پیش‌نیازها"
            values={values.prerequisites}
            onChange={(prerequisites) => onChange({ ...values, prerequisites })}
            placeholder="مثال: آشنایی با HTML و CSS"
            error={fieldErrors.prerequisites}
          />
          <AdminStringListInput
            label="مخاطبان هدف"
            values={values.targetAudience}
            onChange={(targetAudience) => onChange({ ...values, targetAudience })}
            placeholder="مثال: توسعه‌دهندگان فرانت‌اند"
            error={fieldErrors.targetAudience}
          />
        </div>
      </section>

      {/* SEO Section */}
      <section className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
        <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
          تنظیمات سئو (SEO)
        </h2>
        <SeoFieldsSection
          seo={values.seo}
          onChange={(seo) => onChange({ ...values, seo })}
          disabled={readOnly}
          errors={{
            metaTitle: fieldErrors['seo.metaTitle'],
            metaDescription: fieldErrors['seo.metaDescription'],
            canonicalUrlOverride: fieldErrors['seo.canonicalUrlOverride'],
            ogImageStorageKey: fieldErrors['seo.ogImageStorageKey'],
          }}
        />
      </section>

      {/* Save Footer */}
      {!readOnly && (
        <section className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="flex-1 max-w-lg">
            <AdminField
              label="خلاصه تغییرات (برای تاریخچه نسخه‌ها - اختیاری)"
              hint="مثال: به‌روزرسانی سرفصل و توضیحات سئو"
            >
              <AdminInput
                value={values.changeSummary || ''}
                maxLength={500}
                onChange={(e) => onChange({ ...values, changeSummary: e.target.value })}
                placeholder="توضیح کوتاه تغییر..."
              />
            </AdminField>
          </div>
          <AdminButton type="submit" variant="primary" isLoading={submitting}>
            {submitLabel}
          </AdminButton>
        </section>
      )}

      <MediaPickerModal
        open={pickerTarget !== null}
        onClose={() => setPickerTarget(null)}
        allowedMediaType="image"
        defaultCategory={pickerTarget === 'icon' ? 'course_icon' : 'course_cover'}
        title={pickerTarget === 'icon' ? 'انتخاب آیکون دوره' : 'انتخاب تصویر کاور دوره'}
        onSelect={(media) => {
          if (pickerTarget === 'icon') {
            onChange({ ...values, icon: { kind: 'media', storageKey: media.storageKey } });
          } else {
            onChange({ ...values, coverStorageKey: media.storageKey });
          }
        }}
      />
    </form>
  );
}
