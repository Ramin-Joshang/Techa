'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Archive,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  FileText,
  GripVertical,
  History,
  Pencil,
  Plus,
  Save,
  Sparkles,
  XCircle,
} from 'lucide-react';
import {
  AdminCreateLessonDtoSchema,
  AdminUpdateChapterDtoSchema,
} from '@techa/shared';
import AdminGuard, { AdminGuardLoadingSkeleton } from '../../../../components/admin/auth/AdminGuard';
import {
  AdminButton,
  AdminConfirmModal,
  AdminEmptyState,
  AdminErrorState,
  AdminModal,
  AdminPageHeader,
  ConflictResolutionModal,
  PublicationStatusLabel,
} from '../../../../components/admin/ui/AdminPrimitives';
import { AdminField, AdminInput, AdminTextarea } from '../../../../components/admin/ui/AdminFormFields';
import { useAdminToast } from '../../../../components/admin/ui/ToastProvider';
import { useAdminAuth } from '../../../../context/AdminAuthContext';
import { adminClient, AdminApiError } from '../../../../lib/admin/admin-client';
import { formatPersianNumber, toSafeSlug } from '../../../../lib/admin/admin-formatters';
import { AdminChapterDto, AdminLessonDto } from '../../../../lib/admin/admin-types';
import { useUnsavedChangesWarning } from '../../../../lib/admin/use-unsaved-guard';

