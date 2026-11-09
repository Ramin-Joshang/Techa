'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';

interface CourseSidebarProps {
  outline: CourseOutlinePublicDto;
  courseSlug: string;
  courseTitle?: string;
}

export default function CourseSidebar({ outline, courseSlug, courseTitle }: CourseSidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsedChapters, setCollapsedChapters] = useState<Record<string, boolean>>({});

  const toggleChapter = (chapterId: string) => {
    setCollapsedChapters((prev) => ({
      ...prev,
      [chapterId]: !prev[chapterId],
    }));
  };

  const isLessonActive = (lessonSlug: string) => {
    return pathname === `/docs/${courseSlug}/${lessonSlug}`;
  };

  const sidebarContent = (
    <div className="flex flex-col h-full space-y-4">
      {/* Course Overview Link */}
      <div className="pb-3 border-b border-gray-200">
        <Link
          href={`/docs/${courseSlug}`}
          onClick={() => setMobileOpen(false)}
          className={`flex items-center gap-2 p-2 rounded-xl text-sm font-bold transition-all ${
            pathname === `/docs/${courseSlug}`
              ? 'bg-emerald-50 text-emerald-800'
              : 'text-gray-900 hover:bg-gray-100 hover:text-emerald-700'
          }`}
        >
          <Layers className="h-4 w-4 text-emerald-600 shrink-0" />
          <span className="truncate">{courseTitle || outline.course?.title || 'نمای کلی دوره'}</span>
        </Link>
      </div>

      {/* Chapters & Lessons Tree */}
      <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-14rem)] pr-1">
        {outline.chapters && outline.chapters.length > 0 ? (
          outline.chapters.map((chapter, chIdx) => {
            const isCollapsed = !!collapsedChapters[chapter.id];
            const hasActiveLesson = chapter.lessons?.some((l) => isLessonActive(l.slug));

            return (
              <div key={chapter.id} className="space-y-1">
                {/* Chapter Header */}
                <button
                  type="button"
                  onClick={() => toggleChapter(chapter.id)}
                  className="w-full flex items-center justify-between p-2 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors text-right"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="flex h-5 w-5 items-center justify-center rounded-md bg-gray-200/70 text-[10px] font-mono text-gray-600 font-bold shrink-0">
                      {chIdx + 1}
                    </span>
                    <span className="truncate font-semibold">{chapter.title}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 mr-2 text-gray-400">
                    <span className="text-[10px] font-mono bg-gray-100 px-1.5 py-0.5 rounded">
                      {chapter.lessons?.length ?? 0}
                    </span>
                    {isCollapsed ? (
                      <ChevronLeft className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5" />
                    )}
                  </div>
                </button>

                {/* Chapter Lessons List */}
                {!isCollapsed && chapter.lessons && (
                  <div className="pr-4 mr-2 border-r border-gray-200 space-y-0.5">
                    {chapter.lessons.map((lesson) => {
                      const active = isLessonActive(lesson.slug);
                      return (
                        <Link
                          key={lesson.id}
                          href={`/docs/${courseSlug}/${lesson.slug}`}
                          onClick={() => setMobileOpen(false)}
                          className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                            active
                              ? 'bg-emerald-600 text-white font-bold shadow-xs'
                              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/80'
                          }`}
                        >
                          <FileText className={`h-3.5 w-3.5 shrink-0 ${active ? 'text-white' : 'text-gray-400'}`} />
                          <span className="truncate">{lesson.title}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <p className="text-xs text-gray-400 p-2">هنوز سرفصلی برای این دوره ثبت نشده است.</p>
        )}
      </div>

      {/* Back to all courses */}
      <div className="pt-3 border-t border-gray-200 text-xs">
        <Link
          href="/docs"
          className="inline-flex items-center gap-1.5 text-gray-500 hover:text-emerald-700 font-medium transition-colors"
        >
          <ArrowRight className="h-3.5 w-3.5" />
          <span>بازگشت به فهرست تمام دوره‌ها</span>
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Sticky Bar to Open Sidebar */}
      <div className="lg:hidden w-full mb-4 flex items-center justify-between p-3 rounded-xl border border-gray-200 bg-white shadow-xs">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
          <BookOpen className="h-4 w-4 text-emerald-600" />
          <span>سرفصل‌ها و درس‌های دوره</span>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors"
        >
          <Menu className="h-3.5 w-3.5" />
          <span>نمایش سرفصل‌ها</span>
        </button>
      </div>

      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-72 shrink-0 sticky top-20 rounded-2xl border border-gray-200/90 bg-white p-4 shadow-xs">
        {sidebarContent}
      </aside>

      {/* Mobile Fullscreen Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />

          {/* Drawer Body */}
          <div className="relative mr-auto w-4/5 max-w-sm h-full bg-white p-5 shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-gray-100">
              <span className="text-sm font-bold text-gray-900">سرفصل‌های دوره</span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 text-gray-700"
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
