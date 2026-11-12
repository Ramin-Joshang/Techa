'use client';

import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import {
  AdminCreateSitePageDto,
  AdminCreateSitePageDtoSchema,
  ContentBlock,
  SeoMetadata,
} from '@techa/shared';
import { AdminSitePageDto } from '../../../lib/admin/admin-types';
import ContentBlocksEditor from '../content-editor/ContentBlocksEditor';
import { cleanBlockBeforeSubmit } from '../content-editor/block-factories';
import { SeoFieldsSection } from '../shared/SeoFieldsSection';
import { AdminButton } from '../ui/AdminPrimitives';
import { AdminField, AdminInput, AdminTextarea } from '../ui/AdminFormFields';

export interface SitePageFormValues {
  pageKey: string;
  title: string;
  heroSection: {
    title: string;
    subtitle: string;
    primaryCta: { label: string; url: string };
    secondaryCta?: { label: string; url: string };
  };
  features: Array<{ title: string; description: string; icon: string }>;
  contentBlocks: ContentBlock[];
  seo: SeoMetadata;
  changeSummary?: string;
}

export function sitePageDtoToFormValues(page?: AdminSitePageDto | null): SitePageFormValues {
  if (!page) {
    return {
      pageKey: '',
      title: '',
      heroSection: {
        title: '',
        subtitle: '',
        primaryCta: { label: 'مشاهده دوره‌ها', url: '/courses' },
      },
      features: [{ title: 'یادگیری پروژه‌محور', description: 'تمرین‌های عملی واقعی', icon: 'code' }],
      contentBlocks: [],
      seo: { metaTitle: '', metaDescription: '' },
      changeSummary: '',
    };
  }

  return {
    pageKey: page.pageKey,
    title: page.title,
    heroSection: page.heroSection
      ? {
          title: page.heroSection.title,
          subtitle: page.heroSection.subtitle,
          primaryCta: { ...page.heroSection.primaryCta },
          secondaryCta: page.heroSection.secondaryCta
            ? { ...page.heroSection.secondaryCta }
            : undefined,
        }
      : {
          title: '',
          subtitle: '',
          primaryCta: { label: 'مشاهده دوره‌ها', url: '/courses' },
        },
    features: page.features?.length
      ? page.features.map((f) => ({ ...f }))
      : [{ title: '', description: '', icon: 'code' }],
    contentBlocks: page.contentBlocks || [],
    seo: {
      metaTitle: page.seo?.metaTitle || '',
      metaDescription: page.seo?.metaDescription || '',
      canonicalUrlOverride: page.seo?.canonicalUrlOverride,
      ogImageStorageKey: page.seo?.ogImageStorageKey,
    },
    changeSummary: '',
  };
}

