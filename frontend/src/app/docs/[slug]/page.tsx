import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  BookOpen,
  Clock,
  Layers,
  ArrowLeft,
  CheckCircle2,
  Users,
  ChevronLeft,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import {
  getPublishedCourseDetail,
  getCourseOutline,
  isNotFoundError,
} from '../../../lib/server';
import { formatPersianCount, formatReadingDuration } from '../../../lib/format-duration';
import CourseOutlineList from '../../../components/docs/CourseOutlineList';
import CourseCoverMedia from '../../../components/docs/CourseCoverMedia';

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
      alternates: {
        canonical: `/docs/${course.slug}`,
      },
      robots: 'index, follow',
      openGraph: {
        title: course.seo?.metaTitle || `${course.title} | مستندات تکا`,
        description: course.seo?.metaDescription || course.summary,
        type: 'article',
      },
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

const LEVEL_MAP: Record<string, string> = {
  beginner: 'مقدماتی',
  intermediate: 'متوسط',
  advanced: 'پیشرفته',
};

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

  const levelLabel = LEVEL_MAP[course.level] || course.level;
  const readingDurationText = formatReadingDuration(course.stats?.estimatedReadingTimeMinutes);

  // Find the first published lesson across any chapter
  const firstLesson = outline.chapters
    ?.flatMap((ch) => ch.lessons || [])
    .find((l) => Boolean(l.slug));

  const publishedDate = course.publishedAt
    ? new Intl.DateTimeFormat('fa-IR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(new Date(course.publishedAt))
    : null;

  const courseJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    description: course.summary,
    inLanguage: 'fa-IR',
    provider: {
      '@type': 'Organization',
      name: 'TECHA',
      url: 'https://techa.ir',
    },
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'صفحه اصلی', item: 'https://techa.ir/' },
      { '@type': 'ListItem', position: 2, name: 'مستندات و دوره‌ها', item: 'https://techa.ir/docs' },
      {
        '@type': 'ListItem',
        position: 3,
        name: course.title,
        item: `https://techa.ir/docs/${courseSlug}`,
      },
    ],
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Breadcrumbs */}
      <nav aria-label="مسیر راهنما" className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
        <Link href="/" className="hover:text-emerald-700 transition-colors">
          صفحه اصلی
        </Link>
        <ChevronLeft className="h-3.5 w-3.5 text-slate-400" />
        <Link href="/docs" className="hover:text-emerald-700 transition-colors">
          مستندات و دوره‌ها
        </Link>
        <ChevronLeft className="h-3.5 w-3.5 text-slate-400" />
        <span className="text-slate-900 font-semibold truncate max-w-xs sm:max-w-md">
          {course.title}
        </span>
      </nav>

      {/* Course Hero Card */}
      <section className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-xs">
        <div className="bg-[#042A1B] text-white p-6 sm:p-8 lg:p-10 border-b border-[#7AE36A]/20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
            <div className="lg:col-span-8 space-y-5">
              {/* Unboxed Metadata Strip */}
              <div className="flex flex-wrap items-center gap-2.5 text-xs text-white/80 font-medium tabular-nums">
                <span className="text-[#7AE36A] font-bold inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7AE36A]" />
                  <span>سطح {levelLabel}</span>
                </span>

                {course.stats?.totalChapters !== undefined && (
                  <>
                    <span className="text-white/25">·</span>
                    <span className="inline-flex items-center gap-1">
                      <Layers className="h-3.5 w-3.5 text-[#7AE36A]" />
                      <span>{formatPersianCount(course.stats.totalChapters)} فصل</span>
                    </span>
                  </>
                )}

                {course.stats?.totalLessons !== undefined && (
                  <>
                    <span className="text-white/25">·</span>
                    <span className="inline-flex items-center gap-1">
                      <BookOpen className="h-3.5 w-3.5 text-[#7AE36A]" />
                      <span>{formatPersianCount(course.stats.totalLessons)} درس</span>
                    </span>
                  </>
                )}

                {readingDurationText ? (
                  <>
                    <span className="text-white/25">·</span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-[#7AE36A]" />
                      <span>{readingDurationText} مطالعه</span>
                    </span>
                  </>
                ) : null}

                {publishedDate && (
                  <>
                    <span className="text-white/25">·</span>
                    <span className="inline-flex items-center gap-1 text-white/65">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>انتشار: {publishedDate}</span>
                    </span>
                  </>
                )}
              </div>

              <div className="space-y-3">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight text-balance">
                  {course.title}
                </h1>
                <p className="text-sm sm:text-base text-white/80 leading-relaxed max-w-3xl">
                  {course.summary}
                </p>
              </div>

              {/* Primary Action CTA or Empty Lessons Guard */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                {firstLesson ? (
                  <Link
                    href={`/docs/${courseSlug}/${firstLesson.slug}`}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#7AE36A] hover:bg-[#6acf5a] text-[#042A1B] px-6 py-3 text-sm font-extrabold transition-colors"
                  >
                    <span>شروع یادگیری از درس اول</span>
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                ) : (
                  <div className="inline-flex items-center gap-2 rounded-xl bg-white/10 border border-white/15 px-4 py-2.5 text-xs sm:text-sm text-white/85 font-medium">
                    <AlertCircle className="h-4 w-4 text-[#7AE36A] shrink-0" />
                    <span>سرفصل‌ها و درس‌های این دوره هنوز منتشر نشده است</span>
                  </div>
                )}

                <Link
                  href="/docs"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 px-4 py-3 text-xs sm:text-sm text-white font-semibold transition-colors"
                >
                  <span>بازگشت به فهرست دوره‌ها</span>
                </Link>
              </div>
            </div>

            {/* Course Visual Cover Card */}
            <div className="lg:col-span-4">
              <div className="rounded-2xl overflow-hidden border border-white/15 shadow-lg">
                <CourseCoverMedia
                  title={course.title}
                  slug={course.slug}
                  coverStorageKey={course.coverStorageKey}
                  icon={course.icon}
                  className="h-48 sm:h-52 lg:h-48"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Course Body Details */}
        <div className="p-6 sm:p-8 lg:p-10 space-y-8">
          {/* Course Detailed Description */}
          {course.description && (
            <section className="space-y-3">
              <h2 className="text-lg font-extrabold text-slate-950">معرفی و اهداف دوره</h2>
              <div className="text-sm sm:text-[15px] text-slate-700 leading-8 whitespace-pre-line bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80 max-w-none">
                {course.description}
              </div>
            </section>
          )}

          {/* Prerequisites & Target Audience */}
          {(course.prerequisites?.length > 0 || course.targetAudience?.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {course.prerequisites && course.prerequisites.length > 0 && (
                <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>پیش‌نیازهای پیشنهادی</span>
                  </div>
                  <ul className="space-y-2 text-xs sm:text-[13px] text-slate-600">
                    {course.prerequisites.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 leading-relaxed">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0 mt-2" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {course.targetAudience && course.targetAudience.length > 0 && (
                <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
                    <Users className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>این دوره مناسب چه کسانی است؟</span>
                  </div>
                  <ul className="space-y-2 text-xs sm:text-[13px] text-slate-600">
                    {course.targetAudience.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 leading-relaxed">
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-400 shrink-0 mt-2" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Course Curriculum */}
          <section className="space-y-4 pt-2">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
              <h2 className="text-xl font-extrabold text-slate-950 flex items-center gap-2">
                <Layers className="h-5 w-5 text-emerald-600" />
                <span>سرفصل‌ها و درس‌های دوره</span>
              </h2>
            </div>

            <CourseOutlineList
              courseSlug={courseSlug}
              chapters={outline.chapters || []}
            />
          </section>

          {/* Tags */}
          {course.tags && course.tags.length > 0 && (
            <footer className="pt-6 border-t border-slate-100 flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-500 font-semibold">مباحث مرتبط:</span>
              {course.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/docs?tag=${encodeURIComponent(tag)}`}
                  className="text-xs font-mono bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200/70 transition-colors"
                  dir="ltr"
                >
                  #{tag}
                </Link>
              ))}
            </footer>
          )}
        </div>
      </section>
    </div>
  );
}
