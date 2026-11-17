'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Check,
  Copy,
  Database,
  ExternalLink,
  FileText,
  Folder,
  FolderOpen,
  Grid,
  HardDrive,
  List,
  Save,
  Search,
  SlidersHorizontal,
  Trash2,
  Upload,
  Video,
  Link2,
} from 'lucide-react';
import {
  AdminUpdateMediaLimitsDtoSchema,
  MEDIA_CATEGORIES,
  MEDIA_STATUSES,
  MediaCategory,
  MediaStatus,
  MediaVisibility,
} from '@techa/shared';
import AdminGuard from '../../../components/admin/auth/AdminGuard';
import {
  AdminButton,
  AdminConfirmModal,
  AdminDrawer,
  AdminEmptyState,
  AdminErrorState,
  AdminModal,
  AdminPageHeader,
  AdminPagination,
  MediaStatusLabel,
} from '../../../components/admin/ui/AdminPrimitives';
import { AdminField, AdminInput, AdminSelect } from '../../../components/admin/ui/AdminFormFields';
import { MediaUploaderZone } from '../../../components/admin/media/MediaUploaderZone';
import { useAdminToast } from '../../../components/admin/ui/ToastProvider';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import { adminClient, AdminApiError } from '../../../lib/admin/admin-client';
import {
  MEDIA_CATEGORY_LABELS,
  MEDIA_STATUS_LABELS,
  MEDIA_TYPE_LABELS,
  formatBytes,
  formatPersianDateTime,
  formatPersianNumber,
  resolvePreviewMediaUrl,
} from '../../../lib/admin/admin-formatters';
import {
  AdminMediaDto,
  AdminMediaOverviewDto,
  MediaUsageItem,
  PaginationMeta,
} from '../../../lib/admin/admin-types';

