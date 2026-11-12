'use client';

import React, { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { SeoMetadata } from '@techa/shared';
import { MediaPickerModal } from '../media/MediaPickerModal';
import { AdminButton } from '../ui/AdminPrimitives';
import { AdminField, AdminInput, AdminTextarea } from '../ui/AdminFormFields';

export function SeoFieldsSection({
  seo,
  onChange,
  errors,
  disabled = false,
}: {
  seo: SeoMetadata;
  onChange: (next: SeoMetadata) => void;
  errors?: {
    metaTitle?: string;
    metaDescription?: string;
    canonicalUrlOverride?: string;
    ogImageStorageKey?: string;
  };
  disabled?: boolean;
}) {
  const [mediaModalOpen, setMediaModalOpen] = useState(false);

  const titleLen = seo.metaTitle?.length || 0;
  const descLen = seo.metaDescription?.length || 0;

  return (
    <div className="space-y-4">
      <AdminField
        label="عنوان سئو (Meta Title)"
        required
        counter={`${titleLen}/100 (محدوده انتشار: ۵ تا ۷۰)`}
        hint={
          titleLen > 70 || (titleLen > 0 && titleLen < 5)
            ? 'توجه: هنگام انتشار محتوا، طول عنوان سئو باید بین ۵ تا ۷۰ کاراکتر باشد.'
            : undefined
        }
        error={errors?.metaTitle}
      >
        <AdminInput
          value={seo.metaTitle}
          maxLength={100}
          disabled={disabled}
          hasError={Boolean(errors?.metaTitle)}
          onChange={(e) => onChange({ ...seo, metaTitle: e.target.value })}
          placeholder="عنوان بهینه برای موتورهای جستجو..."
        />
      </AdminField>

      <AdminField
        label="توضیحات متا (Meta Description)"
        required
        counter={`${descLen}/300 (محدوده انتشار: ۱۰ تا ۱۶۰)`}
        hint={
          descLen > 160 || (descLen > 0 && descLen < 10)
            ? 'توجه: هنگام انتشار محتوا، توضیحات متا باید بین ۱۰ تا ۱۶۰ کاراکتر باشد.'
            : undefined
        }
        error={errors?.metaDescription}
      >
        <AdminTextarea
          rows={3}
          value={seo.metaDescription}
          maxLength={300}
          disabled={disabled}
          hasError={Boolean(errors?.metaDescription)}
          onChange={(e) => onChange({ ...seo, metaDescription: e.target.value })}
          placeholder="توضیح مختصر برای نمایش در نتایج گوگل و شبکه‌های اجتماعی..."
        />
      </AdminField>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AdminField
          label="آدرس کانونیکال سفارشی (اختیاری)"
          error={errors?.canonicalUrlOverride}
        >
          <AdminInput
            dir="ltr"
            className="font-mono text-xs"
            value={seo.canonicalUrlOverride || ''}
            maxLength={255}
            disabled={disabled}
            hasError={Boolean(errors?.canonicalUrlOverride)}
            onChange={(e) =>
              onChange({
                ...seo,
                canonicalUrlOverride: e.target.value.trim() ? e.target.value : undefined,
              })
            }
            placeholder="https://techa.ir/..."
          />
        </AdminField>

        <AdminField
          label="تصویر اشتراک‌گذاری (OG Image StorageKey - اختیاری)"
          error={errors?.ogImageStorageKey}
        >
          <div className="flex gap-2">
            <AdminInput
              dir="ltr"
              className="font-mono text-xs"
              value={seo.ogImageStorageKey || ''}
              disabled={disabled}
              hasError={Boolean(errors?.ogImageStorageKey)}
              onChange={(e) =>
                onChange({
                  ...seo,
                  ogImageStorageKey: e.target.value.trim() ? e.target.value : undefined,
                })
              }
              placeholder="media/site_asset/..."
            />
            <AdminButton
              variant="outline"
              disabled={disabled}
              onClick={() => setMediaModalOpen(true)}
              icon={<ImageIcon className="w-4 h-4" />}
            >
              انتخاب
            </AdminButton>
          </div>
        </AdminField>
      </div>

      <MediaPickerModal
        open={mediaModalOpen}
        onClose={() => setMediaModalOpen(false)}
        allowedMediaType="image"
        defaultCategory="site_asset"
        title="انتخاب تصویر OpenGraph"
        onSelect={(media) => onChange({ ...seo, ogImageStorageKey: media.storageKey })}
      />
    </div>
  );
}