function ChapterDetailContent() {
  const params = useParams<{ chapterId: string }>();
  const chapterId = params?.chapterId || '';
  const router = useRouter();
  const { hasPermission } = useAdminAuth();
  const toast = useAdminToast();

  const [chapter, setChapter] = useState<AdminChapterDto | null>(null);
  const [lessons, setLessons] = useState<AdminLessonDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit chapter fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [summary, setSummary] = useState('');
  const [order, setOrder] = useState(0);
  const [changeSummary, setChangeSummary] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [savingChapter, setSavingChapter] = useState(false);

  // Lessons reorder
  const [lessonsOrderDirty, setLessonsOrderDirty] = useState(false);
  const [savingLessonsOrder, setSavingLessonsOrder] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  // Create lesson modal
  const [createLessonOpen, setCreateLessonOpen] = useState(false);
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonSlug, setNewLessonSlug] = useState('');
  const [newLessonMinutes, setNewLessonMinutes] = useState(5);
  const [newLessonErr, setNewLessonErr] = useState<string | null>(null);
  const [creatingLesson, setCreatingLesson] = useState(false);

  // Conflict & Confirm
  const [conflictState, setConflictState] = useState<{
    open: boolean;
    serverVersion?: number;
    message?: string;
  }>({ open: false });

  const [confirmAction, setConfirmAction] = useState<
    | { target: 'chapter'; action: 'publish' | 'unpublish' | 'archive' }
    | { target: 'lesson'; lesson: AdminLessonDto; action: 'publish' | 'unpublish' | 'archive' }
    | null
  >(null);
  const [lifecycleLoading, setLifecycleLoading] = useState(false);

  useUnsavedChangesWarning(isDirty || lessonsOrderDirty);

  const loadData = useCallback(async () => {
    if (!chapterId) return;
    setLoading(true);
    setError(null);
    try {
      const [ch, ls] = await Promise.all([
        adminClient.getChapter(chapterId),
        adminClient.listLessons(chapterId),
      ]);
      setChapter(ch);
      setTitle(ch.title);
      setSlug(ch.slug);
      setSummary(ch.summary || '');
      setOrder(ch.order ?? 0);
      setChangeSummary('');
      setIsDirty(false);
      setLessons([...ls].sort((a, b) => a.order - b.order));
      setLessonsOrderDirty(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در دریافت اطلاعات فصل');
    } finally {
      setLoading(false);
    }
  }, [chapterId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleSaveChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chapter) return;

    const parsed = AdminUpdateChapterDtoSchema.safeParse({
      title: title.trim(),
      slug: slug.trim(),
      summary: summary.trim() || undefined,
      order: Math.max(0, Math.trunc(order)),
      expectedVersion: chapter.version,
      changeSummary: changeSummary.trim() || undefined,
    });

    if (!parsed.success) {
      toast.error('خطا در اعتبارسنجی فرم', parsed.error.issues[0]?.message);
      return;
    }

    setSavingChapter(true);
    try {
      const updated = await adminClient.updateChapter(chapter.id, parsed.data);
      setChapter(updated);
      setIsDirty(false);
      setChangeSummary('');
      toast.success('تغییرات فصل ذخیره شد');
    } catch (err) {
      if (err instanceof AdminApiError && err.status === 409) {
        const details = err.details as { currentVersion?: number } | undefined;
        setConflictState({
          open: true,
          serverVersion: details?.currentVersion,
          message: err.message,
        });
      } else {
        toast.error('خطا در ذخیره فصل', err instanceof Error ? err.message : undefined);
      }
    } finally {
      setSavingChapter(false);
    }
  };

  const moveLesson = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= lessons.length || fromIdx === toIdx) return;
    const next = [...lessons];
    const [moved] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, moved);
    setLessons(next);
    setLessonsOrderDirty(true);
  };

  const handleSaveLessonsOrder = async () => {
    setSavingLessonsOrder(true);
    try {
      const updated = await adminClient.reorderLessons(chapterId, {
        orderedLessonIds: lessons.map((l) => l.id),
        changeSummary: 'تغییر ترتیب درس‌های فصل',
      });
      setLessons([...updated].sort((a, b) => a.order - b.order));
      setLessonsOrderDirty(false);
      toast.success('ترتیب درس‌ها ذخیره شد');
    } catch (err) {
      toast.error('خطا در ذخیره ترتیب درس‌ها', err instanceof Error ? err.message : undefined);
    } finally {
      setSavingLessonsOrder(false);
    }
  };

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewLessonErr(null);

    const parsed = AdminCreateLessonDtoSchema.safeParse({
      title: newLessonTitle.trim(),
      slug: newLessonSlug.trim(),
      order: lessons.length,
      readingTimeMinutes: Math.max(1, Math.min(600, Math.trunc(newLessonMinutes))),
      contentSchemaVersion: 1,
      contentBlocks: [],
      seo: {
        metaTitle: newLessonTitle.trim().slice(0, 70) || 'درس جدید',
        metaDescription: `آموزش ${newLessonTitle.trim()} در پلتفرم تکا`.slice(0, 160),
      },
    });

    if (!parsed.success) {
      setNewLessonErr(parsed.error.issues[0]?.message || 'اطلاعات درس معتبر نیست.');
      return;
    }

    setCreatingLesson(true);
    try {
      const created = await adminClient.createLesson(chapterId, parsed.data);
      toast.success('درس جدید ایجاد شد', created.title);
      setCreateLessonOpen(false);
      router.push(`/admin/lessons/${created.id}`);
    } catch (err) {
      setNewLessonErr(err instanceof Error ? err.message : 'ایجاد درس ناموفق بود.');
    } finally {
      setCreatingLesson(false);
    }
  };

  const handleConfirmLifecycle = async () => {
    if (!confirmAction || !chapter) return;
    setLifecycleLoading(true);
    try {
      if (confirmAction.target === 'chapter') {
        const updated =
          confirmAction.action === 'publish'
            ? await adminClient.publishChapter(chapter.id, { expectedVersion: chapter.version })
            : confirmAction.action === 'unpublish'
              ? await adminClient.unpublishChapter(chapter.id, { expectedVersion: chapter.version })
              : await adminClient.archiveChapter(chapter.id, { expectedVersion: chapter.version });
        setChapter(updated);
      } else {
        const l = confirmAction.lesson;
        const updated =
          confirmAction.action === 'publish'
            ? await adminClient.publishLesson(l.id, { expectedVersion: l.version })
            : confirmAction.action === 'unpublish'
              ? await adminClient.unpublishLesson(l.id, { expectedVersion: l.version })
              : await adminClient.archiveLesson(l.id, { expectedVersion: l.version });
        setLessons((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      }
      setConfirmAction(null);
      toast.success('وضعیت با موفقیت تغییر یافت');
    } catch (err) {
      toast.error('عملیات ناموفق بود', err instanceof Error ? err.message : undefined);
    } finally {
      setLifecycleLoading(false);
    }
  };

  if (loading) return <AdminGuardLoadingSkeleton />;
  if (error || !chapter) {
    return <AdminErrorState message={error || 'فصل یافت نشد.'} onRetry={loadData} />;
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={`فصل: ${chapter.title}`}
        description={`نسخه v${chapter.version} · اسلاگ: /${chapter.slug}`}
        breadcrumbs={[
          { label: 'داشبورد', href: '/admin' },
          { label: 'دوره‌ها', href: '/admin/courses' },
          { label: 'دوره والد', href: `/admin/courses/${chapter.courseId}` },
          { label: 'فصل‌ها', href: `/admin/courses/${chapter.courseId}/chapters` },
          { label: chapter.title },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <PublicationStatusLabel status={chapter.status} />
            {hasPermission('revisions:read') && (
              <Link
                href={`/admin/revisions?resourceType=chapter&resourceId=${chapter.id}`}
                className="inline-flex items-center gap-1.5 min-h-[36px] px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-medium text-slate-800"
              >
                <History className="w-4 h-4 text-slate-500" />
                <span>تاریخچه نسخه‌ها</span>
              </Link>
            )}
            {hasPermission('chapters:publish') && chapter.status !== 'published' && (
              <AdminButton
                variant="secondary"
                size="sm"
                onClick={() => setConfirmAction({ target: 'chapter', action: 'publish' })}
                icon={<CheckCircle2 className="w-4 h-4" />}
              >
                انتشار فصل
              </AdminButton>
            )}
            {hasPermission('chapters:publish') && chapter.status === 'published' && (
              <AdminButton
                variant="outline"
                size="sm"
                onClick={() => setConfirmAction({ target: 'chapter', action: 'unpublish' })}
                icon={<XCircle className="w-4 h-4 text-amber-600" />}
              >
                لغو انتشار
              </AdminButton>
            )}
            {hasPermission('chapters:archive') && chapter.status !== 'archived' && (
              <AdminButton
                variant="outline"
                size="sm"
                onClick={() => setConfirmAction({ target: 'chapter', action: 'archive' })}
                icon={<Archive className="w-4 h-4 text-red-600" />}
              >
                بایگانی
              </AdminButton>
            )}
          </div>
        }
      />

      {/* Chapter Edit Form */}
      <form
        onSubmit={handleSaveChapter}
        className="bg-white border border-slate-200 rounded-lg p-5 space-y-4"
      >
        <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
          ویرایش مشخصات فصل
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <AdminField label="عنوان فصل" required>
            <AdminInput
              value={title}
              maxLength={150}
              disabled={!hasPermission('chapters:update')}
              onChange={(e) => {
                setTitle(e.target.value);
                setIsDirty(true);
              }}
            />
          </AdminField>
          <AdminField label="اسلاگ فصل" required>
            <AdminInput
              dir="ltr"
              className="font-mono text-xs"
              value={slug}
              maxLength={100}
              disabled={!hasPermission('chapters:update')}
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
              disabled={!hasPermission('chapters:update')}
              onChange={(e) => {
                setOrder(Math.max(0, Number(e.target.value) || 0));
                setIsDirty(true);
              }}
            />
          </AdminField>
        </div>

        <AdminField label="خلاصه فصل">
          <AdminTextarea
            rows={2}
            maxLength={300}
            value={summary}
            disabled={!hasPermission('chapters:update')}
            onChange={(e) => {
              setSummary(e.target.value);
              setIsDirty(true);
            }}
          />
        </AdminField>

        {hasPermission('chapters:update') && (
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pt-2">
            <div className="flex-1 max-w-md">
              <AdminField label="توضیح تغییر (اختیاری)">
                <AdminInput
                  value={changeSummary}
                  maxLength={500}
                  onChange={(e) => setChangeSummary(e.target.value)}
                />
              </AdminField>
            </div>
            <AdminButton type="submit" variant="primary" isLoading={savingChapter}>
              ذخیره مشخصات فصل
            </AdminButton>
          </div>
        )}
      </form>

      {/* Lessons Section */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">درس‌های این فصل</h2>
            <p className="text-xs text-slate-500">
              برای ویرایش محتوای ۱۳ بلوکی هر درس، روی آن کلیک کنید.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {lessonsOrderDirty && hasPermission('lessons:reorder') && (
              <AdminButton
                variant="secondary"
                size="sm"
                onClick={handleSaveLessonsOrder}
                isLoading={savingLessonsOrder}
                icon={<Save className="w-4 h-4" />}
              >
                ذخیره ترتیب درس‌ها
              </AdminButton>
            )}
            {hasPermission('lessons:create') && (
              <AdminButton
                variant="primary"
                size="sm"
                onClick={() => setCreateLessonOpen(true)}
                icon={<Plus className="w-4 h-4" />}
              >
                درس جدید
              </AdminButton>
            )}
          </div>
        </div>

        {lessons.length === 0 ? (
          <AdminEmptyState
            title="هنوز درسی در این فصل ثبت نشده است"
            description="با ایجاد درس جدید، می‌توانید با ویرایشگر ۱۳ بلوکی محتوای آموزشی را بنویسید."
            icon={<FileText className="w-6 h-6" />}
            action={
              hasPermission('lessons:create') ? (
                <AdminButton
                  variant="primary"
                  onClick={() => setCreateLessonOpen(true)}
                  icon={<Plus className="w-4 h-4" />}
                >
                  ایجاد اولین درس
                </AdminButton>
              ) : undefined
            }
          />
        ) : (
          <div className="space-y-2.5">
            {lessons.map((lesson, idx) => (
              <div
                key={lesson.id}
                draggable={hasPermission('lessons:reorder')}
                onDragStart={() => setDragIdx(idx)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (dragIdx !== null && dragIdx !== idx) moveLesson(dragIdx, idx);
                  setDragIdx(null);
                }}
                onDragEnd={() => setDragIdx(null)}
                className={`bg-white border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  dragIdx === idx ? 'border-emerald-600 opacity-75' : 'border-slate-200'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  {hasPermission('lessons:reorder') && (
                    <span className="text-slate-400 cursor-grab pt-1">
                      <GripVertical className="w-4 h-4" />
                    </span>
                  )}
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="text-xs font-mono text-slate-400 tabular-nums">
                        درس {formatPersianNumber(idx + 1)}
                      </span>
                      <Link
                        href={`/admin/lessons/${lesson.id}`}
                        className="text-sm font-bold text-slate-900 hover:text-emerald-700 truncate"
                      >
                        {lesson.title}
                      </Link>
                      <PublicationStatusLabel status={lesson.status} />
                    </div>
                    <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-2 tabular-nums">
                      <span dir="ltr" className="font-mono">
                        /{lesson.slug}
                      </span>
                      <span>·</span>
                      <span>{formatPersianNumber(lesson.contentBlocks?.length || 0)} بلوک</span>
                      <span>·</span>
                      <span>{formatPersianNumber(lesson.readingTimeMinutes)} دقیقه مطالعه</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                  {hasPermission('lessons:reorder') && (
                    <>
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => moveLesson(idx, idx - 1)}
                        className="p-2 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === lessons.length - 1}
                        onClick={() => moveLesson(idx, idx + 1)}
                        className="p-2 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                  <Link
                    href={`/admin/lessons/${lesson.id}`}
                    className="inline-flex items-center gap-1.5 min-h-[34px] px-3 py-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-100 text-xs font-medium text-slate-800"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>ویرایشگر درس</span>
                  </Link>
                  {hasPermission('lessons:publish') && lesson.status !== 'published' && (
                    <button
                      type="button"
                      onClick={() =>
                        setConfirmAction({ target: 'lesson', lesson, action: 'publish' })
                      }
                      className="p-2 rounded-md border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                      title="انتشار درس"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {hasPermission('lessons:publish') && lesson.status === 'published' && (
                    <button
                      type="button"
                      onClick={() =>
                        setConfirmAction({ target: 'lesson', lesson, action: 'unpublish' })
                      }
                      className="p-2 rounded-md border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100"
                      title="لغو انتشار"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {hasPermission('lessons:archive') && lesson.status !== 'archived' && (
                    <button
                      type="button"
                      onClick={() =>
                        setConfirmAction({ target: 'lesson', lesson, action: 'archive' })
                      }
                      className="p-2 rounded-md border border-slate-200 text-slate-600 hover:text-red-700 hover:bg-red-50"
                      title="بایگانی درس"
                    >
                      <Archive className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Create Lesson Modal */}
      <AdminModal
        open={createLessonOpen}
        onClose={() => setCreateLessonOpen(false)}
        title="ایجاد درس جدید"
        maxWidthClass="max-w-md"
      >
        <form onSubmit={handleCreateLesson} className="space-y-4">
          {newLessonErr && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
              {newLessonErr}
            </div>
          )}
          <AdminField label="عنوان درس" required>
            <AdminInput
              value={newLessonTitle}
              maxLength={150}
              onChange={(e) => setNewLessonTitle(e.target.value)}
              placeholder="مثال: معرفی Server Components"
            />
          </AdminField>
          <AdminField label="اسلاگ درس" required>
            <div className="flex gap-2">
              <AdminInput
                dir="ltr"
                className="font-mono text-xs"
                value={newLessonSlug}
                maxLength={100}
                onChange={(e) => setNewLessonSlug(e.target.value)}
                placeholder="intro-server-components"
              />
              <AdminButton
                variant="outline"
                onClick={() => setNewLessonSlug(toSafeSlug(newLessonTitle) || newLessonSlug)}
                icon={<Sparkles className="w-3.5 h-3.5" />}
              >
                تولید
              </AdminButton>
            </div>
          </AdminField>
          <AdminField label="مدت زمان مطالعه (دقیقه)">
            <AdminInput
              type="number"
              min={1}
              max={600}
              dir="ltr"
              value={newLessonMinutes}
              onChange={(e) => setNewLessonMinutes(Math.max(1, Number(e.target.value) || 1))}
            />
          </AdminField>
          <div className="flex justify-end gap-2 pt-2">
            <AdminButton variant="outline" onClick={() => setCreateLessonOpen(false)}>
              انصراف
            </AdminButton>
            <AdminButton type="submit" variant="primary" isLoading={creatingLesson}>
              ایجاد و ورود به ویرایشگر
            </AdminButton>
          </div>
        </form>
      </AdminModal>

      <ConflictResolutionModal
        open={conflictState.open}
        onClose={() => setConflictState({ open: false })}
        onReloadServer={() => {
          setConflictState({ open: false });
          void loadData();
        }}
        localVersion={chapter.version}
        serverVersion={conflictState.serverVersion}
        message={conflictState.message}
      />

      <AdminConfirmModal
        open={Boolean(confirmAction)}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleConfirmLifecycle}
        isLoading={lifecycleLoading}
        variant={confirmAction?.action === 'archive' ? 'danger' : 'primary'}
        title="تأیید تغییر وضعیت"
        message="آیا از انجام این عملیات اطمینان دارید؟"
      />
    </div>
  );
}

export default function AdminChapterDetailPage() {
  return (
    <AdminGuard requiredPermission="chapters:read">
      <ChapterDetailContent />
    </AdminGuard>
  );
}
