import React from 'react';
import Link from 'next/link';
import { CoursePublicDto } from '@techa/shared';
import { BookOpen, Clock, ArrowLeft, Layers } from 'lucide-react';
import CourseCoverMedia from './CourseCoverMedia';
import { formatPersianCount, formatReadingDuration } from '../../lib/format-duration';

const LEVEL_MAP: Record<string, { label: string; dot: string; text: string }> = {
  beginner: { label: 'مقدماتی', dot: 'bg-emerald-500', text: 'text-emerald-800' },
  intermediate: { label: 'متوسط', dot: 'bg-amber-500', text: 'text-amber-800' },
  advanced: { label: 'پیشرفته', dot: 'bg-rose-500', text: 'text-rose-800' },
  all_levels: { label: 'همه سطوح', dot: 'bg-sky-500', text: 'text-sky-800' },
};

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
  const readingDuration = formatReadingDuration(course.stats?.estimatedReadingTimeMinutes);

  return (
    <Link
      href={`/docs/${course.slug}`}
      className="group relative flex flex-col h-full overflow-hidden rounded-2xl border border-slate-200/90 bg-white transition-all duration-200 hover:border-emerald-500/70 hover:shadow-lg hover:shadow-emerald-950/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
    >
      {/* Course Cover Header */}
      <CourseCoverMedia
        title={course.title}
        slug={course.slug}
        coverStorageKey={course.coverStorageKey}
        icon={course.icon}
        className="h-44 border-b border-slate-100"
      />

      <div className="flex-1 flex flex-col justify-between p-5 sm:p-6">
        <div className="space-y-3">
          {/* Unboxed Metadata Row */}
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className={`font-bold inline-flex items-center gap-1.5 ${levelInfo.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${levelInfo.dot}`} />
              <span>سطح {levelInfo.label}</span>
            </span>

            <div className="flex items-center gap-2 text-slate-500 font-medium tabular-nums shrink-0">
              <span className="inline-flex items-center gap-1">
                <Layers className="h-3.5 w-3.5 text-slate-400" />
                <span>{formatPersianCount(totalChapters)} فصل</span>
              </span>
              <span className="text-slate-300" aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1">
                <BookOpen className="h-3.5 w-3.5 text-slate-400" />
                <span>{formatPersianCount(totalLessons)} درس</span>
              </span>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-lg font-extrabold text-slate-950 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug">
            {course.title}
          </h3>

          {/* Summary */}
          <p className="text-[13.5px] text-slate-600 line-clamp-2 leading-relaxed text-right">
            {course.summary}
          </p>
        </div>

        {/* Footer */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col gap-3">
          {course.tags && course.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] font-mono text-slate-500" dir="ltr">
              {course.tags.slice(0, 3).map((tag) => (
                <span key={tag}>#{tag}</span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between gap-2 text-xs">
            {readingDuration ? (
              <span className="inline-flex items-center gap-1.5 text-slate-500 font-medium tabular-nums">
                <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span>{readingDuration} مطالعه</span>
              </span>
            ) : (
              <span className="text-[11px] text-slate-400 font-medium">سرفصل‌ها در حال تکمیل</span>
            )}

            <span className="inline-flex items-center gap-1 font-bold text-emerald-700 group-hover:-translate-x-1 transition-transform shrink-0 whitespace-nowrap">
              <span>مشاهده دوره</span>
              <ArrowLeft className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
