'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  FileUp,
  FolderOpen,
  Image as ImageIcon,
  Loader2,
  Trash2,
  UploadCloud,
  Video,
  X,
} from 'lucide-react';
import { MEDIA_CATEGORIES, MediaCategory, MediaVisibility } from '@techa/shared';
import { adminClient, UploadProgressTelemetry } from '../../../lib/admin/admin-client';
import {
  MEDIA_CATEGORY_LABELS,
  formatBytes,
  formatEtaPersian,
  formatPersianNumber,
  formatUploadSpeed,
} from '../../../lib/admin/admin-formatters';
import { AdminMediaDto, AdminMediaOverviewDto } from '../../../lib/admin/admin-types';
import { AdminButton } from '../ui/AdminPrimitives';
import { AdminField, AdminInput, AdminSelect } from '../ui/AdminFormFields';
import { useAdminToast } from '../ui/ToastProvider';

const DEFAULT_ACCEPT =
  'image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime,video/x-m4v,video/ogg,.mp4,.webm,.mov,.m4v,.ogv,.ogg,.pdf,.zip';

interface QueueItem {
  localId: string;
  file: File;
  previewUrl: string | null;
  kind: 'image' | 'video' | 'document';
  status: 'queued' | 'uploading' | 'processing' | 'done' | 'error' | 'cancelled';
  telemetry: UploadProgressTelemetry;
  errorMsg?: string;
  uploadedMedia?: AdminMediaDto;
}

function detectClientFileKind(file: File): 'image' | 'video' | 'document' {
  const mime = (file.type || '').toLowerCase();
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  if (mime.startsWith('image/') || ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) {
    return 'image';
  }
  if (mime.startsWith('video/') || ['mp4', 'webm', 'mov', 'm4v', 'ogv', 'ogg'].includes(ext)) {
    return 'video';
  }
  return 'document';
}

