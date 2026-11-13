'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronLeft, Clock, BookOpen, ArrowLeft, ChevronsUpDown } from 'lucide-react';
import { CourseOutlinePublicDto } from '@techa/shared';

interface CourseOutlineListProps {
  courseSlug: string;
  chapters: CourseOutlinePublicDto['chapters'];
}

export default function CourseOutlineList({ courseSlug, chapters }: CourseOutlineListProps) {
  const [openMap, setOpenMap] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    chapters.forEach((ch) => {
      initial[ch.id] = true;
    });
    return initial;
  });

  if (!chapters || chapters.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-10 text-center space-y-2">
        <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
        <p className="text-sm font-bold text-slate-700">هنوز سرفصلی برای این دوره منتشر نشده است</p>
        <p className="text-xs text-slate-500">پس از انتشار فصل‌ها و درس‌ها، ساختار دوره در این بخش قابل مشاهده خواهد بود.</p>
      </div>
    );
  }

  const allExpanded = chapters.every((ch) => openMap[ch.id] !== false);

  const toggleAll = () => {
    const nextValue = !allExpanded;
    const nextMap: Record<string, boolean> = {};
    chapters.forEach((ch) => {
      nextMap[ch.id] = nextValue;
    });
    setOpenMap(nextMap);
  };

  const toggleChapter = (chapterId: string) => {
    setOpenMap((prev) => ({
      ...prev,
      [chapterId]: !(prev[chapterId] !== false),
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 pb-2">
        <span className="text-xs text-slate-500 font-medium tabular-nums">
          {chapters.length} فصل آموزشی منتشر شده
        </span>
        <button
          type="button"
          onClick={toggleAll}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 px-2.5 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors"
        >
          <ChevronsUpDown className="w-3.5 h-3.5" />
          <span>{allExpanded ? 'بستن همه فصل‌ها' : 'باز کردن همه فصل‌ها'}</span>
        </button>
      </div>

      <div className="space-y-3.5">
        {chapters.map((chapter, chIdx) => {
          const isOpen = openMap[chapter.id] !== false;
          const lessons = chapter.lessons || [];
          const chapterMinutes = lessons.reduce((acc, l) => acc + (l.readingTimeMinutes || 0), 0);

          return (
            <div
              key={chapter.id}
              className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden transition-colors hover:border-slate-300"
            >
              <button
                type="button"
                onClick={() => toggleChapter(chapter.id)}
                aria-expanded={isOpen}
                className="w-full bg-slate-50/80 hover:bg-slate-100/70 px-4 sm:px-5 py-4 border-b border-slate-200/70 flex items-center justify-between gap-3 text-right transition-colors"
              >
                <div className="flex items-start sm:items-center gap-3 min-w-0">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#042A1B] text-[#7AE36A] font-mono text-xs font-bold shrink-0 tabular-nums">
                    {chIdx + 1}
                  </span>
                  <div className="min-w-0 space-y-0.5">
                    <h3 className="font-bold text-slate-950 text-sm sm:text-base leading-snug">
                      {chapter.title}
                    </h3>
                    {chapter.summary && (
                      <p className="text-xs text-slate-500 line-clamp-1">{chapter.summary}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 text-xs text-slate-500 tabular-nums">
                  <span className="hidden sm:inline">{lessons.length} درس</span>
                  {chapterMinutes > 0 && (
                    <>
                      <span className="hidden sm:inline text-slate-300">·</span>
                      <span className="hidden sm:inline">{chapterMinutes} دقیقه</span>
                    </>
                  )}
                  {isOpen ? (
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  ) : (
                    <ChevronLeft className="w-4 h-4 text-slate-500" />
                  )}
                </div>
              </button>

              {isOpen && (
                <div className="divide-y divide-slate-100 p-2">
                  {lessons.length > 0 ? (
                    lessons.map((lesson, lIdx) => (
                      <Link
                        key={lesson.id}
                        href={`/docs/${courseSlug}/${lesson.slug}`}
                        className="group flex items-center justify-between gap-3 px-3.5 py-3 rounded-xl hover:bg-emerald-50/60 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className="text-xs font-mono text-slate-400 font-semibold w-7 shrink-0 text-left tabular-nums"
                            dir="ltr"
                          >
                            {chIdx + 1}.{lIdx + 1}
                          </span>
                          <span className="text-sm font-medium text-slate-800 group-hover:text-emerald-800 transition-colors truncate">
                            {lesson.title}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          {lesson.readingTimeMinutes > 0 && (
                            <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 tabular-nums">
                              <Clock className="w-3 h-3" />
                              <span>{lesson.readingTimeMinutes} دقیقه</span>
                            </span>
                          )}
                          <span className="text-xs text-emerald-700 font-bold opacity-80 group-hover:opacity-100 inline-flex items-center gap-1">
                            <span className="hidden sm:inline">مطالعه</span>
                            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                          </span>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <p className="p-4 text-xs text-slate-400 text-center">
                      در حال حاضر درسی در این فصل منتشر نشده است.
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
