import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  BookOpen,
  ChevronLeft,
  ListTree,
} from 'lucide-react';
import {
  getPublishedLessonDetail,
  getCourseOutline,
  isNotFoundError,
} from '../../../../lib/server';
import ContentBlocksRenderer from '../../../../components/docs/content/ContentBlocksRenderer';
import CourseSidebar from '../../../../components/docs/CourseSidebar';

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

  // Calculate ordered lesson position, previous and next navigation from outline
  const flatLessons: Array<{ title: string; slug: string }> = [];
  if (outline?.chapters) {
    for (const chapter of outline.chapters) {
      if (chapter.lessons) {
        for (const l of chapter.lessons) {
          flatLessons.push({ title: l.title, slug: l.slug });
        }
      }
    }
  }

  const currentIndex = flatLessons.findIndex((l) => l.slug === lessonSlug);
  const prevLesson = currentIndex > 0 ? flatLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex !== -1 && currentIndex < flatLessons.length - 1
      ? flatLessons[currentIndex + 1]
      : null;
  const lessonNumber = currentIndex !== -1 ? currentIndex + 1 : lesson.order || 1;
  const totalLessons = flatLessons.length;

  // Extract headings for Table of Contents
  const headings = lesson.contentBlocks
    ?.filter((b) => b.type === 'heading' && b.data.level === 2)
    .map((b) => (b.type === 'heading' ? b.data.text : ''));

  // JSON-LD Structured Data
  const jsonLd = {
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

  return (
    <div className="flex flex-col lg:flex-row items-start gap-8">
      {/* 1. Awesome Sidebar for Lesson Navigation */}
      <CourseSidebar
        outline={outline}
        courseSlug={courseSlug}
        courseTitle={outline?.course?.title}
      />

      {/* 2. Main Lesson Article Content */}
      <div className="flex-1 w-full min-w-0 bg-white rounded-2xl border border-gray-200/90 p-6 sm:p-10 shadow-xs">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <article className="space-y-8">
          {/* Breadcrumbs */}
          <nav aria-label="مسیر راهنما" className="flex flex-wrap items-center gap-1.5 text-xs text-gray-500">
            <Link href="/" className="hover:text-emerald-700 transition-colors">
              صفحه اصلی
            </Link>
            <ChevronLeft className="h-3 w-3 text-gray-400" />
            <Link href="/docs" className="hover:text-emerald-700 transition-colors">
              مستندات
            </Link>
            <ChevronLeft className="h-3 w-3 text-gray-400" />
            <Link href={`/docs/${courseSlug}`} className="hover:text-emerald-700 transition-colors">
              {outline?.course?.title || courseSlug}
            </Link>
            <ChevronLeft className="h-3 w-3 text-gray-400" />
            <span className="text-gray-900 font-semibold truncate max-w-xs">{lesson.title}</span>
          </nav>

          {/* Lesson Header */}
          <header className="space-y-4 pb-6 border-b border-gray-100">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-950 tracking-tight leading-tight">
                {lesson.title}
              </h1>

              {totalLessons > 0 && (
                <span className="text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  درس {lessonNumber} از {totalLessons}
                </span>
              )}
            </div>

            {/* Toolbar Metadata (Unboxed text with dots per zero-pill discipline) */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 pt-1">
              <Link
                href={`/docs/${courseSlug}`}
                className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-semibold transition-colors"
              >
                <ArrowRight className="h-3.5 w-3.5" />
                <span>مشاهده معرفی دوره</span>
              </Link>

              {lesson.readingTimeMinutes > 0 && (
                <>
                  <span className="text-gray-300">·</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-gray-400" />
                    <span>زمان مطالعه تخمینی: {lesson.readingTimeMinutes} دقیقه</span>
                  </span>
                </>
              )}

              <span className="text-gray-300">·</span>
              <span className="inline-flex items-center gap-1">
                <BookOpen className="h-3.5 w-3.5 text-emerald-600" />
                <span>نسخه ساختار: {lesson.contentSchemaVersion}</span>
              </span>
            </div>

            {/* Quick Table of Contents */}
            {headings && headings.length > 1 && (
              <div className="mt-4 p-4 rounded-xl bg-gray-50/80 border border-gray-200/80 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                  <ListTree className="h-3.5 w-3.5 text-emerald-600" />
                  <span>فهرست عناوین این درس</span>
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                  {headings.map((h, i) => {
                    const anchorId = h
                      .toLowerCase()
                      .replace(/[^\u0600-\u06FF\w\s-]/g, '')
                      .trim()
                      .replace(/\s+/g, '-');
                    return (
                      <li key={i}>
                        <a
                          href={`#${anchorId}`}
                          className="text-gray-600 hover:text-emerald-700 transition-colors line-clamp-1"
                        >
                          • {h}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </header>

          {/* Main Content: 13 Typed Content Blocks Renderer */}
          <section className="prose prose-gray max-w-none">
            <ContentBlocksRenderer
              blocks={lesson.contentBlocks}
              schemaVersion={lesson.contentSchemaVersion}
            />
          </section>

          {/* Previous / Next Lesson Navigation Footer */}
          <footer className="pt-8 mt-12 border-t border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            {prevLesson ? (
              <Link
                href={`/docs/${courseSlug}/${prevLesson.slug}`}
                className="group flex-1 flex items-center gap-3 p-4 rounded-xl border border-gray-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/30 transition-all text-right shadow-xs"
              >
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-emerald-600 transition-colors shrink-0" />
                <div className="space-y-0.5 min-w-0">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                    درس قبلی
                  </span>
                  <span className="text-sm font-bold text-gray-900 group-hover:text-emerald-800 transition-colors truncate block">
                    {prevLesson.title}
                  </span>
                </div>
              </Link>
            ) : (
              <div className="flex-1 p-4 rounded-xl border border-gray-100 bg-gray-50/50 text-gray-400 text-xs text-right">
                <span>این اولین درس این دوره است.</span>
              </div>
            )}

            {nextLesson ? (
              <Link
                href={`/docs/${courseSlug}/${nextLesson.slug}`}
                className="group flex-1 flex items-center justify-between gap-3 p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 hover:border-emerald-300 transition-all text-left shadow-xs"
              >
                <div className="space-y-0.5 min-w-0 text-right">
                  <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
                    درس بعدی
                  </span>
                  <span className="text-sm font-bold text-emerald-950 group-hover:text-emerald-800 transition-colors truncate block">
                    {nextLesson.title}
                  </span>
                </div>
                <ArrowLeft className="h-5 w-5 text-emerald-600 group-hover:translate-x-[-3px] transition-transform shrink-0" />
              </Link>
            ) : (
              <div className="flex-1 p-4 rounded-xl border border-gray-100 bg-gray-50/50 text-gray-400 text-xs text-left">
                <span>به پایان دوره رسیدید! 🎉</span>
              </div>
            )}
          </footer>
        </article>
      </div>
    </div>
  );
}
