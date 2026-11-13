import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  ChevronLeft,
  Layers,
} from 'lucide-react';
import {
  getPublishedLessonDetail,
  getCourseOutline,
  isNotFoundError,
} from '../../../../lib/server';
import ContentBlocksRenderer from '../../../../components/docs/content/ContentBlocksRenderer';
import { extractLessonHeadings } from '../../../../components/docs/content/heading-utils';
import CourseSidebar from '../../../../components/docs/CourseSidebar';
import LessonTableOfContents from '../../../../components/docs/LessonTableOfContents';
import {
  LessonReadingProgress,
  CopyLessonLinkButton,
} from '../../../../components/docs/LessonReadingTools';

interface LessonPageProps {
  params: Promise<{
    slug: string;
    lessonSlug: string;
  }>;
}

export async function generateMetadata({ params }: LessonPageProps) {
  const resolvedParams = await params;
  const courseSlug = resolvedParams?.slug || '';
  const lessonSlug = resolvedParams?.lessonSlug || '';

  if (!courseSlug || !lessonSlug) return { title: 'مستندات تکا' };

  try {
    const lesson = await getPublishedLessonDetail(courseSlug, lessonSlug);
    return {
      title: lesson.seo?.metaTitle || `${lesson.title} | مستندات تکا`,
      description: lesson.seo?.metaDescription || `درس ${lesson.title} از مستندات جامع تکا`,
      alternates: {
        canonical: `/docs/${courseSlug}/${lessonSlug}`,
      },
      robots: 'index, follow',
      openGraph: {
        title: lesson.seo?.metaTitle || `${lesson.title} | مستندات تکا`,
        description: lesson.seo?.metaDescription || `درس ${lesson.title} از مستندات جامع تکا`,
        type: 'article',
      },
    };
  } catch (err: unknown) {
    if (isNotFoundError(err)) {
      return { title: 'درس یافت نشد | تکا' };
    }
    return { title: 'مستندات آموزشی | تکا' };
  }
}

