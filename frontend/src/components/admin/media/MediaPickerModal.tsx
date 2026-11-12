'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Check, FileText, Image as ImageIcon, Search, Upload, Video } from 'lucide-react';
import { MediaCategory, MediaType } from '@techa/shared';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import { adminClient } from '../../../lib/admin/admin-client';
import {
  MEDIA_TYPE_LABELS,
  formatBytes,
  resolvePreviewMediaUrl,
} from '../../../lib/admin/admin-formatters';
import { AdminMediaDto, PaginationMeta } from '../../../lib/admin/admin-types';
import {
  AdminButton,
  AdminEmptyState,
  AdminErrorState,
  AdminModal,
  AdminPagination,
} from '../ui/AdminPrimitives';
import { AdminInput, AdminSelect } from '../ui/AdminFormFields';
import { MediaUploaderZone } from './MediaUploaderZone';

export function MediaPickerModal({
  open,
  onClose,
  onSelect,
  allowedMediaType,
  defaultCategory = 'lesson_image',
  title = 'انتخاب از کتابخانه رسانه',
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (media: AdminMediaDto) => void;
  allowedMediaType?: MediaType;
  defaultCategory?: MediaCategory;
  title?: string;
}) {
  const { hasPermission } = useAdminAuth();
  const [tab, setTab] = useState<'browse' | 'upload'>('browse');
  const [items, setItems] = useState<AdminMediaDto[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 12,
    totalItems: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [q, setQ] = useState('');
  const [mediaType, setMediaType] = useState<string>(allowedMediaType || '');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMediaType(allowedMediaType || '');
  }, [allowedMediaType]);

  const fetchMedia = useCallback(async () => {
    if (!open) return;
    setLoading(true);
    setError(null);
    try {
      const res = await adminClient.listMedia({
        page,
        limit: 12,
        q: q.trim() || undefined,
        mediaType: mediaType || undefined,
        status: 'ready',
      });
      setItems(res.items);
      setPagination(res.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در دریافت لیست رسانه‌ها');
    } finally {
      setLoading(false);
    }
  }, [open, page, q, mediaType]);

  useEffect(() => {
    if (open && tab === 'browse') {
      void fetchMedia();
    }
  }, [open, tab, fetchMedia]);

  return (
    <AdminModal
      open={open}
      onClose={onClose}
      title={title}
      description="فایل مورد نظر را از رسانه‌های آپلودشده انتخاب کنید یا فایل جدیدی بارگذاری نمایید."
      maxWidthClass="max-w-4xl"
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setTab('browse')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                tab === 'browse' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              مرور کتابخانه
            </button>
            {hasPermission('media:upload') && (
              <button
                type="button"
                onClick={() => setTab('upload')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  tab === 'upload' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>آپلود جدید</span>
              </button>
            )}
          </div>

          {tab === 'browse' && (
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-52">
                <AdminInput
                  value={q}
                  onChange={(e) => {
                    setQ(e.target.value);
                    setPage(1);
                  }}
                  placeholder="جستجو در نام فایل..."
                  className="pl-8 text-xs min-h-[36px]"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>

              {!allowedMediaType && (
                <AdminSelect
                  value={mediaType}
                  onChange={(e) => {
                    setMediaType(e.target.value);
                    setPage(1);
                  }}
                  className="w-36 text-xs min-h-[36px]"
                >
                  <option value="">همه نوع‌ها</option>
                  <option value="image">تصویر</option>
                  <option value="video">ویدیو</option>
                  <option value="document">سند / فایل</option>
                </AdminSelect>
              )}
            </div>
          )}
        </div>

        {tab === 'upload' ? (
          <MediaUploaderZone
            defaultCategory={defaultCategory}
            defaultVisibility="public"
            onUploaded={(media) => {
              onSelect(media);
              onClose();
            }}
          />
        ) : loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 animate-pulse">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="h-36 rounded-lg bg-slate-100 border border-slate-200" />
            ))}
          </div>
        ) : error ? (
          <AdminErrorState message={error} onRetry={fetchMedia} />
        ) : items.length === 0 ? (
          <AdminEmptyState
            title="رسانه‌ای یافت نشد"
            description="هیچ فایل آماده‌ای مطابق فیلتر شما ثبت نشده است."
            action={
              hasPermission('media:upload') ? (
                <AdminButton
                  variant="primary"
                  size="sm"
                  onClick={() => setTab('upload')}
                  icon={<Upload className="w-4 h-4" />}
                >
                  آپلود اولین فایل
                </AdminButton>
              ) : undefined
            }
          />
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {items.map((item) => {
                const src = resolvePreviewMediaUrl(item.publicUrl || item.storageKey);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onSelect(item);
                      onClose();
                    }}
                    className="group text-right bg-white border border-slate-200 hover:border-emerald-600 rounded-lg overflow-hidden transition-colors flex flex-col"
                  >
                    <div className="h-28 w-full bg-slate-100 flex items-center justify-center overflow-hidden relative">
                      {item.mediaType === 'image' && src ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={src}
                          alt={item.altText || item.originalFileName}
                          className="w-full h-full object-cover"
                        />
                      ) : item.mediaType === 'video' ? (
                        <Video className="w-8 h-8 text-slate-400" />
                      ) : (
                        <FileText className="w-8 h-8 text-slate-400" />
                      )}
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 left-2 bg-emerald-700 text-white rounded-md px-2 py-0.5 text-[10px] font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        انتخاب
                      </span>
                    </div>
                    <div className="p-2.5 space-y-1 flex-1 w-full">
                      <div className="text-xs font-semibold text-slate-900 truncate">
                        {item.originalFileName}
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>{MEDIA_TYPE_LABELS[item.mediaType]}</span>
                        <span dir="ltr" className="font-mono">
                          {formatBytes(item.sizeBytes)}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <AdminPagination pagination={pagination} onPageChange={setPage} />
          </>
        )}
      </div>
    </AdminModal>
  );
}
