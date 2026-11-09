import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  BookOpen,
  Clock,
  Layers,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Users,
  Award,
  FileText,
} from 'lucide-react';
import {
  getPublishedCourseDetail,
  getCourseOutline,
  isNotFoundError,
} from '../../../lib/server';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const courseSlug = resolvedParams?.slug || '';
  if (!courseSlug) return { title: 'مستندات تکا' };

  try {
    const course = await getPublishedCourseDetail(courseSlug);
    return {
      title: course.seo?.metaTitle || `${course.title} | مستندات تکا`,
      description: course.seo?.metaDescription || course.summary,
      keywords: course.tags,
      robots: 'index, follow',
    };
  } catch (err: unknown) {
    if (isNotFoundError(err)) {
      return { title: 'دوره یافت نشد | تکا' };
    }
    return { title: 'مستندات آموزشی | تکا' };
  }
}

interface CourseOverviewPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CourseOverviewPage({ params }: CourseOverviewPageProps) {
  const resolvedParams = await params;
  const courseSlug = resolvedParams?.slug || '';

  if (!courseSlug) {
    notFound();
  }

  let course;
  let outline;

  try {
    [course, outline] = await Promise.all([
      getPublishedCourseDetail(courseSlug),
      getCourseOutline(courseSlug),
    ]);
  } catch (err: unknown) {
    if (isNotFoundError(err)) {
      notFound();
    }
    throw err;
  }

  const levelMap: Record<string, { label: string; className: string }> = {
    beginner: { label: 'مقدماتی', className: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
    intermediate: { label: 'متوسط', className: 'bg-blue-50 text-blue-800 border-blue-200' },
    advanced: { label: 'پیشرفته', className: 'bg-purple-50 text-purple-800 border-purple-200' },
  };

  const levelInfo = levelMap[course.level] || {
    label: course.level,
    className: 'bg-gray-50 text-gray-700 border-gray-200',
  };

  // Find first lesson to start reading
  const firstLessonSlug =
    outline.chapters?.[0]?.lessons?.[0]?.slug || null;

  return (
    <article className="space-y-8">
      {/* Course Header */}
      <header className="space-y-4 pb-6 border-b border-gray-100">
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`text-xs font-semibold px-3 py-1 rounded-full border ${levelInfo.className}`}
          >
            سطح {levelInfo.label}
          </span>

          {course.stats?.totalChapters !== undefined && (
            <span className="inline-flex items-center gap-1 text-xs text-gray-500 font-medium">
              <Layers className="h-3.5 w-3.5 text-gray-400" />
              <span>{course.stats.totalChapters} فصل</span>
            </span>
          )}

          {course.stats?.totalLessons !== undefined && (
            <span className="inline-flex items-center gap-1 text-xs text-gray-500 font-medium">
              <BookOpen className="h-3.5 w-3.5 text-gray-400" />
              <span>{course.stats.totalLessons} درس</span>
            </span>
          )}

          {course.stats?.estimatedReadingTimeMinutes ? (
            <span className="inline-flex items-center gap-1 text-xs text-gray-500 font-medium">
              <Clock className="h-3.5 w-3.5 text-gray-400" />
              <span>{course.stats.estimatedReadingTimeMinutes} دقیقه زمان مطالعه</span>
            </span>
          ) : null}
        </div>

        <h1 className="text-2xl sm:text-4xl font-black text-gray-950 tracking-tight leading-tight">
          {course.title}
        </h1>

        <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-3xl">
          {course.summary}
        </p>

        {/* Start Button */}
        {firstLessonSlug && (
          <div className="pt-2">
            <Link
              href={`/docs/${courseSlug}/${firstLessonSlug}`}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 active:scale-98 transition-all"
            >
              <span>شروع یادگیری از فصل اول</span>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>
        )}
      </header>

      {/* Course Detailed Description */}
      {course.description && (
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900">درباره این دوره</h2>
          <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line bg-gray-50/60 p-5 rounded-2xl border border-gray-100">
            {course.description}
          </div>
        </section>
      )}

      {/* Prerequisites & Audience */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {course.prerequisites && course.prerequisites.length > 0 && (
          <div className="rounded-2xl border border-gray-200/90 bg-white p-5 space-y-3 shadow-xs">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>پیش‌نیازهای دوره</span>
            </div>
            <ul className="space-y-2 text-xs text-gray-600">
              {course.prerequisites.map((item, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {course.targetAudience && course.targetAudience.length > 0 && (
          <div className="rounded-2xl border border-gray-200/90 bg-white p-5 space-y-3 shadow-xs">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
              <Users className="h-4 w-4 text-emerald-600" />
              <span>مخاطبان هدف</span>
            </div>
            <ul className="space-y-2 text-xs text-gray-600">
              {course.targetAudience.map((item, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Course Outline Curriculum */}
      <section className="space-y-4 pt-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h2 className="text-xl font-bold text-gray-950 flex items-center gap-2">
            <Layers className="h-5 w-5 text-emerald-600" />
            <span>سرفصل‌ها و درس‌های دوره</span>
          </h2>
          <span className="text-xs text-gray-500 font-medium">
            {outline.chapters?.length ?? 0} فصل آموزشی
          </span>
        </div>

        <div className="space-y-4">
          {outline.chapters && outline.chapters.length > 0 ? (
            outline.chapters.map((chapter, chIdx) => (
              <div
                key={chapter.id}
                className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-xs"
              >
                <div className="bg-gray-50/80 px-5 py-3.5 border-b border-gray-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-600 text-white font-mono text-xs font-bold">
                      {chIdx + 1}
                    </span>
                    <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                      {chapter.title}
                    </h3>
                  </div>
                  <span className="text-xs text-gray-500 font-medium">
                    {chapter.lessons?.length ?? 0} درس
                  </span>
                </div>

                <div className="divide-y divide-gray-100 p-2">
                  {chapter.lessons && chapter.lessons.length > 0 ? (
                    chapter.lessons.map((lesson, lIdx) => (
                      <Link
                        key={lesson.id}
                        href={`/docs/${courseSlug}/${lesson.slug}`}
                        className="group flex items-center justify-between px-4 py-3 rounded-xl hover:bg-emerald-50/60 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono text-gray-400 font-semibold w-5 text-left">
                            {chIdx + 1}.{lIdx + 1}
                          </span>
                          <span className="text-sm font-medium text-gray-800 group-hover:text-emerald-800 transition-colors">
                            {lesson.title}
                          </span>
                        </div>
                        <span className="text-xs text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity font-semibold">
                          مطالعه درس ←
                        </span>
                      </Link>
                    ))
                  ) : (
                    <p className="p-3 text-xs text-gray-400">درسی در این فصل وجود ندارد.</p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">
              هنوز سرفصلی برای این دوره ثبت نشده است.
            </p>
          )}
        </div>
      </section>

      {/* Tags */}
      {course.tags && course.tags.length > 0 && (
        <footer className="pt-6 border-t border-gray-100 flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-400 font-medium">برچسب‌ها:</span>
          {course.tags.map((tag) => (
            <Link
              key={tag}
              href={`/docs?tag=${tag}`}
              className="text-xs font-mono bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
            >
              #{tag}
            </Link>
          ))}
        </footer>
      )}
    </article>
  );
}
