'use client';

import React, { useRef, useState } from 'react';
import { UploadCloud, FileUp, AlertCircle } from 'lucide-react';
import { MEDIA_CATEGORIES, MediaCategory, MediaVisibility } from '@techa/shared';
import { adminClient } from '../../../lib/admin/admin-client';
import { MEDIA_CATEGORY_LABELS } from '../../../lib/admin/admin-formatters';
import { AdminMediaDto } from '../../../lib/admin/admin-types';
import { AdminButton } from '../ui/AdminPrimitives';
import { AdminField, AdminInput, AdminSelect } from '../ui/AdminFormFields';
import { useAdminToast } from '../ui/ToastProvider';

export function MediaUploaderZone({
  defaultCategory = 'lesson_image',
  defaultVisibility = 'public',
  accept,
  onUploaded,
}: {
  defaultCategory?: MediaCategory;
  defaultVisibility?: MediaVisibility;
  accept?: string;
  onUploaded?: (media: AdminMediaDto) => void;
}) {
  const toast = useAdminToast();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [category, setCategory] = useState<MediaCategory>(defaultCategory);
  const [visibility, setVisibility] = useState<MediaVisibility>(defaultVisibility);
  const [altText, setAltText] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFilePick = (file: File | null) => {
    setErrorMsg(null);
    if (!file) return;
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setErrorMsg('لطفاً ابتدا یک فایل انتخاب کنید.');
      return;
    }

    setUploading(true);
    setProgress(0);
    setErrorMsg(null);
    try {
      const uploaded = await adminClient.uploadMediaFile({
        file: selectedFile,
        category,
        visibility,
        altText: altText.trim() || undefined,
        onProgress: (pct) => setProgress(pct),
      });
      toast.success('فایل با موفقیت آپلود شد', uploaded.originalFileName);
      setSelectedFile(null);
      setAltText('');
      setProgress(0);
      if (inputRef.current) inputRef.current.value = '';
      onUploaded?.(uploaded);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'آپلود فایل ناموفق بود.';
      setErrorMsg(msg);
      toast.error('خطا در بارگذاری رسانه', msg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const f = e.dataTransfer.files?.[0] || null;
          handleFilePick(f);
        }}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          dragOver
            ? 'border-emerald-600 bg-emerald-50/60'
            : 'border-slate-300 hover:border-emerald-500 bg-slate-50/50'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => handleFilePick(e.target.files?.[0] || null)}
        />
        <UploadCloud className="w-8 h-8 text-emerald-700 mx-auto mb-2" />
        <p className="text-sm font-semibold text-slate-800">
          {selectedFile ? selectedFile.name : 'فایل را اینجا بکشید و رها کنید یا کلیک کنید'}
        </p>
        <p className="text-xs text-slate-500 mt-1">
          پشتیبانی از تصاویر استاندارد، ویدیوی MP4/WebM و اسناد آموزشی (PDF/ZIP/...)
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <AdminField label="دسته‌بندی رسانه" htmlFor="upload-category">
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

        <AdminField label="متن جایگزین (Alt Text)" htmlFor="upload-alt">
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

      {uploading && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-600 tabular-nums">
            <span>در حال ارسال فایل به سرور...</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-600 transition-all duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="flex justify-end">
        <AdminButton
          variant="primary"
          onClick={handleUpload}
          isLoading={uploading}
          disabled={!selectedFile}
          icon={<FileUp className="w-4 h-4" />}
        >
          شروع بارگذاری فایل
        </AdminButton>
      </div>
    </div>
  );
}