export function MediaUploaderZone({
  defaultCategory = 'lesson_image',
  defaultVisibility = 'public',
  accept = DEFAULT_ACCEPT,
  limitsOverride,
  singleFile = false,
  onUploaded,
  onBatchComplete,
}: {
  defaultCategory?: MediaCategory;
  defaultVisibility?: MediaVisibility;
  accept?: string;
  limitsOverride?: AdminMediaOverviewDto['limits'];
  singleFile?: boolean;
  onUploaded?: (media: AdminMediaDto) => void;
  onBatchComplete?: (items: AdminMediaDto[]) => void;
}) {
  const toast = useAdminToast();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const activeAbortRef = useRef<AbortController | null>(null);
  const queueRef = useRef<QueueItem[]>([]);

  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [category, setCategory] = useState<MediaCategory>(defaultCategory);
  const [visibility, setVisibility] = useState<MediaVisibility>(defaultVisibility);
  const [altText, setAltText] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [limits, setLimits] = useState<AdminMediaOverviewDto['limits'] | null>(
    limitsOverride || null
  );

  useEffect(() => {
    setCategory(defaultCategory);
  }, [defaultCategory]);

  useEffect(() => {
    if (limitsOverride) {
      setLimits(limitsOverride);
    }
  }, [limitsOverride]);

  useEffect(() => {
    if (limitsOverride) return;
    let mounted = true;
    adminClient
      .getMediaOverview()
      .then((res) => {
        if (mounted) setLimits(res.limits);
      })
      .catch(() => {
        // Non-blocking fallback
      });
    return () => {
      mounted = false;
    };
  }, [limitsOverride]);

  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  // Revoke object URLs on unmount
  useEffect(() => {
    return () => {
      queueRef.current.forEach((item) => {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      });
    };
  }, []);

  const activeLimits = useMemo(
    () =>
      limits || {
        maxImageSizeMb: 10,
        maxVideoSizeMb: 200,
        maxDocumentSizeMb: 50,
        maxImageBytes: 10 * 1024 * 1024,
        maxVideoBytes: 200 * 1024 * 1024,
        maxDocumentBytes: 50 * 1024 * 1024,
      },
    [limits]
  );

  const validateFileSize = (file: File, kind: 'image' | 'video' | 'document'): string | null => {
    if (file.size <= 0) return 'فایل انتخاب‌شده خالی است.';
    const maxBytes =
      kind === 'image'
        ? activeLimits.maxImageBytes
        : kind === 'video'
          ? activeLimits.maxVideoBytes
          : activeLimits.maxDocumentBytes;
    const maxMb =
      kind === 'image'
        ? activeLimits.maxImageSizeMb
        : kind === 'video'
          ? activeLimits.maxVideoSizeMb
          : activeLimits.maxDocumentSizeMb;
    if (file.size > maxBytes) {
      return `حجم فایل (${formatBytes(file.size)}) از سقف مجاز فعلی (${maxMb} MB) بیشتر است.`;
    }
    return null;
  };

  const addFilesToQueue = (fileList: FileList | File[] | null) => {
    if (!fileList) return;
    const incoming = Array.from(fileList);
    if (incoming.length === 0) return;

    setErrorMsg(null);
    const chosen = singleFile ? incoming.slice(0, 1) : incoming;

    const newItems: QueueItem[] = chosen.map((file) => {
      const kind = detectClientFileKind(file);
      const sizeError = validateFileSize(file, kind);
      const previewUrl =
        kind === 'image' || kind === 'video' ? URL.createObjectURL(file) : null;

      return {
        localId: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        file,
        previewUrl,
        kind,
        status: sizeError ? 'error' : 'queued',
        errorMsg: sizeError || undefined,
        telemetry: {
          percent: 0,
          loadedBytes: 0,
          totalBytes: file.size,
          speedBytesPerSec: 0,
          etaSeconds: null,
          phase: 'uploading',
        },
      };
    });

    setQueue((prev) => {
      if (singleFile) {
        prev.forEach((p) => {
          if (p.previewUrl) URL.revokeObjectURL(p.previewUrl);
        });
        return newItems;
      }
      return [...prev, ...newItems];
    });
  };

  const removeQueueItem = (localId: string) => {
    setQueue((prev) => {
      const target = prev.find((q) => q.localId === localId);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((q) => q.localId !== localId);
    });
  };

  const clearCompletedOrAll = (onlyCompleted = false) => {
    setQueue((prev) => {
      const kept: QueueItem[] = [];
      for (const item of prev) {
        if (onlyCompleted && item.status !== 'done') {
          kept.push(item);
        } else if (item.previewUrl) {
          URL.revokeObjectURL(item.previewUrl);
        }
      }
      return kept;
    });
  };

  const cancelActiveUpload = () => {
    if (activeAbortRef.current) {
      activeAbortRef.current.abort();
      activeAbortRef.current = null;
    }
  };

  const handleUploadQueue = async () => {
    const pendingItems = queue.filter(
      (q) => q.status === 'queued' || q.status === 'cancelled' || q.status === 'error'
    );
    const validToUpload = pendingItems.filter((item) => !validateFileSize(item.file, item.kind));

    if (validToUpload.length === 0) {
      setErrorMsg('هیچ فایل معتبر و آماده آپلودی در صف وجود ندارد.');
      return;
    }

    setUploading(true);
    setErrorMsg(null);
    const completedMedia: AdminMediaDto[] = [];

    for (const item of validToUpload) {
      const controller = new AbortController();
      activeAbortRef.current = controller;

      setQueue((prev) =>
        prev.map((q) =>
          q.localId === item.localId
            ? {
                ...q,
                status: 'uploading',
                errorMsg: undefined,
                telemetry: {
                  ...q.telemetry,
                  percent: 0,
                  loadedBytes: 0,
                  speedBytesPerSec: 0,
                  etaSeconds: null,
                  phase: 'uploading',
                },
              }
            : q
        )
      );

      try {
        const uploaded = await adminClient.uploadMediaFile({
          file: item.file,
          category,
          visibility,
          altText: altText.trim() || undefined,
          signal: controller.signal,
          onProgressDetails: (telemetry) => {
            setQueue((prev) =>
              prev.map((q) =>
                q.localId === item.localId
                  ? {
                      ...q,
                      status: telemetry.phase === 'processing' ? 'processing' : 'uploading',
                      telemetry,
                    }
                  : q
              )
            );
          },
        });

        completedMedia.push(uploaded);
        setQueue((prev) =>
          prev.map((q) =>
            q.localId === item.localId
              ? {
                  ...q,
                  status: 'done',
                  uploadedMedia: uploaded,
                  telemetry: {
                    percent: 100,
                    loadedBytes: item.file.size,
                    totalBytes: item.file.size,
                    speedBytesPerSec: q.telemetry.speedBytesPerSec,
                    etaSeconds: 0,
                    phase: 'done',
                  },
                }
              : q
          )
        );
        onUploaded?.(uploaded);
      } catch (err) {
        const isAborted =
          err instanceof Error &&
          ((err as { code?: string }).code === 'UPLOAD_ABORTED' || err.message.includes('لغو'));
        const msg = err instanceof Error ? err.message : 'آپلود فایل ناموفق بود.';

        setQueue((prev) =>
          prev.map((q) =>
            q.localId === item.localId
              ? {
                  ...q,
                  status: isAborted ? 'cancelled' : 'error',
                  errorMsg: msg,
                }
              : q
          )
        );
        if (isAborted) {
          toast.info('آپلود لغو شد', item.file.name);
          break;
        } else {
          toast.error('خطا در بارگذاری فایل', `${item.file.name}: ${msg}`);
        }
      } finally {
        activeAbortRef.current = null;
      }
    }

    setUploading(false);
    if (completedMedia.length > 0) {
      toast.success(
        `${formatPersianNumber(completedMedia.length)} فایل با موفقیت ذخیره شد`,
        `پوشه ${MEDIA_CATEGORY_LABELS[category]} + پشتیبان دائمی دیتابیس`
      );
      if (inputRef.current) inputRef.current.value = '';
      setAltText('');
      onBatchComplete?.(completedMedia);
    }
  };

  const pendingUploadCount = queue.filter(
    (q) =>
      (q.status === 'queued' || q.status === 'cancelled' || q.status === 'error') &&
      !validateFileSize(q.file, q.kind)
  ).length;

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
      {/* Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!uploading) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (!uploading) {
            addFilesToQueue(e.dataTransfer.files);
          }
        }}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          uploading ? 'opacity-70 cursor-not-allowed' : ''
        } ${
          dragOver
            ? 'border-emerald-600 bg-emerald-50/60'
            : 'border-slate-300 hover:border-emerald-500 bg-slate-50/50'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple={!singleFile}
          accept={accept}
          className="hidden"
          onChange={(e) => addFilesToQueue(e.target.files)}
        />
        <UploadCloud className="w-8 h-8 text-emerald-700 mx-auto mb-2" />
        <p className="text-sm font-semibold text-slate-800">
          فایل‌ها را اینجا بکشید و رها کنید یا کلیک کنید
        </p>
        <p className="text-xs text-slate-500 mt-1">
          پشتیبانی از تصاویر (JPG, PNG, WebP, GIF)، ویدیوها (MP4, WebM, MOV, OGG) و اسناد (PDF, ZIP)
        </p>
        <div
          dir="rtl"
          className="mt-2.5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] text-slate-600 tabular-nums"
        >
          <span>سقف مجاز تصویر: {formatPersianNumber(activeLimits.maxImageSizeMb)} مگابایت</span>
          <span aria-hidden="true">·</span>
          <span>ویدیو: {formatPersianNumber(activeLimits.maxVideoSizeMb)} مگابایت</span>
          <span aria-hidden="true">·</span>
          <span>سند/فایل: {formatPersianNumber(activeLimits.maxDocumentSizeMb)} مگابایت</span>
        </div>
      </div>

      {/* Category / Visibility / Alt Metadata */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <AdminField
          label="پوشه دسته‌بندی مقصد"
          htmlFor="upload-category"
          hint={`مسیر ذخیره: media/${category}/`}
        >
          <AdminSelect
            id="upload-category"
            value={category}
            onChange={(e) => setCategory(e.target.value as MediaCategory)}
            disabled={uploading}
          >
            {MEDIA_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {MEDIA_CATEGORY_LABELS[cat]}
              </option>
            ))}
          </AdminSelect>
        </AdminField>

        <AdminField label="سطح دسترسی فایل" htmlFor="upload-visibility">
          <AdminSelect
            id="upload-visibility"
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as MediaVisibility)}
            disabled={uploading}
          >
            <option value="public">عمومی (قابل نمایش در سایت)</option>
            <option value="admin">مخصوص پنل مدیریت</option>
          </AdminSelect>
        </AdminField>

        <AdminField label="متن جایگزین پیش‌فرض (Alt Text)" htmlFor="upload-alt">
          <AdminInput
            id="upload-alt"
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            placeholder="توضیح کوتاه برای دسترسی‌پذیری..."
            maxLength={200}
            disabled={uploading}
          />
        </AdminField>
      </div>

      {/* Upload Queue with Real-time Progress Bar, Speed, ETA & Cancel */}
      {queue.length > 0 && (
        <div className="border border-slate-200 rounded-lg divide-y divide-slate-200 bg-slate-50/40">
          <div className="px-4 py-2.5 flex items-center justify-between bg-slate-50 rounded-t-lg">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
              <FolderOpen className="w-4 h-4 text-emerald-700" />
              <span>صف بارگذاری ({formatPersianNumber(queue.length)} فایل)</span>
            </div>
            {!uploading && (
              <button
                type="button"
                onClick={() => clearCompletedOrAll(false)}
                className="text-[11px] text-slate-500 hover:text-red-600 transition-colors"
              >
                پاک کردن صف
              </button>
            )}
          </div>

          {queue.map((item) => {
            const isWorking = item.status === 'uploading' || item.status === 'processing';
            return (
              <div key={item.localId} className="p-3.5 space-y-2.5 bg-white first:rounded-t-none last:rounded-b-lg">
                <div className="flex items-center gap-3">
                  {/* Thumbnail Preview */}
                  <div className="w-12 h-12 rounded-md border border-slate-200 bg-slate-100 shrink-0 overflow-hidden flex items-center justify-center">
                    {item.kind === 'image' && item.previewUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.previewUrl}
                        alt={item.file.name}
                        className="w-full h-full object-cover"
                      />
                    ) : item.kind === 'video' ? (
                      <Video className="w-5 h-5 text-emerald-700" />
                    ) : item.kind === 'image' ? (
                      <ImageIcon className="w-5 h-5 text-slate-400" />
                    ) : (
                      <FileText className="w-5 h-5 text-slate-400" />
                    )}
                  </div>

                  {/* File Name & Metadata */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-900 truncate" dir="auto">
                        {item.file.name}
                      </span>
                      <span dir="ltr" className="text-[11px] font-mono text-slate-500 tabular-nums shrink-0">
                        {formatBytes(item.file.size)}
                      </span>
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px]">
                      {item.status === 'queued' && (
                        <span className="text-slate-500">آماده ارسال به پوشه {category}</span>
                      )}
                      {item.status === 'uploading' && (
                        <>
                          <span className="text-emerald-700 font-medium">در حال آپلود...</span>
                          <span aria-hidden="true">·</span>
                          <span dir="ltr" className="font-mono text-slate-700 tabular-nums">
                            {formatUploadSpeed(item.telemetry.speedBytesPerSec)}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span dir="ltr" className="font-mono text-slate-600 tabular-nums">
                            {formatBytes(item.telemetry.loadedBytes)} / {formatBytes(item.telemetry.totalBytes)}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="text-slate-600 tabular-nums">
                            زمان باقی‌مانده: {formatEtaPersian(item.telemetry.etaSeconds)}
                          </span>
                        </>
                      )}
                      {item.status === 'processing' && (
                        <span className="text-amber-700 inline-flex items-center gap-1.5 font-medium">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          در حال تایید امنیتی و ذخیره دائمی در دیسک و دیتابیس...
                        </span>
                      )}
                      {item.status === 'done' && (
                        <span className="text-emerald-700 inline-flex items-center gap-1 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          ذخیره شد ({item.uploadedMedia?.storageKey})
                        </span>
                      )}
                      {(item.status === 'error' || item.status === 'cancelled') && (
                        <span className="text-red-700 inline-flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          {item.errorMsg || 'خطا در آپلود'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Row Actions */}
                  <div className="shrink-0">
                    {isWorking ? (
                      <button
                        type="button"
                        onClick={cancelActiveUpload}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-red-200 text-red-700 hover:bg-red-50 text-[11px] font-medium whitespace-nowrap"
                        title="لغو آپلود"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>لغو</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => removeQueueItem(item.localId)}
                        disabled={uploading}
                        className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-slate-100 disabled:opacity-40"
                        title="حذف از صف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Real Progress Bar */}
                {(isWorking || item.status === 'done') && (
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-150 ${
                          item.status === 'done'
                            ? 'bg-emerald-600'
                            : item.status === 'processing'
                              ? 'bg-amber-500 animate-pulse'
                              : 'bg-emerald-600'
                        }`}
                        style={{ width: `${item.telemetry.percent}%` }}
                      />
                    </div>
                    <span
                      dir="ltr"
                      className="text-[11px] font-mono font-semibold text-slate-700 tabular-nums w-10 text-left"
                    >
                      {item.telemetry.percent}%
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {errorMsg && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <span className="text-[11px] text-slate-500">
          فایل‌ها هم در پوشه گیت (<span className="font-mono" dir="ltr">backend/storage/media/{category}</span>) و هم در دیتابیس ذخیره می‌شوند.
        </span>
        <AdminButton
          variant="primary"
          onClick={handleUploadQueue}
          isLoading={uploading}
          disabled={pendingUploadCount === 0}
          icon={<FileUp className="w-4 h-4" />}
        >
          {pendingUploadCount > 1
            ? `شروع بارگذاری (${formatPersianNumber(pendingUploadCount)} فایل)`
            : 'شروع بارگذاری فایل'}
        </AdminButton>
      </div>
    </div>
  );
}
