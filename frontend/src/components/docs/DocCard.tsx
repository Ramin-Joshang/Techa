import React from 'react';
import Link from 'next/link';
import { CoursePublicDto } from '@techa/shared';
import { BookOpen, Clock, Tag, ArrowLeft, Layers } from 'lucide-react';

const LEVEL_MAP: Record<string, string> = {
  beginner: 'مقدماتی',
  intermediate: 'متوسط',
  advanced: 'پیشرفته',
};

interface DocCardProps {
  course: CoursePublicDto;
}

export default function DocCard({ course }: DocCardProps) {
  const levelLabel = LEVEL_MAP[course.level] || course.level;

  return (
    <Link
      href={`/docs/${course.slug}`}
      className="group relative flex flex-col justify-between h-full rounded-2xl border border-gray-200/90 bg-white p-6 shadow-xs hover:shadow-xl hover:border-emerald-300 transition-all duration-300"
    >
      <div className="space-y-4">
        {/* Header with Unboxed Level & Chapter Count (Zero-Pill Discipline) */}
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-emerald-800 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            سطح {levelLabel}
          </span>

          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
            <span className="flex items-center gap-1">
              <Layers className="h-3.5 w-3.5 text-gray-400" />
              <span>{course.stats?.totalChapters ?? 0} فصل</span>
            </span>
            <span className="text-gray-300">·</span>
            <span className="flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5 text-gray-400" />
              <span>{course.stats?.totalLessons ?? 0} درس</span>
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-950 group-hover:text-emerald-700 transition-colors line-clamp-2">
          {course.title}
        </h3>

        {/* Summary */}
        <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed text-justify">
          {course.summary}
        </p>
      </div>

      {/* Footer Info */}
      <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col gap-3">
        {/* Tags */}
        {course.tags && course.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {course.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded bg-gray-50 border border-gray-200/70 px-2 py-0.5 text-[11px] font-mono text-gray-600"
              >
                <Tag className="h-2.5 w-2.5 text-gray-400" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Action Link & Reading Time */}
        <div className="flex items-center justify-between text-xs font-semibold text-emerald-600 pt-1">
          {course.stats?.estimatedReadingTimeMinutes ? (
            <span className="inline-flex items-center gap-1 text-gray-400 font-normal">
              <Clock className="h-3 w-3" />
              <span>{course.stats.estimatedReadingTimeMinutes} دقیقه مطالعه</span>
            </span>
          ) : (
            <span />
          )}

          <span className="inline-flex items-center gap-1 group-hover:translate-x-[-4px] transition-transform">
            <span>مشاهده سرفصل‌ها</span>
            <ArrowLeft className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