export default async function LessonPage({ params }: LessonPageProps) {
  const resolvedParams = await params;
  const courseSlug = resolvedParams?.slug || '';
  const lessonSlug = resolvedParams?.lessonSlug || '';

  if (!courseSlug || !lessonSlug) {
    notFound();
  }

  let lesson;
  let outline;

  try {
    [lesson, outline] = await Promise.all([
      getPublishedLessonDetail(courseSlug, lessonSlug),
      getCourseOutline(courseSlug),
    ]);
  } catch (err: unknown) {
    if (isNotFoundError(err)) {
      notFound();
    }
    throw err;
  }

  // Sequential lesson navigation & current chapter info
  const flatLessons: Array<{ title: string; slug: string; chapterTitle: string }> = [];
  if (outline?.chapters) {
    for (const chapter of outline.chapters) {
      if (chapter.lessons) {
        for (const l of chapter.lessons) {
          flatLessons.push({
            title: l.title,
            slug: l.slug,
            chapterTitle: chapter.title,
          });
        }
      }
    }
  }

  const currentIndex = flatLessons.findIndex((l) => l.slug === lessonSlug);
  const currentChapterTitle =
    currentIndex !== -1 ? flatLessons[currentIndex].chapterTitle : null;
  const prevLesson = currentIndex > 0 ? flatLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex !== -1 && currentIndex < flatLessons.length - 1
      ? flatLessons[currentIndex + 1]
      : null;
  const lessonNumber = currentIndex !== -1 ? currentIndex + 1 : lesson.order || 1;
  const totalLessons = flatLessons.length;

  // Extract all h2 & h3 heading anchors consistently with ContentBlocksRenderer
  const headings = extractLessonHeadings(lesson.contentBlocks).filter(
    (h) => h.level === 2 || h.level === 3
  );

  const techArticleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: lesson.title,
    description: lesson.seo?.metaDescription || lesson.title,
    articleSection: outline?.course?.title,
    inLanguage: 'fa-IR',
    publisher: {
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
      { '@type': 'ListItem', position: 2, name: 'مستندات', item: 'https://techa.ir/docs' },
      {
        '@type': 'ListItem',
        position: 3,
        name: outline?.course?.title || courseSlug,
        item: `https://techa.ir/docs/${courseSlug}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: lesson.title,
        item: `https://techa.ir/docs/${courseSlug}/${lessonSlug}`,
      },
    ],
  };

  return (
    <div className="flex flex-col lg:flex-row items-start gap-6 xl:gap-8">
      <LessonReadingProgress />

      {/* Right Rail (RTL Start): Course Outline Sidebar */}
      <CourseSidebar
        outline={outline}
        courseSlug={courseSlug}
        courseTitle={outline?.course?.title}
      />

      {/* Main Reading Surface */}
      <div className="flex-1 w-full min-w-0 max-w-4xl bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-8 lg:p-10 shadow-xs">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(techArticleJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />

        <article className="space-y-8">
          {/* Breadcrumbs */}
          <nav aria-label="مسیر راهنما" className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
            <Link href="/" className="hover:text-emerald-700 transition-colors">
              صفحه اصلی
            </Link>
            <ChevronLeft className="h-3.5 w-3.5 text-slate-400" />
            <Link href="/docs" className="hover:text-emerald-700 transition-colors">
              مستندات
            </Link>
            <ChevronLeft className="h-3.5 w-3.5 text-slate-400" />
            <Link
              href={`/docs/${courseSlug}`}
              className="hover:text-emerald-700 transition-colors truncate max-w-[180px]"
            >
              {outline?.course?.title || courseSlug}
            </Link>
            <ChevronLeft className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-slate-900 font-semibold truncate max-w-[200px] sm:max-w-xs">
              {lesson.title}
            </span>
          </nav>

          {/* Lesson Header */}
          <header className="space-y-4 pb-6 border-b border-slate-200/80">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              {currentChapterTitle ? (
                <span className="inline-flex items-center gap-1.5 font-bold text-emerald-800">
                  <Layers className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{currentChapterTitle}</span>
                </span>
              ) : (
                <span />
              )}

              {totalLessons > 0 && (
                <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg tabular-nums">
                  درس {lessonNumber} از {totalLessons}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-black text-slate-950 tracking-tight leading-tight text-balance">
              {lesson.title}
            </h1>

            {/* Reading Metadata & Tools Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 tabular-nums">
                <Link
                  href={`/docs/${courseSlug}`}
                  className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-bold transition-colors"
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                  <span>نمای کلی دوره</span>
                </Link>

                {lesson.readingTimeMinutes > 0 && (
                  <>
                    <span className="text-slate-300">·</span>
                    <span className="inline-flex items-center gap-1 font-medium">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      <span>زمان مطالعه: {lesson.readingTimeMinutes} دقیقه</span>
                    </span>
                  </>
                )}
              </div>

              <CopyLessonLinkButton />
            </div>

            {/* Inline Table of Contents for Mobile/Tablet/Laptop (< xl) */}
            <LessonTableOfContents headings={headings} variant="inline" />
          </header>

          {/* Main 13 Content Blocks */}
          <section className="prose prose-slate max-w-none">
            <ContentBlocksRenderer
              blocks={lesson.contentBlocks}
              schemaVersion={lesson.contentSchemaVersion}
            />
          </section>

          {/* Sequential Prev / Next Lesson Navigation */}
          <footer className="pt-8 mt-10 border-t border-slate-200 flex flex-col sm:flex-row items-stretch justify-between gap-4">
            {prevLesson ? (
              <Link
                href={`/docs/${courseSlug}/${prevLesson.slug}`}
                className="group flex-1 flex items-center gap-3 p-4 rounded-2xl border border-slate-200 bg-white hover:border-emerald-400 hover:bg-emerald-50/40 transition-all text-right"
              >
                <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-emerald-700 transition-colors shrink-0" />
                <div className="space-y-0.5 min-w-0">
                  <span className="text-[11px] font-bold text-slate-400 block">
                    درس قبلی
                  </span>
                  <span className="text-sm font-bold text-slate-900 group-hover:text-emerald-900 transition-colors truncate block">
                    {prevLesson.title}
                  </span>
                </div>
              </Link>
            ) : (
              <Link
                href={`/docs/${courseSlug}`}
                className="flex-1 flex items-center gap-3 p-4 rounded-2xl border border-slate-200/80 bg-slate-50/80 hover:bg-slate-100/70 transition-colors text-right"
              >
                <ArrowRight className="h-4 w-4 text-slate-400 shrink-0" />
                <div className="space-y-0.5 min-w-0">
                  <span className="text-[11px] font-semibold text-slate-400 block">
                    شروع دوره
                  </span>
                  <span className="text-xs font-bold text-slate-700 truncate block">
                    بازگشت به صفحه معرفی دوره
                  </span>
                </div>
              </Link>
            )}

            {nextLesson ? (
              <Link
                href={`/docs/${courseSlug}/${nextLesson.slug}`}
                className="group flex-1 flex items-center justify-between gap-3 p-4 rounded-2xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-50 hover:border-emerald-400 transition-all text-right"
              >
                <div className="space-y-0.5 min-w-0">
                  <span className="text-[11px] font-bold text-emerald-700 block">
                    درس بعدی
                  </span>
                  <span className="text-sm font-extrabold text-emerald-950 transition-colors truncate block">
                    {nextLesson.title}
                  </span>
                </div>
                <ArrowLeft className="h-5 w-5 text-emerald-700 group-hover:-translate-x-1 transition-transform shrink-0" />
              </Link>
            ) : (
              <Link
                href={`/docs/${courseSlug}`}
                className="flex-1 flex items-center justify-between gap-3 p-4 rounded-2xl border border-slate-200 bg-slate-50/80 hover:bg-emerald-50/50 hover:border-emerald-300 transition-colors text-right"
              >
                <div className="space-y-0.5 min-w-0">
                  <span className="text-[11px] font-bold text-emerald-700 block">
                    پایان سرفصل‌های دوره
                  </span>
                  <span className="text-xs font-bold text-slate-800 truncate block">
                    مرور سرفصل‌ها و سایر دوره‌ها
                  </span>
                </div>
                <ArrowLeft className="h-4 w-4 text-emerald-700 shrink-0" />
              </Link>
            )}
          </footer>
        </article>
      </div>

      {/* Left Rail (RTL End, xl+): Sticky Dynamic Table of Contents */}
      <LessonTableOfContents headings={headings} variant="rail" />
    </div>
  );
}
