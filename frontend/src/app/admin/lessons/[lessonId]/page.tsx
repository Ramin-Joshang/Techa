'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import {
  Archive,
  CheckCircle2,
  Eye,
  History,
  Layers,
  Save,
  Settings2,
  XCircle,
} from 'lucide-react';
import {
  AdminUpdateLessonDtoSchema,
  ContentBlock,
  SeoMetadata,
} from '@techa/shared';
import AdminGuard, { AdminGuardLoadingSkeleton } from '../../../../components/admin/auth/AdminGuard';
import ContentBlocksEditor from '../../../../components/admin/content-editor/ContentBlocksEditor';
import {
  cleanBlockBeforeSubmit,
  validateBlocksWithSharedSchema,
} from '../../../../components/admin/content-editor/block-factories';
import { SeoFieldsSection } from '../../../../components/admin/shared/SeoFieldsSection';
import {
  AdminButton,
  AdminConfirmModal,
  AdminErrorState,
  AdminPageHeader,
  ConflictResolutionModal,
  PublicationStatusLabel,
} from '../../../../components/admin/ui/AdminPrimitives';
import { AdminField, AdminInput } from '../../../../components/admin/ui/AdminFormFields';
import { useAdminToast } from '../../../../components/admin/ui/ToastProvider';
import ContentBlocksRenderer from '../../../../components/docs/content/ContentBlocksRenderer';
import { useAdminAuth } from '../../../../context/AdminAuthContext';
import { adminClient, AdminApiError } from '../../../../lib/admin/admin-client';
import {
  formatPersianDateTime,
  formatPersianNumber,
  prepareBlocksForPreview,
} from '../../../../lib/admin/admin-formatters';
import { AdminLessonDto, AdminLessonPreviewDto } from '../../../../lib/admin/admin-types';
import { useUnsavedChangesWarning } from '../../../../lib/admin/use-unsaved-guard';

const InteractiveSandbox = dynamic(
  () => import('../../../../components/docs/content/InteractiveSandbox'),
  { ssr: false }
);

function LessonPreviewSection({
  blocks,
  title,
  readingTimeMinutes,
}: {
  blocks: ContentBlock[];
  title: string;
  readingTimeMinutes: number;
}) {
  const prepared = prepareBlocksForPreview(blocks);
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 max-w-4xl mx-auto space-y-6">
      <div className="border-b border-slate-200 pb-4 space-y-2">
        <div className="text-xs font-medium text-emerald-700">حالت پیش‌نمایش درس</div>
        <h2 className="text-2xl font-extrabold text-slate-900">{title}</h2>
        <div className="text-xs text-slate-500 tabular-nums">
          زمان مطالعه تخمینی: {formatPersianNumber(readingTimeMinutes)} دقیقه
        </div>
      </div>

      <div className="space-y-4">
        {prepared.map((block) =>
          block.type === 'interactiveExample' ? (
            <InteractiveSandbox
              key={block.id}
              environment={block.data.environment}
              preset={block.data.preset}
              title={block.data.title}
              description={block.data.description}
              files={block.data.files}
            />
          ) : (
            <ContentBlocksRenderer key={block.id} blocks={[block]} />
          )
        )}
      </div>
    </div>
  );
}