export function SitePageForm({
  values,
  onChange,
  onSubmit,
  submitting,
  submitLabel,
  isEdit = false,
  readOnly = false,
}: {
  values: SitePageFormValues;
  onChange: (next: SitePageFormValues) => void;
  onSubmit: (dto: AdminCreateSitePageDto) => Promise<void>;
  submitting: boolean;
  submitLabel: string;
  isEdit?: boolean;
  readOnly?: boolean;
}) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const isHome = values.pageKey.trim() === 'home';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const cleanedBlocks = values.contentBlocks.map(cleanBlockBeforeSubmit);

    const dtoPayload: AdminCreateSitePageDto = {
      pageKey: values.pageKey.trim(),
      title: values.title.trim(),
      ...(isHome
        ? {
            heroSection: {
              title: values.heroSection.title.trim(),
              subtitle: values.heroSection.subtitle.trim(),
              primaryCta: {
                label: values.heroSection.primaryCta.label.trim(),
                url: values.heroSection.primaryCta.url.trim(),
              },
              ...(values.heroSection.secondaryCta?.label.trim()
                ? {
                    secondaryCta: {
                      label: values.heroSection.secondaryCta.label.trim(),
                      url: values.heroSection.secondaryCta.url.trim(),
                    },
                  }
                : {}),
            },
            features: values.features.map((f) => ({
              title: f.title.trim(),
              description: f.description.trim(),
              icon: f.icon.trim() || 'code',
            })),
          }
        : {}),
      contentBlocks: cleanedBlocks,
      seo: {
        metaTitle: values.seo.metaTitle.trim(),
        metaDescription: values.seo.metaDescription.trim(),
        canonicalUrlOverride: values.seo.canonicalUrlOverride?.trim() || undefined,
        ogImageStorageKey: values.seo.ogImageStorageKey?.trim() || undefined,
      },
      changeSummary: values.changeSummary?.trim() || undefined,
    };

    const parsed = AdminCreateSitePageDtoSchema.safeParse(dtoPayload);
    if (!parsed.success) {
      const nextErrs: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const k = issue.path.join('.');
        if (!nextErrs[k]) nextErrs[k] = issue.message;
      }
      setErrors(nextErrs);
      return;
    }

    await onSubmit(parsed.data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {Object.keys(errors).length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3.5 text-xs text-red-800 space-y-1">
          <div className="font-bold">لطفاً خطاهای زیر را برطرف کنید:</div>
          {Object.entries(errors).slice(0, 4).map(([k, v]) => (
            <div key={k}>
              <span className="font-mono">{k}:</span> {v}
            </div>
          ))}
        </div>
      )}

      <section className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
        <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
          مشخصات صفحه
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AdminField
            label="شناسه یکتا صفحه (pageKey)"
            required
            hint="مثال: home، about، guide (فقط حروف کوچک انگلیسی و خط تیره)"
            error={errors.pageKey}
          >
            <AdminInput
              dir="ltr"
              className="font-mono text-xs"
              value={values.pageKey}
              disabled={readOnly || isEdit}
              hasError={Boolean(errors.pageKey)}
              onChange={(e) => onChange({ ...values, pageKey: e.target.value })}
              placeholder="about-techa"
            />
          </AdminField>

          <AdminField label="عنوان صفحه" required error={errors.title}>
            <AdminInput
              value={values.title}
              maxLength={150}
              disabled={readOnly}
              hasError={Boolean(errors.title)}
              onChange={(e) => onChange({ ...values, title: e.target.value })}
              placeholder="عنوان نمایشی صفحه..."
            />
          </AdminField>
        </div>
      </section>

      {isHome && (
        <>
          <section className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              بخش Hero صفحه اصلی (Home)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AdminField label="تیتر اصلی Hero" required error={errors['heroSection.title']}>
                <AdminInput
                  value={values.heroSection.title}
                  maxLength={150}
                  disabled={readOnly}
                  onChange={(e) =>
                    onChange({
                      ...values,
                      heroSection: { ...values.heroSection, title: e.target.value },
                    })
                  }
                />
              </AdminField>
              <AdminField label="زیرعنوان Hero" required error={errors['heroSection.subtitle']}>
                <AdminInput
                  value={values.heroSection.subtitle}
                  maxLength={300}
                  disabled={readOnly}
                  onChange={(e) =>
                    onChange({
                      ...values,
                      heroSection: { ...values.heroSection, subtitle: e.target.value },
                    })
                  }
                />
              </AdminField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="border border-slate-200 rounded-lg p-3.5 space-y-3">
                <div className="text-xs font-bold text-slate-800">دکمه اصلی (Primary CTA)</div>
                <AdminField label="متن دکمه" required error={errors['heroSection.primaryCta.label']}>
                  <AdminInput
                    value={values.heroSection.primaryCta.label}
                    maxLength={50}
                    disabled={readOnly}
                    onChange={(e) =>
                      onChange({
                        ...values,
                        heroSection: {
                          ...values.heroSection,
                          primaryCta: { ...values.heroSection.primaryCta, label: e.target.value },
                        },
                      })
                    }
                  />
                </AdminField>
                <AdminField
                  label="مسیر مجاز (/ یا /courses یا /courses/:slug)"
                  required
                  error={errors['heroSection.primaryCta.url']}
                >
                  <AdminInput
                    dir="ltr"
                    className="font-mono text-xs"
                    value={values.heroSection.primaryCta.url}
                    disabled={readOnly}
                    onChange={(e) =>
                      onChange({
                        ...values,
                        heroSection: {
                          ...values.heroSection,
                          primaryCta: { ...values.heroSection.primaryCta, url: e.target.value },
                        },
                      })
                    }
                  />
                </AdminField>
              </div>

              <div className="border border-slate-200 rounded-lg p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">دکمه دوم (اختیاری)</span>
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() =>
                        onChange({
                          ...values,
                          heroSection: {
                            ...values.heroSection,
                            secondaryCta: values.heroSection.secondaryCta
                              ? undefined
                              : { label: 'آشنایی بیشتر', url: '/' },
                          },
                        })
                      }
                      className="text-xs text-emerald-700 hover:underline"
                    >
                      {values.heroSection.secondaryCta ? 'حذف دکمه دوم' : 'افزودن دکمه دوم'}
                    </button>
                  )}
                </div>

                {values.heroSection.secondaryCta && (
                  <>
                    <AdminField label="متن دکمه دوم">
                      <AdminInput
                        value={values.heroSection.secondaryCta.label}
                        maxLength={50}
                        disabled={readOnly}
                        onChange={(e) =>
                          onChange({
                            ...values,
                            heroSection: {
                              ...values.heroSection,
                              secondaryCta: {
                                ...values.heroSection.secondaryCta!,
                                label: e.target.value,
                              },
                            },
                          })
                        }
                      />
                    </AdminField>
                    <AdminField
                      label="مسیر مجاز"
                      error={errors['heroSection.secondaryCta.url']}
                    >
                      <AdminInput
                        dir="ltr"
                        className="font-mono text-xs"
                        value={values.heroSection.secondaryCta.url}
                        disabled={readOnly}
                        onChange={(e) =>
                          onChange({
                            ...values,
                            heroSection: {
                              ...values.heroSection,
                              secondaryCta: {
                                ...values.heroSection.secondaryCta!,
                                url: e.target.value,
                              },
                            },
                          })
                        }
                      />
                    </AdminField>
                  </>
                )}
              </div>
            </div>
          </section>

          <section className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900">
                ویژگی‌های کلیدی صفحه اصلی ({values.features.length}/6)
              </h2>
              {!readOnly && values.features.length < 6 && (
                <AdminButton
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    onChange({
                      ...values,
                      features: [
                        ...values.features,
                        { title: 'ویژگی جدید', description: 'توضیح ویژگی...', icon: 'sparkles' },
                      ],
                    })
                  }
                  icon={<Plus className="w-3.5 h-3.5" />}
                >
                  افزودن ویژگی
                </AdminButton>
              )}
            </div>

            <div className="space-y-3">
              {values.features.map((feat, idx) => (
                <div
                  key={idx}
                  className="border border-slate-200 rounded-lg p-3.5 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end"
                >
                  <AdminField label="عنوان">
                    <AdminInput
                      value={feat.title}
                      maxLength={100}
                      disabled={readOnly}
                      onChange={(e) => {
                        const next = values.features.map((f, i) =>
                          i === idx ? { ...f, title: e.target.value } : f
                        );
                        onChange({ ...values, features: next });
                      }}
                    />
                  </AdminField>
                  <AdminField label="نام آیکون">
                    <AdminInput
                      dir="ltr"
                      className="font-mono text-xs"
                      value={feat.icon}
                      maxLength={50}
                      disabled={readOnly}
                      onChange={(e) => {
                        const next = values.features.map((f, i) =>
                          i === idx ? { ...f, icon: e.target.value } : f
                        );
                        onChange({ ...values, features: next });
                      }}
                    />
                  </AdminField>
                  <div className="sm:col-span-2 flex items-end gap-2">
                    <div className="flex-1">
                      <AdminField label="توضیح">
                        <AdminInput
                          value={feat.description}
                          maxLength={300}
                          disabled={readOnly}
                          onChange={(e) => {
                            const next = values.features.map((f, i) =>
                              i === idx ? { ...f, description: e.target.value } : f
                            );
                            onChange({ ...values, features: next });
                          }}
                        />
                      </AdminField>
                    </div>
                    {!readOnly && values.features.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          onChange({
                            ...values,
                            features: values.features.filter((_, i) => i !== idx),
                          })
                        }
                        className="p-2.5 rounded-lg border border-slate-200 text-red-600 hover:bg-red-50"
                        title="حذف ویژگی"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      <section className="space-y-2">
        <h2 className="text-sm font-bold text-slate-900">بلوک‌های محتوای صفحه</h2>
        <ContentBlocksEditor
          blocks={values.contentBlocks}
          disabled={readOnly}
          onChange={(contentBlocks) => onChange({ ...values, contentBlocks })}
        />
      </section>

      <section className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
        <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
          تنظیمات سئو (SEO)
        </h2>
        <SeoFieldsSection
          seo={values.seo}
          disabled={readOnly}
          onChange={(seo) => onChange({ ...values, seo })}
          errors={{
            metaTitle: errors['seo.metaTitle'],
            metaDescription: errors['seo.metaDescription'],
            canonicalUrlOverride: errors['seo.canonicalUrlOverride'],
            ogImageStorageKey: errors['seo.ogImageStorageKey'],
          }}
        />
      </section>

      {!readOnly && (
        <section className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="flex-1 max-w-lg">
            <AdminField label="توضیح تغییر (اختیاری)">
              <AdminInput
                value={values.changeSummary || ''}
                maxLength={500}
                onChange={(e) => onChange({ ...values, changeSummary: e.target.value })}
              />
            </AdminField>
          </div>
          <AdminButton type="submit" variant="primary" isLoading={submitting}>
            {submitLabel}
          </AdminButton>
        </section>
      )}
    </form>
  );
}
