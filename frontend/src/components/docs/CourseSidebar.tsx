'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CourseOutlinePublicDto } from '@techa/shared';
import {
  BookOpen,
  ChevronDown,
  ChevronLeft,
  FileText,
  Layers,
  ArrowRight,
  Menu,
  X,
  Search,
  Clock,
} from 'lucide-react';

interface CourseSidebarProps {
  outline: CourseOutlinePublicDto;
  courseSlug: string;
  courseTitle?: string;
}

export default function CourseSidebar({
  outline,
  courseSlug,
  courseTitle,
}: CourseSidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');
  const [collapsedChapters, setCollapsedChapters] = useState<Record<string, boolean>>({});

  const isLessonActive = (lessonSlug: string) =>
    pathname === `/docs/${courseSlug}/${lessonSlug}`;

  const totalLessonsCount = useMemo(
    () =>
      (outline.chapters || []).reduce(
        (acc, ch) => acc + (ch.lessons?.length || 0),
        0
      ),
    [outline.chapters]
  );

  // Auto-expand the active chapter whenever pathname changes
  useEffect(() => {
    if (!outline.chapters) return;
    const activeChapter = outline.chapters.find((ch) =>
      ch.lessons?.some((l) => pathname === `/docs/${courseSlug}/${l.slug}`)
    );
    if (activeChapter) {
      setCollapsedChapters((prev) => ({
        ...prev,
        [activeChapter.id]: false,
      }));
    }
    setMobileOpen(false);
  }, [pathname, courseSlug, outline.chapters]);

  // Body scroll lock & Escape handler for mobile drawer
  useEffect(() => {
    if (!mobileOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [mobileOpen]);

  const toggleChapter = (chapterId: string) => {
    setCollapsedChapters((prev) => ({
      ...prev,
      [chapterId]: !prev[chapterId],
    }));
  };

  const normalizedQuery = filterQuery.trim().toLowerCase();

  const filteredChapters = useMemo(() => {
    const chapters = outline.chapters || [];
    if (!normalizedQuery) return chapters;
    return chapters
      .map((ch) => ({
        ...ch,
        lessons: (ch.lessons || []).filter((l) =>
          l.title.toLowerCase().includes(normalizedQuery)
        ),
      }))
      .filter(
        (ch) =>
          ch.lessons.length > 0 ||
          ch.title.toLowerCase().includes(normalizedQuery)
      );
  }, [outline.chapters, normalizedQuery]);

  const sidebarContent = (
    <div className="flex flex-col h-full space-y-3.5">
      {/* Course Link */}
      <div className="pb-3 border-b border-slate-200/80 space-y-1.5">
        <Link
          href={`/docs/${courseSlug}`}
          onClick={() => setMobileOpen(false)}
          className={`flex items-center gap-2 p-2 rounded-xl text-xs sm:text-sm font-extrabold transition-colors ${
            pathname === `/docs/${courseSlug}`
              ? 'bg-emerald-50 text-emerald-800'
              : 'text-slate-900 hover:bg-slate-100 hover:text-emerald-800'
          }`}
        >
          <Layers className="h-4 w-4 text-emerald-600 shrink-0" />
          <span className="line-clamp-2 leading-snug">
            {courseTitle || outline.course?.title || 'نمای کلی دوره'}
          </span>
        </Link>
        <div className="flex items-center gap-2 px-2 text-[11px] text-slate-500 tabular-nums">
          <span>{outline.chapters?.length ?? 0} فصل</span>
          <span className="text-slate-300">·</span>
          <span>{totalLessonsCount} درس</span>
        </div>
      </div>

      {/* Quick Filter inside Sidebar when there are multiple lessons */}
      {totalLessonsCount > 4 && (
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="جستجو در سرفصل‌ها..."
            aria-label="فیلتر سرفصل‌های دوره"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-8 pl-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-emerald-600"
          />
        </div>
      )}

      {/* Chapters & Lessons Tree */}
      <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-17rem)] pl-1 custom-scrollbar">
        {filteredChapters.length > 0 ? (
          filteredChapters.map((chapter, chIdx) => {
            const isCollapsed = normalizedQuery ? false : !!collapsedChapters[chapter.id];

            return (
              <div key={chapter.id} className="space-y-1">
                <button
                  type="button"
                  onClick={() => toggleChapter(chapter.id)}
                  aria-expanded={!isCollapsed}
                  className="w-full flex items-center justify-between p-2 rounded-xl text-xs font-bold text-slate-800 hover:bg-slate-100/80 transition-colors text-right gap-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="flex h-5 w-5 items-center justify-center rounded-md bg-slate-200/80 text-[10px] font-mono text-slate-700 font-bold shrink-0 tabular-nums">
                      {chIdx + 1}
                    </span>
                    <span className="truncate font-bold">{chapter.title}</span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 text-slate-400">
                    <span className="text-[10px] font-mono tabular-nums">
                      {chapter.lessons?.length ?? 0}
                    </span>
                    {isCollapsed ? (
                      <ChevronLeft className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5" />
                    )}
                  </div>
                </button>

                {!isCollapsed && chapter.lessons && (
                  <div className="pr-3 mr-2 border-r border-slate-200 space-y-0.5">
                    {chapter.lessons.map((lesson) => {
                      const active = isLessonActive(lesson.slug);
                      return (
                        <Link
                          key={lesson.id}
                          href={`/docs/${courseSlug}/${lesson.slug}`}
                          onClick={() => setMobileOpen(false)}
                          aria-current={active ? 'page' : undefined}
                          className={`flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl text-xs transition-colors ${
                            active
                              ? 'bg-[#042A1B] text-[#7AE36A] font-bold shadow-xs'
                              : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100/80 font-medium'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText
                              className={`h-3.5 w-3.5 shrink-0 ${
                                active ? 'text-[#7AE36A]' : 'text-slate-400'
                              }`}
                            />
                            <span className="truncate">{lesson.title}</span>
                          </div>
                          {lesson.readingTimeMinutes > 0 && (
                            <span
                              className={`text-[10px] shrink-0 tabular-nums ${
                                active ? 'text-white/75' : 'text-slate-400'
                              }`}
                            >
                              {lesson.readingTimeMinutes}د
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <p className="text-xs text-slate-400 p-2 text-center">
            {normalizedQuery
              ? 'درسی با این عنوان پیدا نشد.'
              : 'هنوز سرفصلی برای این دوره ثبت نشده است.'}
          </p>
        )}
      </div>

      {/* Back to Catalog */}
      <div className="pt-3 border-t border-slate-200/80 text-xs">
        <Link
          href="/docs"
          onClick={() => setMobileOpen(false)}
          className="inline-flex items-center gap-1.5 text-slate-500 hover:text-emerald-700 font-semibold transition-colors"
        >
          <ArrowRight className="h-3.5 w-3.5" />
          <span>بازگشت به فهرست تمام دوره‌ها</span>
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Bar to Open Sidebar */}
      <div className="lg:hidden w-full mb-2 flex items-center justify-between p-3 rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-900 min-w-0">
          <BookOpen className="h-4 w-4 text-emerald-600 shrink-0" />
          <span className="truncate">{courseTitle || 'فهرست درس‌های دوره'}</span>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-expanded={mobileOpen}
          className="inline-flex items-center gap-1.5 text-xs font-bold bg-[#042A1B] text-[#7AE36A] px-3 py-1.5 rounded-xl hover:bg-[#053723] transition-colors shrink-0"
        >
          <Menu className="h-3.5 w-3.5" />
          <span>فهرست درس‌ها</span>
        </button>
      </div>

      {/* Desktop Persistent Sticky Sidebar */}
      <aside
        aria-label="ناوبری سرفصل‌های دوره"
        className="hidden lg:block w-72 shrink-0 sticky top-24 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs"
      >
        {sidebarContent}
      </aside>

      {/* Mobile Slide-Over Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex" role="dialog" aria-modal="true" aria-label="سرفصل‌های دوره">
          <div
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />

          <div className="relative mr-auto w-[85vw] max-w-sm h-full bg-white p-5 shadow-2xl flex flex-col z-10">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <span className="text-sm font-extrabold text-slate-950 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>سرفصل‌های دوره</span>
              </span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="بستن فهرست درس‌ها"
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">{sidebarContent}</div>
          </div>
        </div>
      )}
    </>
  );
}