function LessonEditorContent() {
  const params = useParams<{ lessonId: string }>();
  const lessonId = params?.lessonId || '';
  const { hasPermission } = useAdminAuth();
  const toast = useAdminToast();

  const [lesson, setLesson] = useState<AdminLessonDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'editor' | 'metadata' | 'preview'>('editor');

  // Form states
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [order, setOrder] = useState(0);
  const [readingTimeMinutes, setReadingTimeMinutes] = useState(1);
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [seo, setSeo] = useState<SeoMetadata>({ metaTitle: '', metaDescription: '' });
  const [changeSummary, setChangeSummary] = useState('');
  const [isDirty, setIsDirty] = useState(false);

  const [saving, setSaving] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  // Server preview state
  const [previewSource, setPreviewSource] = useState<'draft' | 'server'>('draft');
  const [serverPreview, setServerPreview] = useState<AdminLessonPreviewDto | null>(null);
  const [loadingServerPreview, setLoadingServerPreview] = useState(false);

  // 409 Conflict & Confirm
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

  const applyLessonToState = useCallback((doc: AdminLessonDto) => {
    setLesson(doc);
    setTitle(doc.title);
    setSlug(doc.slug);
    setOrder(doc.order ?? 0);
    setReadingTimeMinutes(doc.readingTimeMinutes ?? 1);
    setContentBlocks(doc.contentBlocks || []);
    setSeo({
      metaTitle: doc.seo?.metaTitle || '',
      metaDescription: doc.seo?.metaDescription || '',
      canonicalUrlOverride: doc.seo?.canonicalUrlOverride,
      ogImageStorageKey: doc.seo?.ogImageStorageKey,
    });
    setChangeSummary('');
    setIsDirty(false);
    setLastSavedAt(doc.updatedAt);
  }, []);

  const loadLesson = useCallback(async () => {
    if (!lessonId) return;
    setLoading(true);
    setError(null);
    try {
      const doc = await adminClient.getLesson(lessonId);
      applyLessonToState(doc);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در بارگذاری درس');
    } finally {
      setLoading(false);
    }
  }, [lessonId, applyLessonToState]);

  useEffect(() => {
    void loadLesson();
  }, [loadLesson]);

  const executeSave = useCallback(
    async (isAutoSave = false) => {
      if (!lesson || saving || conflictState.open) return;

      const cleanedBlocks = contentBlocks.map(cleanBlockBeforeSubmit);
      const blockValidation = validateBlocksWithSharedSchema(cleanedBlocks);
      if (!blockValidation.valid) {
        if (!isAutoSave) {
          toast.error(
            'خطای اعتبارسنجی بلوک‌های محتوا',
            blockValidation.arrayErrors[0] ||
              Object.values(blockValidation.blockErrors)[0]?.[0] ||
              'لطفاً خطاهای بلوک‌ها را بررسی کنید.'
          );
        }
        return;
      }

      const dtoPayload = {
        title: title.trim(),
        slug: slug.trim(),
        order: Math.max(0, Math.trunc(order)),
        readingTimeMinutes: Math.max(1, Math.min(600, Math.trunc(readingTimeMinutes))),
        contentSchemaVersion: 1 as const,
        contentBlocks: cleanedBlocks,
        seo: {
          metaTitle: seo.metaTitle.trim(),
          metaDescription: seo.metaDescription.trim(),
          canonicalUrlOverride: seo.canonicalUrlOverride?.trim() || undefined,
          ogImageStorageKey: seo.ogImageStorageKey?.trim() || undefined,
        },
        expectedVersion: lesson.version,
        changeSummary: isAutoSave
          ? 'ذخیره خودکار پیش‌نویس'
          : changeSummary.trim() || undefined,
      };

      const parsed = AdminUpdateLessonDtoSchema.safeParse(dtoPayload);
      if (!parsed.success) {
        if (!isAutoSave) {
          toast.error('خطا در مشخصات درس', parsed.error.issues[0]?.message);
        }
        return;
      }

      setSaving(true);
      try {
        const updated = await adminClient.updateLesson(lesson.id, parsed.data);
        setLesson(updated);
        setLastSavedAt(updated.updatedAt);
        setIsDirty(false);
        if (!isAutoSave) {
          setChangeSummary('');
          toast.success('درس با موفقیت ذخیره شد');
        }
      } catch (err) {
        if (err instanceof AdminApiError && err.status === 409) {
          const details = err.details as { currentVersion?: number } | undefined;
          setConflictState({
            open: true,
            serverVersion: details?.currentVersion,
            message: err.message,
          });
        } else if (!isAutoSave) {
          toast.error('خطا در ذخیره درس', err instanceof Error ? err.message : undefined);
        }
      } finally {
        setSaving(false);
      }
    },
    [
      lesson,
      saving,
      conflictState.open,
      contentBlocks,
      title,
      slug,
      order,
      readingTimeMinutes,
      seo,
      changeSummary,
      toast,
    ]
  );

  // Debounced auto-save after 12 seconds of inactivity when dirty
  useEffect(() => {
    if (!autoSaveEnabled || !isDirty || !hasPermission('lessons:update') || conflictState.open) {
      return;
    }
    const timer = setTimeout(() => {
      void executeSave(true);
    }, 12000);
    return () => clearTimeout(timer);
  }, [autoSaveEnabled, isDirty, hasPermission, conflictState.open, executeSave]);

  const handleLoadServerPreview = async () => {
    if (!lesson) return;
    setLoadingServerPreview(true);
    try {
      const res = await adminClient.previewLesson(lesson.id);
      setServerPreview(res);
      setPreviewSource('server');
    } catch (err) {
      toast.error('خطا در دریافت پیش‌نمایش سرور', err instanceof Error ? err.message : undefined);
    } finally {
      setLoadingServerPreview(false);
    }
  };

  const handleLifecycle = async () => {
    if (!lesson || !confirmAction) return;
    setLifecycleLoading(true);
    try {
      const updated =
        confirmAction === 'publish'
          ? await adminClient.publishLesson(lesson.id, { expectedVersion: lesson.version })
          : confirmAction === 'unpublish'
            ? await adminClient.unpublishLesson(lesson.id, { expectedVersion: lesson.version })
            : await adminClient.archiveLesson(lesson.id, { expectedVersion: lesson.version });
      applyLessonToState(updated);
      setConfirmAction(null);
      toast.success('وضعیت درس به‌روزرسانی شد');
    } catch (err) {
      if (err instanceof AdminApiError && err.status === 409) {
        const details = err.details as { currentVersion?: number } | undefined;
        setConfirmAction(null);
        setConflictState({
          open: true,
          serverVersion: details?.currentVersion,
          message: err.message,
        });
      } else {
        toast.error('عملیات ناموفق بود', err instanceof Error ? err.message : undefined);
      }
    } finally {
      setLifecycleLoading(false);
    }
  };

  if (loading) return <AdminGuardLoadingSkeleton />;
  if (error || !lesson) {
    return <AdminErrorState message={error || 'درس مورد نظر یافت نشد.'} onRetry={loadLesson} />;
  }

  const canUpdate = hasPermission('lessons:update');

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={lesson.title}
        description={`نسخه v${lesson.version} · آخرین ذخیره: ${formatPersianDateTime(lastSavedAt)} ${
          isDirty ? '· دارای تغییرات ذخیره‌نشده' : ''
        }`}
        breadcrumbs={[
          { label: 'داشبورد', href: '/admin' },
          { label: 'دوره‌ها', href: '/admin/courses' },
          { label: 'دوره والد', href: `/admin/courses/${lesson.courseId}` },
          { label: 'فصل والد', href: `/admin/chapters/${lesson.chapterId}` },
          { label: lesson.title },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <PublicationStatusLabel status={lesson.status} />

            {canUpdate && (
              <label className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoSaveEnabled}
                  onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                  className="accent-emerald-700"
                />
                <span>ذخیره خودکار</span>
              </label>
            )}

            {hasPermission('revisions:read') && (
              <Link
                href={`/admin/revisions?resourceType=lesson&resourceId=${lesson.id}`}
                className="inline-flex items-center gap-1.5 min-h-[36px] px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-medium text-slate-800"
              >
                <History className="w-4 h-4 text-slate-500" />
                <span>تاریخچه نسخه‌ها</span>
              </Link>
            )}

            {canUpdate && (
              <AdminButton
                variant="primary"
                size="sm"
                isLoading={saving}
                onClick={() => executeSave(false)}
                icon={<Save className="w-4 h-4" />}
              >
                ذخیره درس
              </AdminButton>
            )}

            {hasPermission('lessons:publish') && lesson.status !== 'published' && (
              <AdminButton
                variant="secondary"
                size="sm"
                onClick={() => setConfirmAction('publish')}
                icon={<CheckCircle2 className="w-4 h-4" />}
              >
                انتشار درس
              </AdminButton>
            )}
            {hasPermission('lessons:publish') && lesson.status === 'published' && (
              <AdminButton
                variant="outline"
                size="sm"
                onClick={() => setConfirmAction('unpublish')}
                icon={<XCircle className="w-4 h-4 text-amber-600" />}
              >
                لغو انتشار
              </AdminButton>
            )}
            {hasPermission('lessons:archive') && lesson.status !== 'archived' && (
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

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-1 bg-white border border-slate-200 rounded-lg p-1 w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('editor')}
          className={`px-4 py-2 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
            activeTab === 'editor'
              ? 'bg-[#042A1B] text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>محتوای درس ({formatPersianNumber(contentBlocks.length)} بلوک)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('metadata')}
          className={`px-4 py-2 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
            activeTab === 'metadata'
              ? 'bg-[#042A1B] text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Settings2 className="w-4 h-4" />
          <span>مشخصات و سئو</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('preview')}
          className={`px-4 py-2 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
            activeTab === 'preview'
              ? 'bg-[#042A1B] text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>پیش‌نمایش کامل درس</span>
        </button>
      </div>

      {activeTab === 'editor' && (
        <div className="space-y-4">
          <ContentBlocksEditor
            blocks={contentBlocks}
            disabled={!canUpdate}
            onChange={(next) => {
              setContentBlocks(next);
              setIsDirty(true);
            }}
          />

          {canUpdate && (
            <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div className="flex-1 max-w-lg">
                <AdminField label="خلاصه تغییر این ذخیره (برای Revision - اختیاری)">
                  <AdminInput
                    value={changeSummary}
                    maxLength={500}
                    onChange={(e) => setChangeSummary(e.target.value)}
                    placeholder="مثال: افزودن مثال تعاملی جدید و جدول مقایسه"
                  />
                </AdminField>
              </div>
              <AdminButton
                variant="primary"
                isLoading={saving}
                onClick={() => executeSave(false)}
                icon={<Save className="w-4 h-4" />}
              >
                ذخیره تغییرات درس
              </AdminButton>
            </div>
          )}
        </div>
      )}

      {activeTab === 'metadata' && (
        <div className="space-y-6">
          <section className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              اطلاعات پایه درس
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AdminField label="عنوان درس" required>
                <AdminInput
                  value={title}
                  maxLength={150}
                  disabled={!canUpdate}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setIsDirty(true);
                  }}
                />
              </AdminField>
              <AdminField label="اسلاگ URL درس" required>
                <AdminInput
                  dir="ltr"
                  className="font-mono text-xs"
                  value={slug}
                  maxLength={100}
                  disabled={!canUpdate}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setIsDirty(true);
                  }}
                />
              </AdminField>
              <AdminField label="ترتیب نمایش">
                <AdminInput
                  type="number"
                  min={0}
                  dir="ltr"
                  value={order}
                  disabled={!canUpdate}
                  onChange={(e) => {
                    setOrder(Math.max(0, Number(e.target.value) || 0));
                    setIsDirty(true);
                  }}
                />
              </AdminField>
              <AdminField label="زمان مطالعه (دقیقه)" required>
                <AdminInput
                  type="number"
                  min={1}
                  max={600}
                  dir="ltr"
                  value={readingTimeMinutes}
                  disabled={!canUpdate}
                  onChange={(e) => {
                    setReadingTimeMinutes(Math.max(1, Number(e.target.value) || 1));
                    setIsDirty(true);
                  }}
                />
              </AdminField>
            </div>
          </section>

          <section className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              تنظیمات سئو (SEO)
            </h2>
            <SeoFieldsSection
              seo={seo}
              disabled={!canUpdate}
              onChange={(nextSeo) => {
                setSeo(nextSeo);
                setIsDirty(true);
              }}
            />
          </section>
        </div>
      )}

      {activeTab === 'preview' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-lg px-4 py-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AdminButton
                variant={previewSource === 'draft' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setPreviewSource('draft')}
              >
                پیش‌نمایش ویرایش فعلی (زنده)
              </AdminButton>
              {hasPermission('preview:read') && (
                <AdminButton
                  variant={previewSource === 'server' ? 'primary' : 'outline'}
                  size="sm"
                  isLoading={loadingServerPreview}
                  onClick={handleLoadServerPreview}
                >
                  دریافت پیش‌نمایش ذخیره‌شده از سرور
                </AdminButton>
              )}
            </div>
            <span className="text-xs text-slate-500">
              {previewSource === 'draft'
                ? 'نمایش تغییرات فعلی پیش از ذخیره نهایی'
                : 'داده‌های دریافت‌شده از مسیر /api/v1/admin/preview/lessons'}
            </span>
          </div>

          {previewSource === 'server' && serverPreview ? (
            <LessonPreviewSection
              blocks={serverPreview.lesson.contentBlocks || []}
              title={serverPreview.lesson.title}
              readingTimeMinutes={serverPreview.lesson.readingTimeMinutes}
            />
          ) : (
            <LessonPreviewSection
              blocks={contentBlocks}
              title={title}
              readingTimeMinutes={readingTimeMinutes}
            />
          )}
        </div>
      )}

      <ConflictResolutionModal
        open={conflictState.open}
        onClose={() => setConflictState({ open: false })}
        onReloadServer={() => {
          setConflictState({ open: false });
          void loadLesson();
        }}
        localVersion={lesson.version}
        serverVersion={conflictState.serverVersion}
        message={conflictState.message}
      />

      <AdminConfirmModal
        open={Boolean(confirmAction)}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleLifecycle}
        isLoading={lifecycleLoading}
        variant={confirmAction === 'archive' ? 'danger' : 'primary'}
        title={
          confirmAction === 'publish'
            ? 'انتشار درس'
            : confirmAction === 'unpublish'
              ? 'لغو انتشار درس'
              : 'بایگانی درس'
        }
        message={
          confirmAction === 'publish'
            ? `پیش از انتشار درس «${lesson.title}»، وجود حداقل یک بلوک محتوا و استاندارد بودن سئو توسط سرور بررسی می‌شود. ادامه می‌دهید؟`
            : confirmAction === 'unpublish'
              ? `آیا می‌خواهید درس «${lesson.title}» به پیش‌نویس بازگردد؟`
              : `آیا از بایگانی درس «${lesson.title}» اطمینان دارید؟`
        }
      />
    </div>
  );
}

export default function AdminLessonDetailPage() {
  return (
    <AdminGuard requiredPermission="lessons:read">
      <LessonEditorContent />
    </AdminGuard>
  );
}
