'use client';

import React, { useState } from 'react';
import { CourseOutlinePublicDto } from '@techa/shared';
import {
  PanelRightOpen,
  PanelRightClose,
  PanelLeftOpen,
  PanelLeftClose,
} from 'lucide-react';
import CourseSidebar from './CourseSidebar';
import LessonTableOfContents from './LessonTableOfContents';
import type { LessonHeadingItem } from './content/heading-utils';

interface LessonWorkspaceClientProps {
  outline: CourseOutlinePublicDto;
  courseSlug: string;
  courseTitle?: string;
  headings: LessonHeadingItem[];
  children: React.ReactNode;
}

export default function LessonWorkspaceClient({
  outline,
  courseSlug,
  courseTitle,
  headings,
  children,
}: LessonWorkspaceClientProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [tocCollapsed, setTocCollapsed] = useState(false);

  const hasToc = headings && headings.length >= 2;

  return (
    <div className="space-y-3">
      {/* Desktop Rail Collapse / Expand Controls */}
      <div className="hidden lg:flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setSidebarCollapsed((prev) => !prev)}
          aria-expanded={!sidebarCollapsed}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:border-emerald-400 hover:text-emerald-800 text-xs font-bold text-slate-600 transition-colors shadow-2xs"
        >
          {sidebarCollapsed ? (
            <>
              <PanelRightOpen className="w-3.5 h-3.5 text-emerald-600" />
              <span>نمایش سرفصل‌های دوره</span>
            </>
          ) : (
            <>
              <PanelRightClose className="w-3.5 h-3.5 text-slate-500" />
              <span>بستن سرفصل‌ها</span>
            </>
          )}
        </button>

        {hasToc && (
          <button
            type="button"
            onClick={() => setTocCollapsed((prev) => !prev)}
            aria-expanded={!tocCollapsed}
            className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:border-emerald-400 hover:text-emerald-800 text-xs font-bold text-slate-600 transition-colors shadow-2xs"
          >
            {tocCollapsed ? (
              <>
                <PanelLeftOpen className="w-3.5 h-3.5 text-emerald-600" />
                <span>نمایش فهرست مطالب</span>
              </>
            ) : (
              <>
                <PanelLeftClose className="w-3.5 h-3.5 text-slate-500" />
                <span>بستن فهرست مطالب</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* 3-Column Study Workspace */}
      <div className="flex flex-col lg:flex-row items-start gap-6 xl:gap-8">
        {/* Right Rail (RTL Start): Course Outline Sidebar */}
        <CourseSidebar
          outline={outline}
          courseSlug={courseSlug}
          courseTitle={courseTitle}
          desktopCollapsed={sidebarCollapsed}
          onToggleDesktopCollapse={() => setSidebarCollapsed(true)}
        />

        {/* Main Reading Surface */}
        <div
          className={`flex-1 w-full min-w-0 bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-8 lg:p-10 shadow-xs transition-all ${
            sidebarCollapsed && (tocCollapsed || !hasToc)
              ? 'max-w-5xl mx-auto'
              : 'max-w-4xl mx-auto lg:mx-0'
          }`}
        >
          {children}
        </div>

        {/* Left Rail (RTL End, xl+): Sticky Dynamic Table of Contents */}
        <LessonTableOfContents
          headings={headings}
          variant="rail"
          desktopCollapsed={tocCollapsed}
          onToggleDesktopCollapse={() => setTocCollapsed(true)}
        />
      </div>
    </div>
  );
}
