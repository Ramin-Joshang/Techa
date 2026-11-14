'use client';

import React, { useState, useEffect } from 'react';
import { ListTree, PanelLeftClose } from 'lucide-react';
import type { LessonHeadingItem } from './content/heading-utils';

interface LessonTableOfContentsProps {
  headings: LessonHeadingItem[];
  variant?: 'rail' | 'inline';
  desktopCollapsed?: boolean;
  onToggleDesktopCollapse?: () => void;
}

export default function LessonTableOfContents({
  headings,
  variant = 'rail',
  desktopCollapsed = false,
  onToggleDesktopCollapse,
}: LessonTableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>(headings[0]?.id || '');

  useEffect(() => {
    if (!headings || headings.length === 0) return;
    setActiveId(headings[0].id);

    const elements = headings
      .map((h) => document.getElementById(h.id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0 && visible[0].target.id) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: '-96px 0px -65% 0px',
        threshold: [0, 1],
      }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [headings]);

  if (!headings || headings.length < 2) {
    return null;
  }

  if (variant === 'inline') {
    return (
      <nav
        aria-label="فهرست مطالب این درس"
        className="xl:hidden mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5"
      >
        <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
          <ListTree className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>در این درس می‌خوانید</span>
        </div>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
          {headings.map((h) => (
            <li key={h.id}>
              <a
                href={`#${h.id}`}
                className={`block py-1 px-2 rounded-lg transition-colors truncate ${
                  h.level === 3 ? 'pr-4 text-[11px]' : ''
                } ${
                  activeId === h.id
                    ? 'bg-emerald-50 text-emerald-800 font-bold'
                    : 'text-slate-600 hover:text-emerald-700 hover:bg-slate-100'
                }`}
              >
                {h.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    );
  }

  if (desktopCollapsed) {
    return null;
  }

  return (
    <aside
      aria-label="فهرست عناوین درس"
      className="hidden xl:block w-60 shrink-0 sticky top-24 space-y-3"
    >
      <div className="rounded-2xl border border-slate-200/90 bg-white p-4 space-y-3 shadow-xs">
        <div className="flex items-center justify-between gap-2 text-xs font-extrabold text-slate-900 pb-2 border-b border-slate-100">
          <span className="inline-flex items-center gap-2 min-w-0">
            <ListTree className="h-4 w-4 text-emerald-600 shrink-0" />
            <span className="truncate">فهرست مطالب درس</span>
          </span>
          {onToggleDesktopCollapse && (
            <button
              type="button"
              onClick={onToggleDesktopCollapse}
              title="بستن فهرست مطالب"
              aria-label="بستن فهرست مطالب درس"
              className="p-1 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors shrink-0"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}
        </div>
        <ul className="space-y-1 max-h-[calc(100vh-14rem)] overflow-y-auto custom-scrollbar text-xs">
          {headings.map((h) => {
            const isActive = activeId === h.id;
            return (
              <li key={h.id}>
                <a
                  href={`#${h.id}`}
                  className={`block py-1.5 px-2.5 rounded-lg transition-colors leading-snug ${
                    h.level === 3 ? 'pr-5 text-[11.5px]' : ''
                  } ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 font-bold'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
                  }`}
                >
                  {h.text}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
