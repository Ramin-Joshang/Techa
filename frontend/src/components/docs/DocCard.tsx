import React from 'react';
import Link from 'next/link';
import { CoursePublicDto } from '@techa/shared';
import {
  BookOpen,
  Clock,
  ArrowLeft,
  Layers,
  Code2,
  Cpu,
  Terminal,
  FileCode2,
} from 'lucide-react';

const LEVEL_MAP: Record<string, { label: string; dot: string; text: string }> = {
  beginner: { label: 'مقدماتی', dot: 'bg-emerald-500', text: 'text-emerald-800' },
  intermediate: { label: 'متوسط', dot: 'bg-amber-500', text: 'text-amber-800' },
  advanced: { label: 'پیشرفته', dot: 'bg-rose-500', text: 'text-rose-800' },
};

function renderCourseIcon(icon?: CoursePublicDto['icon'], slug?: string) {
  if (icon?.kind === 'media' && icon.storageKey) {
    const src =
      icon.storageKey.startsWith('/') || icon.storageKey.startsWith('http')
        ? icon.storageKey
        : `/api/v1/public/media/${icon.storageKey}`;
    return (
      <img
        src={src}
        alt=""
        className="w-6 h-6 object-contain rounded"
        loading="lazy"
      />
    );
  }

  const key = `${icon?.kind === 'system' ? icon.name : ''} ${slug || ''}`.toLowerCase();
  if (key.includes('node') || key.includes('express') || key.includes('server')) {
    return <Terminal className="w-5 h-5 text-emerald-700" />;
  }
  if (key.includes('typescript') || key.includes('ts')) {
    return <FileCode2 className="w-5 h-5 text-emerald-700" />;
  }
  if (key.includes('react') || key.includes('next')) {
    return <Code2 className="w-5 h-5 text-emerald-700" />;
  }
  if (key.includes('cpu') || key.includes('arch')) {
    return <Cpu className="w-5 h-5 text-emerald-700" />;
  }
  return <BookOpen className="w-5 h-5 text-emerald-700" />;
}

interface DocCardProps {
  course: CoursePublicDto;
}

export default function DocCard({ course }: DocCardProps) {
  const levelInfo = LEVEL_MAP[course.level] || {
    label: course.level,
    dot: 'bg-slate-400',
    text: 'text-slate-700',
  };

  const totalChapters = course.stats?.totalChapters ?? 0;
  const totalLessons = course.stats?.totalLessons ?? 0;
  const readingMinutes = course.stats?.estimatedReadingTimeMinutes ?? 0;

  return (
    <Link
      href={`/docs/${course.slug}`}
      className="group relative flex flex-col justify-between h-full rounded-2xl border border-slate-200/90 bg-white p-6 transition-all duration-200 hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-950/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
    >
      <div className="space-y-4">
        {/* Card Header: Icon + Unboxed Level + Counts */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-100 shrink-0 group-hover:bg-emerald-100/70 transition-colors">
              {renderCourseIcon(course.icon, course.slug)}
            </div>
            <span className={`text-xs font-bold inline-flex items-center gap-1.5 ${levelInfo.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${levelInfo.dot}`} />
              <span>سطح {levelInfo.label}</span>
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium tabular-nums shrink-0">
            <span className="inline-flex items-center gap-1">
              <Layers className="h-3.5 w-3.5 text-slate-400" />
              <span>{totalChapters} فصل</span>
            </span>
            <span className="text-slate-300">·</span>
            <span className="inline-flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5 text-slate-400" />
              <span>{totalLessons} درس</span>
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg sm:text-[19px] font-extrabold text-slate-950 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug">
          {course.title}
        </h3>

        {/* Summary */}
        <p className="text-[13.5px] text-slate-600 line-clamp-3 leading-relaxed text-right">
          {course.summary}
        </p>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col gap-3">
        {course.tags && course.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5" dir="ltr">
            {course.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-md bg-slate-50 border border-slate-200/80 px-2 py-0.5 text-[11px] font-mono text-slate-600"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between gap-2 text-xs pt-0.5">
          {readingMinutes > 0 ? (
            <span className="inline-flex items-center gap-1 text-slate-500 font-medium tabular-nums">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              <span>{readingMinutes} دقیقه مطالعه</span>
            </span>
          ) : (
            <span className="text-[11px] text-slate-400 font-medium">سرفصل‌ها در حال تکمیل</span>
          )}

          <span className="inline-flex items-center gap-1 font-bold text-emerald-700 group-hover:-translate-x-1 transition-transform shrink-0">
            <span>مشاهده سرفصل‌ها</span>
            <ArrowLeft className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