function MediaLibraryContent() {
  const { hasPermission } = useAdminAuth();
  const canUpdateSettings = hasPermission('settings:update');
  const toast = useAdminToast();

  const [items, setItems] = useState<AdminMediaDto[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 24,
    totalItems: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overview, setOverview] = useState<AdminMediaOverviewDto | null>(null);

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showUploader, setShowUploader] = useState(false);

  const [q, setQ] = useState('');
  const [mediaTypeFilter, setMediaTypeFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  // Upload Limits Modal state
  const [limitsModalOpen, setLimitsModalOpen] = useState(false);
  const [limitImageMb, setLimitImageMb] = useState('10');
  const [limitVideoMb, setLimitVideoMb] = useState('200');
  const [limitDocMb, setLimitDocMb] = useState('50');
  const [savingLimits, setSavingLimits] = useState(false);
  const [limitsError, setLimitsError] = useState<string | null>(null);

  // Detail Drawer state
  const [selectedMedia, setSelectedMedia] = useState<AdminMediaDto | null>(null);
  const [editAltText, setEditAltText] = useState('');
  const [editCategory, setEditCategory] = useState<MediaCategory>('lesson_image');
  const [editVisibility, setEditVisibility] = useState<MediaVisibility>('public');
  const [editStatus, setEditStatus] = useState<MediaStatus>('ready');
  const [savingEdit, setSavingEdit] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Usage inspector state
  const [usages, setUsages] = useState<MediaUsageItem[] | null>(null);
  const [loadingUsages, setLoadingUsages] = useState(false);

  // Delete confirmation & conflict state
  const [deleteTarget, setDeleteTarget] = useState<AdminMediaDto | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadOverview = useCallback(async () => {
    try {
      const ov = await adminClient.getMediaOverview();
      setOverview(ov);
      setLimitImageMb(String(ov.limits.maxImageSizeMb));
      setLimitVideoMb(String(ov.limits.maxVideoSizeMb));
      setLimitDocMb(String(ov.limits.maxDocumentSizeMb));
    } catch {
      // Non-fatal fallback
    }
  }, []);

  const loadMedia = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminClient.listMedia({
        page,
        limit: 24,
        q: q.trim() || undefined,
        mediaType: mediaTypeFilter || undefined,
        category: categoryFilter || undefined,
        status: statusFilter || undefined,
      });
      setItems(res.items);
      setPagination(res.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در بارگذاری کتابخانه رسانه');
    } finally {
      setLoading(false);
    }
  }, [page, q, mediaTypeFilter, categoryFilter, statusFilter]);

  useEffect(() => {
    void loadMedia();
  }, [loadMedia]);

  useEffect(() => {
    void loadOverview();
  }, [loadOverview]);

  const openLimitsModal = () => {
    if (overview) {
      setLimitImageMb(String(overview.limits.maxImageSizeMb));
      setLimitVideoMb(String(overview.limits.maxVideoSizeMb));
      setLimitDocMb(String(overview.limits.maxDocumentSizeMb));
    }
    setLimitsError(null);
    setLimitsModalOpen(true);
  };

  const handleSaveLimits = async (e: React.FormEvent) => {
    e.preventDefault();
    setLimitsError(null);

    const parsed = AdminUpdateMediaLimitsDtoSchema.safeParse({
      maxImageSizeMb: Number(limitImageMb),
      maxVideoSizeMb: Number(limitVideoMb),
      maxDocumentSizeMb: Number(limitDocMb),
    });

    if (!parsed.success) {
      setLimitsError(parsed.error.issues[0]?.message || 'مقادیر واردشده معتبر نیست.');
      return;
    }

    setSavingLimits(true);
    try {
      const updated = await adminClient.updateMediaLimits(parsed.data);
      setOverview(updated);
      setLimitsModalOpen(false);
      toast.success('سقف حجم آپلود فایل‌ها ذخیره شد');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'خطا در ذخیره تنظیمات حجم آپلود';
      setLimitsError(msg);
      toast.error('خطا در ذخیره تنظیمات', msg);
    } finally {
      setSavingLimits(false);
    }
  };

  const openDetailDrawer = async (media: AdminMediaDto) => {
    setSelectedMedia(media);
    setEditAltText(media.altText || '');
    setEditCategory(media.category);
    setEditVisibility(media.visibility);
    setEditStatus(media.status);
    setUsages(null);
    setLoadingUsages(true);
    try {
      const usageList = await adminClient.getMediaUsage(media.id);
      setUsages(usageList);
    } catch {
      setUsages([]);
    } finally {
      setLoadingUsages(false);
    }
  };

  const handleSaveMetadata = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMedia) return;
    setSavingEdit(true);
    try {
      const updated = await adminClient.updateMedia(selectedMedia.id, {
        altText: editAltText.trim(),
        category: editCategory,
        visibility: editVisibility,
        status: editStatus,
      });
      setSelectedMedia(updated);
      setItems((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
      void loadOverview();
      toast.success('مشخصات رسانه به‌روزرسانی شد');
    } catch (err) {
      toast.error('خطا در ذخیره مشخصات', err instanceof Error ? err.message : undefined);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminClient.deleteMedia(deleteTarget.id);
      toast.success('رسانه با موفقیت حذف شد');
      setItems((prev) => prev.filter((m) => m.id !== deleteTarget.id));
      if (selectedMedia?.id === deleteTarget.id) {
        setSelectedMedia(null);
      }
      setDeleteTarget(null);
      void loadOverview();
    } catch (err) {
      if (err instanceof AdminApiError && err.status === 409) {
        toast.error(
          'امکان حذف وجود ندارد (۴۰۹)',
          err.message || 'این فایل هم‌اکنون در محتوای فعال یا منتشرشده استفاده می‌شود.'
        );
      } else {
        toast.error('خطا در حذف رسانه', err instanceof Error ? err.message : undefined);
      }
    } finally {
      setDeleting(false);
    }
  };

  const copyText = (value: string, label: string, fieldId: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(value);
      setCopiedField(fieldId);
      setTimeout(() => setCopiedField(null), 1800);
      toast.info(`${label} کپی شد`, value);
    }
  };

  const defaultUploadCategory: MediaCategory =
    MEDIA_CATEGORIES.includes(categoryFilter as MediaCategory)
      ? (categoryFilter as MediaCategory)
      : mediaTypeFilter === 'video'
        ? 'lesson_video'
        : mediaTypeFilter === 'document'
          ? 'downloadable_asset'
          : 'lesson_image';

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="کتابخانه رسانه و مدیریت فایل‌ها"
        description="آپلود و سازمان‌دهی تصاویر، ویدیوها و فایل‌های آموزشی با دسته‌بندی پوشه‌ای و پشتیبان‌گیری دائمی"
        breadcrumbs={[{ label: 'داشبورد', href: '/admin' }, { label: 'رسانه‌ها' }]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-white border border-slate-300 rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md ${
                  viewMode === 'grid' ? 'bg-slate-900 text-white' : 'text-slate-500'
                }`}
                aria-label="نمای شبکه‌ای"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md ${
                  viewMode === 'list' ? 'bg-slate-900 text-white' : 'text-slate-500'
                }`}
                aria-label="نمای فهرستی"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            {canUpdateSettings && (
              <AdminButton
                variant="outline"
                onClick={openLimitsModal}
                icon={<SlidersHorizontal className="w-4 h-4" />}
              >
                تنظیمات حجم آپلود
              </AdminButton>
            )}
            {hasPermission('media:upload') && (
              <AdminButton
                variant="primary"
                onClick={() => setShowUploader((v) => !v)}
                icon={<Upload className="w-4 h-4" />}
              >
                {showUploader ? 'بستن پنل آپلود' : 'بارگذاری فایل جدید'}
              </AdminButton>
            )}
          </div>
        }
      />

      {/* Storage Overview & Persistence Strip */}
      {overview && (
        <div className="bg-white border border-slate-200 rounded-lg p-4 grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <HardDrive className="w-4 h-4" />
            </div>
            <div>
              <div className="text-slate-500">حجم کل و تعداد فایل‌ها</div>
              <div className="font-semibold text-slate-900 mt-0.5 tabular-nums">
                {formatPersianNumber(overview.storage.totalFiles)} فایل ·{' '}
                <span dir="ltr" className="font-mono">
                  {formatBytes(overview.storage.totalBytes)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <div className="text-slate-500">ذخیره‌سازی دائمی دیتابیس</div>
              <div className="font-semibold text-slate-900 mt-0.5">
                {overview.storage.gridFsPersistentBackup
                  ? 'فعال (GridFS + بازیابی خودکار دیسک)'
                  : 'محلی (بدون اتصال GridFS)'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <Folder className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-slate-500">مسیر پوشه روی دیسک / گیت</div>
              <div dir="ltr" className="font-mono text-slate-900 font-semibold mt-0.5 truncate">
                {overview.storage.gitTrackedPath}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 md:border-r md:border-slate-100 md:pr-4">
            <div>
              <div className="text-slate-500">سقف آپلود فعلی (MB)</div>
              <div className="font-semibold text-slate-900 mt-0.5 tabular-nums">
                تصویر {formatPersianNumber(overview.limits.maxImageSizeMb)} · ویدیو{' '}
                {formatPersianNumber(overview.limits.maxVideoSizeMb)} · سند{' '}
                {formatPersianNumber(overview.limits.maxDocumentSizeMb)}
              </div>
            </div>
            {canUpdateSettings && (
              <button
                type="button"
                onClick={openLimitsModal}
                className="text-emerald-700 hover:underline font-semibold shrink-0"
              >
                تغییر
              </button>
            )}
          </div>
        </div>
      )}

      {showUploader && hasPermission('media:upload') && (
        <MediaUploaderZone
          defaultCategory={defaultUploadCategory}
          limitsOverride={overview?.limits}
          onUploaded={(uploaded) => {
            setItems((prev) => [uploaded, ...prev.filter((p) => p.id !== uploaded.id)]);
            void loadOverview();
          }}
        />
      )}

      {/* Category Folders Browser */}
      <div className="bg-white border border-slate-200 rounded-lg p-3.5 space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-800 flex items-center gap-1.5">
            <FolderOpen className="w-4 h-4 text-emerald-700" />
            <span>پوشه‌های دسته‌بندی فایل‌ها</span>
          </span>
          {categoryFilter && (
            <button
              type="button"
              onClick={() => {
                setCategoryFilter('');
                setPage(1);
              }}
              className="text-emerald-700 hover:underline font-medium"
            >
              نمایش همه پوشه‌ها
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          <button
            type="button"
            onClick={() => {
              setCategoryFilter('');
              setPage(1);
            }}
            className={`text-right rounded-lg border p-2.5 transition-colors ${
              categoryFilter === ''
                ? 'border-emerald-700 bg-emerald-50/70 text-emerald-950'
                : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
            }`}
          >
            <div className="text-xs font-semibold truncate">همه پوشه‌ها</div>
            <div className="text-[11px] text-slate-500 mt-1 tabular-nums">
              {overview
                ? `${formatPersianNumber(overview.storage.totalFiles)} فایل`
                : '—'}
            </div>
          </button>

          {MEDIA_CATEGORIES.map((cat) => {
            const folderStat = overview?.storage.folders.find((f) => f.category === cat);
            const active = categoryFilter === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setCategoryFilter(cat);
                  setPage(1);
                }}
                className={`text-right rounded-lg border p-2.5 transition-colors ${
                  active
                    ? 'border-emerald-700 bg-emerald-50/70 text-emerald-950'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold truncate">
                  {active ? (
                    <FolderOpen className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  ) : (
                    <Folder className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  )}
                  <span className="truncate">{MEDIA_CATEGORY_LABELS[cat]}</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500 tabular-nums">
                  <span>
                    {folderStat ? `${formatPersianNumber(folderStat.count)} فایل` : '۰ فایل'}
                  </span>
                  {folderStat && folderStat.totalBytes > 0 && (
                    <span dir="ltr" className="font-mono">
                      {formatBytes(folderStat.totalBytes)}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative">
          <AdminInput
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="جستجو در نام، مسیر یا توضیح فایل..."
            className="pl-9"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <AdminSelect
          value={mediaTypeFilter}
          onChange={(e) => {
            setMediaTypeFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">همه نوع‌های رسانه</option>
          <option value="image">تصویر</option>
          <option value="video">ویدیو</option>
          <option value="document">سند / فایل</option>
        </AdminSelect>

        <AdminSelect
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">همه دسته‌بندی‌ها</option>
          {MEDIA_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {MEDIA_CATEGORY_LABELS[cat]}
            </option>
          ))}
        </AdminSelect>

        <AdminSelect
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">همه وضعیت‌ها</option>
          {MEDIA_STATUSES.map((st) => (
            <option key={st} value={st}>
              {MEDIA_STATUS_LABELS[st]}
            </option>
          ))}
        </AdminSelect>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 animate-pulse">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="h-48 bg-white border border-slate-200 rounded-lg" />
          ))}
        </div>
      ) : error ? (
        <AdminErrorState message={error} onRetry={loadMedia} />
      ) : items.length === 0 ? (
        <AdminEmptyState
          title="هیچ رسانه‌ای در این پوشه یافت نشد"
          description="فایل‌های آپلودشده با توجه به دسته‌بندی در پوشه اختصاصی خود ذخیره و نمایش داده می‌شوند."
          action={
            hasPermission('media:upload') ? (
              <AdminButton
                variant="primary"
                onClick={() => setShowUploader(true)}
                icon={<Upload className="w-4 h-4" />}
              >
                آپلود فایل جدید
              </AdminButton>
            ) : undefined
          }
        />
      ) : viewMode === 'grid' ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map((item) => {
              const src = resolvePreviewMediaUrl(
                item.publicUrl || item.storageKey,
                item.id,
                item.visibility
              );
              return (
                <div
                  key={item.id}
                  onClick={() => openDetailDrawer(item)}
                  className="bg-white border border-slate-200 hover:border-emerald-600 rounded-lg overflow-hidden cursor-pointer transition-colors flex flex-col"
                >
                  <div className="h-40 bg-slate-100 flex items-center justify-center overflow-hidden relative">
                    {item.mediaType === 'image' && src ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={src}
                        alt={item.altText || item.originalFileName}
                        className="w-full h-full object-cover"
                      />
                    ) : item.mediaType === 'video' && src ? (
                      <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center text-white gap-1.5">
                        <Video className="w-9 h-9 text-emerald-400" />
                        <span className="text-[11px] font-mono text-slate-300">
                          {item.mimeType.replace('video/', '').toUpperCase()}
                        </span>
                      </div>
                    ) : (
                      <FileText className="w-10 h-10 text-slate-400" />
                    )}
                  </div>
                  <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="text-sm font-semibold text-slate-900 truncate" dir="auto">
                        {item.originalFileName}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                        {MEDIA_CATEGORY_LABELS[item.category]} ·{' '}
                        <span dir="ltr" className="font-mono">
                          {item.storageKey.split('/').slice(0, 2).join('/')}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      <MediaStatusLabel status={item.status} />
                      <span dir="ltr" className="font-mono text-slate-500 tabular-nums">
                        {formatBytes(item.sizeBytes)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <AdminPagination pagination={pagination} onPageChange={setPage} />
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <th className="px-4 py-3 font-semibold">نام فایل</th>
                  <th className="px-4 py-3 font-semibold">نوع</th>
                  <th className="px-4 py-3 font-semibold">پوشه دسته‌بندی</th>
                  <th className="px-4 py-3 font-semibold">حجم</th>
                  <th className="px-4 py-3 font-semibold">وضعیت</th>
                  <th className="px-4 py-3 font-semibold">تاریخ ثبت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => openDetailDrawer(item)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 font-semibold text-slate-900 max-w-xs truncate" dir="auto">
                      {item.originalFileName}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{MEDIA_TYPE_LABELS[item.mediaType]}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {MEDIA_CATEGORY_LABELS[item.category]}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-600 tabular-nums" dir="ltr">
                      {formatBytes(item.sizeBytes)}
                    </td>
                    <td className="px-4 py-3">
                      <MediaStatusLabel status={item.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-500 tabular-nums">
                      {formatPersianDateTime(item.createdAt)}
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

      {/* Upload Size Limits Modal */}
      <AdminModal
        open={limitsModalOpen}
        onClose={() => setLimitsModalOpen(false)}
        title="تنظیمات سقف حجم آپلود فایل‌ها"
        description="حداکثر حجم مجاز برای آپلود تصاویر، ویدیوها و اسناد آموزشی را بر حسب مگابایت تعیین کنید."
        maxWidthClass="max-w-lg"
      >
        <form onSubmit={handleSaveLimits} className="space-y-4">
          <AdminField
            label="حداکثر حجم تصویر (مگابایت)"
            hint="بازه مجاز: ۱ تا ۲۰۰ مگابایت"
            required
          >
            <AdminInput
              type="number"
              dir="ltr"
              min={1}
              max={200}
              value={limitImageMb}
              onChange={(e) => setLimitImageMb(e.target.value)}
            />
          </AdminField>

          <AdminField
            label="حداکثر حجم ویدیو (مگابایت)"
            hint="بازه مجاز: ۵ تا ۲۰۴۸ مگابایت"
            required
          >
            <AdminInput
              type="number"
              dir="ltr"
              min={5}
              max={2048}
              value={limitVideoMb}
              onChange={(e) => setLimitVideoMb(e.target.value)}
            />
          </AdminField>

          <AdminField
            label="حداکثر حجم اسناد و فایل‌های دانلودی (مگابایت)"
            hint="بازه مجاز: ۱ تا ۵۰۰ مگابایت"
            required
          >
            <AdminInput
              type="number"
              dir="ltr"
              min={1}
              max={500}
              value={limitDocMb}
              onChange={(e) => setLimitDocMb(e.target.value)}
            />
          </AdminField>

          {limitsError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {limitsError}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
            <AdminButton
              variant="outline"
              onClick={() => setLimitsModalOpen(false)}
              disabled={savingLimits}
            >
              انصراف
            </AdminButton>
            <AdminButton
              type="submit"
              variant="primary"
              isLoading={savingLimits}
              icon={<Save className="w-4 h-4" />}
            >
              ذخیره سقف حجم
            </AdminButton>
          </div>
        </form>
      </AdminModal>

      {/* Detail & Usage Drawer */}
      <AdminDrawer
        open={Boolean(selectedMedia)}
        onClose={() => setSelectedMedia(null)}
        title={selectedMedia?.originalFileName || 'جزئیات رسانه'}
        subtitle={selectedMedia ? MEDIA_TYPE_LABELS[selectedMedia.mediaType] : undefined}
        footer={
          selectedMedia && (
            <div className="flex items-center justify-between w-full gap-2">
              {hasPermission('media:delete') ? (
                <AdminButton
                  variant="danger"
                  size="sm"
                  onClick={() => setDeleteTarget(selectedMedia)}
                  icon={<Trash2 className="w-4 h-4" />}
                >
                  حذف فایل
                </AdminButton>
              ) : (
                <span />
              )}
              <AdminButton variant="outline" size="sm" onClick={() => setSelectedMedia(null)}>
                بستن
              </AdminButton>
            </div>
          )
        }
      >
        {selectedMedia && (
          <div className="space-y-6">
            {/* Preview Box */}
            <div className="rounded-lg border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center min-h-[180px]">
              {selectedMedia.mediaType === 'image' ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={resolvePreviewMediaUrl(
                    selectedMedia.publicUrl || selectedMedia.storageKey,
                    selectedMedia.id,
                    selectedMedia.visibility
                  )}
                  alt={selectedMedia.altText || selectedMedia.originalFileName}
                  className="max-h-72 w-auto object-contain"
                />
              ) : selectedMedia.mediaType === 'video' ? (
                <video
                  controls
                  preload="metadata"
                  playsInline
                  src={resolvePreviewMediaUrl(
                    selectedMedia.publicUrl || selectedMedia.storageKey,
                    selectedMedia.id,
                    selectedMedia.visibility
                  )}
                  className="w-full max-h-72 bg-black"
                />
              ) : (
                <div className="p-6 text-center space-y-2.5">
                  <FileText className="w-10 h-10 text-slate-400 mx-auto" />
                  <div className="text-xs font-mono text-slate-600">{selectedMedia.mimeType}</div>
                  <a
                    href={resolvePreviewMediaUrl(
                      selectedMedia.publicUrl || selectedMedia.storageKey,
                      selectedMedia.id,
                      selectedMedia.visibility
                    )}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:underline"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>دانلود / باز کردن فایل</span>
                  </a>
                </div>
              )}
            </div>

            {/* Technical Metadata */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-500">کلید و مسیر پوشه:</span>
                <button
                  type="button"
                  onClick={() => copyText(selectedMedia.storageKey, 'کلید ذخیره‌سازی', 'storageKey')}
                  className="inline-flex items-center gap-1.5 font-mono text-emerald-700 hover:underline truncate max-w-[260px]"
                  dir="ltr"
                >
                  {copiedField === 'storageKey' ? (
                    <Check className="w-3.5 h-3.5 shrink-0" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 shrink-0" />
                  )}
                  <span className="truncate">{selectedMedia.storageKey}</span>
                </button>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-500">نشانی مستقیم فایل:</span>
                <button
                  type="button"
                  onClick={() => {
                    const url =
                      resolvePreviewMediaUrl(
                        selectedMedia.publicUrl || selectedMedia.storageKey,
                        selectedMedia.id,
                        selectedMedia.visibility
                      ) || '';
                    copyText(url, 'نشانی فایل', 'publicUrl');
                  }}
                  className="inline-flex items-center gap-1.5 font-mono text-slate-700 hover:text-emerald-700 hover:underline truncate max-w-[260px]"
                  dir="ltr"
                >
                  {copiedField === 'publicUrl' ? (
                    <Check className="w-3.5 h-3.5 shrink-0 text-emerald-700" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 shrink-0" />
                  )}
                  <span className="truncate">
                    {resolvePreviewMediaUrl(
                      selectedMedia.publicUrl || selectedMedia.storageKey,
                      selectedMedia.id,
                      selectedMedia.visibility
                    )}
                  </span>
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">نوع MIME و حجم:</span>
                <span dir="ltr" className="font-mono text-slate-800 tabular-nums">
                  {selectedMedia.mimeType} · {formatBytes(selectedMedia.sizeBytes)}
                </span>
              </div>
              {selectedMedia.width && selectedMedia.height && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">ابعاد:</span>
                  <span dir="ltr" className="font-mono text-slate-800 tabular-nums">
                    {selectedMedia.width} × {selectedMedia.height}
                  </span>
                </div>
              )}
              {selectedMedia.checksumSha256 && (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-500">SHA-256:</span>
                  <span
                    dir="ltr"
                    className="font-mono text-[11px] text-slate-600 truncate max-w-[240px]"
                  >
                    {selectedMedia.checksumSha256}
                  </span>
                </div>
              )}
            </div>

            {/* Edit Metadata Form */}
            {hasPermission('media:update') && (
              <form
                onSubmit={handleSaveMetadata}
                className="space-y-3 border-t border-slate-200 pt-4"
              >
                <h3 className="text-xs font-bold text-slate-900">ویرایش مشخصات</h3>
                <AdminField label="متن جایگزین (Alt Text)">
                  <AdminInput
                    value={editAltText}
                    onChange={(e) => setEditAltText(e.target.value)}
                    maxLength={200}
                  />
                </AdminField>
                <div className="grid grid-cols-2 gap-3">
                  <AdminField label="دسته‌بندی">
                    <AdminSelect
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value as MediaCategory)}
                    >
                      {MEDIA_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {MEDIA_CATEGORY_LABELS[cat]}
                        </option>
                      ))}
                    </AdminSelect>
                  </AdminField>
                  <AdminField label="سطح دسترسی">
                    <AdminSelect
                      value={editVisibility}
                      onChange={(e) => setEditVisibility(e.target.value as MediaVisibility)}
                    >
                      <option value="public">عمومی</option>
                      <option value="admin">فقط مدیران</option>
                    </AdminSelect>
                  </AdminField>
                </div>
                <AdminField label="وضعیت">
                  <AdminSelect
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as MediaStatus)}
                  >
                    {MEDIA_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {MEDIA_STATUS_LABELS[st]}
                      </option>
                    ))}
                  </AdminSelect>
                </AdminField>
                <AdminButton
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={savingEdit}
                  icon={<Save className="w-4 h-4" />}
                >
                  ذخیره مشخصات
                </AdminButton>
              </form>
            )}

            {/* Usage References Inspector */}
            <div className="border-t border-slate-200 pt-4 space-y-2.5">
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Link2 className="w-4 h-4 text-slate-500" />
                <span>موارد استفاده در محتوا</span>
              </h3>
              {loadingUsages ? (
                <p className="text-xs text-slate-500">در حال بررسی ارجاع‌ها...</p>
              ) : !usages || usages.length === 0 ? (
                <p className="text-xs text-slate-500">
                  این فایل در هیچ دوره، درس، صفحه یا تنظیماتی استفاده نشده است.
                </p>
              ) : (
                <ul className="space-y-2">
                  {usages.map((u, idx) => (
                    <li
                      key={`${u.resourceType}_${u.resourceId}_${idx}`}
                      className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900 truncate">{u.title}</div>
                        <div className="text-[11px] text-slate-500">
                          {u.resourceType} · {u.field}
                        </div>
                      </div>
                      {u.resourceType === 'course' && (
                        <Link
                          href={`/admin/courses/${u.resourceId}`}
                          className="text-emerald-700 hover:underline shrink-0"
                        >
                          مشاهده
                        </Link>
                      )}
                      {u.resourceType === 'lesson' && (
                        <Link
                          href={`/admin/lessons/${u.resourceId}`}
                          className="text-emerald-700 hover:underline shrink-0"
                        >
                          مشاهده
                        </Link>
                      )}
                      {u.resourceType === 'site_page' && (
                        <Link
                          href={`/admin/pages/${u.resourceId}`}
                          className="text-emerald-700 hover:underline shrink-0"
                        >
                          مشاهده
                        </Link>
                      )}
                      {u.resourceType === 'site_settings' && (
                        <Link
                          href="/admin/settings"
                          className="text-emerald-700 hover:underline shrink-0"
                        >
                          تنظیمات
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </AdminDrawer>

      <AdminConfirmModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="حذف فایل رسانه"
        message={
          deleteTarget
            ? `آیا از حذف «${deleteTarget.originalFileName}» اطمینان دارید؟ در صورتی که این فایل در دوره‌ها یا درس‌های فعال استفاده شده باشد، سرور با خطای ۴۰۹ از حذف جلوگیری خواهد کرد.`
            : ''
        }
        confirmLabel="حذف دائمی"
        variant="danger"
        isLoading={deleting}
      />
    </div>
  );
}

export default function AdminMediaPage() {
  return (
    <AdminGuard requiredPermission="media:read">
      <MediaLibraryContent />
    </AdminGuard>
  );
}
