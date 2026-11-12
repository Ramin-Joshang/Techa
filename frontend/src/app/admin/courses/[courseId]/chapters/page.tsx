'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Archive,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  GripVertical,
  Layers,
  Pencil,
  Plus,
  Save,
  Sparkles,
  XCircle,
} from 'lucide-react';
import { AdminCreateChapterDtoSchema } from '@techa/shared';
import AdminGuard, { AdminGuardLoadingSkeleton } from '../../../../../components/admin/auth/AdminGuard';
import {
  AdminButton,
  AdminConfirmModal,
  AdminEmptyState,
  AdminErrorState,
  AdminModal,
  AdminPageHeader,
  PublicationStatusLabel,
} from '../../../../../components/admin/ui/AdminPrimitives';
import { AdminField, AdminInput, AdminTextarea } from '../../../../../components/admin/ui/AdminFormFields';
import { useAdminToast } from '../../../../../components/admin/ui/ToastProvider';
import { useAdminAuth } from '../../../../../context/AdminAuthContext';
import { adminClient } from '../../../../../lib/admin/admin-client';
import { formatPersianNumber, toSafeSlug } from '../../../../../lib/admin/admin-formatters';
import { AdminChapterDto, AdminCourseDto } from '../../../../../lib/admin/admin-types';

function CourseChaptersContent() {
  const params = useParams<{ courseId: string }>();
  const courseId = params?.courseId || '';
  const { hasPermission } = useAdminAuth();
  const toast = useAdminToast();

  const [course, setCourse] = useState<AdminCourseDto | null>(null);
  const [chapters, setChapters] = useState<AdminChapterDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [orderDirty, setOrderDirty] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  // Create Chapter Modal
  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newSummary, setNewSummary] = useState('');
  const [createErr, setCreateErr] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  // Lifecycle Confirm
  const [confirmState, setConfirmState] = useState<{
    chapter: AdminChapterDto;
    action: 'publish' | 'unpublish' | 'archive';
  } | null>(null);
  const [lifecycleLoading, setLifecycleLoading] = useState(false);

  const loadData = useCallback(async () => {
    if (!courseId) return;
    setLoading(true);
    setError(null);
    try {
      const [c, list] = await Promise.all([
        adminClient.getCourse(courseId),
        adminClient.listChapters(courseId),
      ]);
      setCourse(c);
      setChapters([...list].sort((a, b) => a.order - b.order));
      setOrderDirty(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در دریافت فصل‌های دوره');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const moveChapter = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= chapters.length || fromIdx === toIdx) return;
    const next = [...chapters];
    const [moved] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, moved);
    setChapters(next);
    setOrderDirty(true);
  };

  const handleSaveOrder = async () => {
    setSavingOrder(true);
    try {
      const updated = await adminClient.reorderChapters(courseId, {
        orderedChapterIds: chapters.map((ch) => ch.id),
        changeSummary: 'تغییر ترتیب فصل‌ها در پنل مدیریت',
      });
      setChapters([...updated].sort((a, b) => a.order - b.order));
      setOrderDirty(false);
      toast.success('ترتیب فصل‌ها ذخیره شد');
    } catch (err) {
      toast.error('خطا در ذخیره ترتیب فصل‌ها', err instanceof Error ? err.message : undefined);
    } finally {
      setSavingOrder(false);
    }
  };

  const handleCreateChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateErr(null);

    const parsed = AdminCreateChapterDtoSchema.safeParse({
      title: newTitle.trim(),
      slug: newSlug.trim(),
      summary: newSummary.trim() || undefined,
      order: chapters.length,
    });

    if (!parsed.success) {
      setCreateErr(parsed.error.issues[0]?.message || 'اطلاعات فصل معتبر نیست.');
      return;
    }

    setCreating(true);
    try {
      const created = await adminClient.createChapter(courseId, parsed.data);
      setChapters((prev) => [...prev, created]);
      setCreateOpen(false);
      setNewTitle('');
      setNewSlug('');
      setNewSummary('');
      toast.success('فصل جدید ایجاد شد', created.title);
    } catch (err) {
      setCreateErr(err instanceof Error ? err.message : 'ایجاد فصل ناموفق بود.');
    } finally {
      setCreating(false);
    }
  };

  const handleLifecycle = async () => {
    if (!confirmState) return;
    setLifecycleLoading(true);
    try {
      const { chapter, action } = confirmState;
      const updated =
        action === 'publish'
          ? await adminClient.publishChapter(chapter.id, { expectedVersion: chapter.version })
          : action === 'unpublish'
            ? await adminClient.unpublishChapter(chapter.id, { expectedVersion: chapter.version })
            : await adminClient.archiveChapter(chapter.id, { expectedVersion: chapter.version });

      setChapters((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      setConfirmState(null);
      toast.success('وضعیت فصل به‌روزرسانی شد');
    } catch (err) {
      toast.error('عملیات ناموفق بود', err instanceof Error ? err.message : undefined);
    } finally {
      setLifecycleLoading(false);
    }
  };

  if (loading) return <AdminGuardLoadingSkeleton />;
  if (error || !course) {
    return <AdminErrorState message={error || 'دوره یافت نشد.'} onRetry={loadData} />;
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={`فصل‌های دوره: ${course.title}`}
        description="ایجاد، ویرایش، مرتب‌سازی و مدیریت درس‌های هر فصل"
        breadcrumbs={[
          { label: 'داشبورد', href: '/admin' },
          { label: 'دوره‌ها', href: '/admin/courses' },
          { label: course.title, href: `/admin/courses/${course.id}` },
          { label: 'فصل‌ها' },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {orderDirty && hasPermission('chapters:reorder') && (
              <AdminButton
                variant="secondary"
                onClick={handleSaveOrder}
                isLoading={savingOrder}
                icon={<Save className="w-4 h-4" />}
              >
                ذخیره ترتیب فصل‌ها
              </AdminButton>
            )}
            {hasPermission('chapters:create') && (
              <AdminButton
                variant="primary"
                onClick={() => setCreateOpen(true)}
                icon={<Plus className="w-4 h-4" />}
              >
                فصل جدید
              </AdminButton>
            )}
          </div>
        }
      />

      {chapters.length === 0 ? (
        <AdminEmptyState
          title="هنوز فصلی برای این دوره ایجاد نشده است"
          description="اولین فصل دوره را ایجاد کنید تا بتوانید درس‌های آن را اضافه نمایید."
          icon={<Layers className="w-6 h-6" />}
          action={
            hasPermission('chapters:create') ? (
              <AdminButton
                variant="primary"
                onClick={() => setCreateOpen(true)}
                icon={<Plus className="w-4 h-4" />}
              >
                ایجاد اولین فصل
              </AdminButton>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-2.5">
          {chapters.map((chapter, idx) => (
            <div
              key={chapter.id}
              draggable={hasPermission('chapters:reorder')}
              onDragStart={() => setDragIdx(idx)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragIdx !== null && dragIdx !== idx) moveChapter(dragIdx, idx);
                setDragIdx(null);
              }}
              onDragEnd={() => setDragIdx(null)}
              className={`bg-white border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                dragIdx === idx ? 'border-emerald-600 opacity-75' : 'border-slate-200'
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                {hasPermission('chapters:reorder') && (
                  <span className="text-slate-400 cursor-grab pt-1" title="کشیدن و رها کردن">
                    <GripVertical className="w-4 h-4" />
                  </span>
                )}
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-xs font-mono text-slate-400 tabular-nums">
                      فصل {formatPersianNumber(idx + 1)}
                    </span>
                    <Link
                      href={`/admin/chapters/${chapter.id}`}
                      className="text-sm font-bold text-slate-900 hover:text-emerald-700 truncate"
                    >
                      {chapter.title}
                    </Link>
                    <PublicationStatusLabel status={chapter.status} />
                  </div>
                  <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-2">
                    <span dir="ltr" className="font-mono">
                      /{chapter.slug}
                    </span>
                    {chapter.summary && (
                      <>
                        <span>·</span>
                        <span className="truncate max-w-md">{chapter.summary}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                {hasPermission('chapters:reorder') && (
                  <>
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveChapter(idx, idx - 1)}
                      className="p-2 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                      title="انتقال به بالا"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === chapters.length - 1}
                      onClick={() => moveChapter(idx, idx + 1)}
                      className="p-2 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                      title="انتقال به پایین"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}

                <Link
                  href={`/admin/chapters/${chapter.id}`}
                  className="inline-flex items-center gap-1.5 min-h-[34px] px-3 py-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-100 text-xs font-medium text-slate-800"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>ویرایش و درس‌ها</span>
                </Link>

                {hasPermission('chapters:publish') && chapter.status !== 'published' && (
                  <button
                    type="button"
                    onClick={() => setConfirmState({ chapter, action: 'publish' })}
                    className="p-2 rounded-md border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                    title="انتشار فصل"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </button>
                )}
                {hasPermission('chapters:publish') && chapter.status === 'published' && (
                  <button
                    type="button"
                    onClick={() => setConfirmState({ chapter, action: 'unpublish' })}
                    className="p-2 rounded-md border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100"
                    title="لغو انتشار"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                  </button>
                )}
                {hasPermission('chapters:archive') && chapter.status !== 'archived' && (
                  <button
                    type="button"
                    onClick={() => setConfirmState({ chapter, action: 'archive' })}
                    className="p-2 rounded-md border border-slate-200 text-slate-600 hover:text-red-700 hover:bg-red-50"
                    title="بایگانی فصل"
                  >
                    <Archive className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Chapter Modal */}
      <AdminModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="ایجاد فصل جدید"
        maxWidthClass="max-w-md"
      >
        <form onSubmit={handleCreateChapter} className="space-y-4">
          {createErr && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
              {createErr}
            </div>
          )}
          <AdminField label="عنوان فصل" required>
            <AdminInput
              value={newTitle}
              maxLength={150}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="مثال: مبانی App Router"
            />
          </AdminField>
          <AdminField label="اسلاگ فصل" required>
            <div className="flex gap-2">
              <AdminInput
                dir="ltr"
                className="font-mono text-xs"
                value={newSlug}
                maxLength={100}
                onChange={(e) => setNewSlug(e.target.value)}
                placeholder="app-router-basics"
              />
              <AdminButton
                variant="outline"
                onClick={() => setNewSlug(toSafeSlug(newTitle) || newSlug)}
                icon={<Sparkles className="w-3.5 h-3.5" />}
              >
                تولید
              </AdminButton>
            </div>
          </AdminField>
          <AdminField label="خلاصه کوتاه (اختیاری)">
            <AdminTextarea
              rows={3}
              maxLength={300}
              value={newSummary}
              onChange={(e) => setNewSummary(e.target.value)}
            />
          </AdminField>
          <div className="flex justify-end gap-2 pt-2">
            <AdminButton variant="outline" onClick={() => setCreateOpen(false)}>
              انصراف
            </AdminButton>
            <AdminButton type="submit" variant="primary" isLoading={creating}>
              ایجاد فصل
            </AdminButton>
          </div>
        </form>
      </AdminModal>

      <AdminConfirmModal
        open={Boolean(confirmState)}
        onClose={() => setConfirmState(null)}
        onConfirm={handleLifecycle}
        isLoading={lifecycleLoading}
        variant={confirmState?.action === 'archive' ? 'danger' : 'primary'}
        title="تأیید تغییر وضعیت فصل"
        message={
          confirmState
            ? `آیا از تغییر وضعیت فصل «${confirmState.chapter.title}» اطمینان دارید؟`
            : ''
        }
      />
    </div>
  );
}

export default function AdminCourseChaptersPage() {
  return (
    <AdminGuard requiredPermission="chapters:read">
      <CourseChaptersContent />
    </AdminGuard>
  );
}
