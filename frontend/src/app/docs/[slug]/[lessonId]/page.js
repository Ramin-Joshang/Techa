import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  BookOpen,
} from 'lucide-react';
import {
  getPublishedLessonDetail,
  getCourseOutline,
  isNotFoundError,
} from '../../../../lib/server';
import ContentBlocksRenderer from '../../../../components/docs/content/ContentBlocksRenderer';

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const courseSlug = resolvedParams?.courseSlug || resolvedParams?.slug || '';
  const lessonSlug = resolvedParams?.lessonSlug || resolvedParams?.lessonId || '';

  if (!courseSlug || !lessonSlug) return { title: 'مستندات تکا' };

  try {
    const lesson = await getPublishedLessonDetail(courseSlug, lessonSlug);
    return {
      title: lesson.seo?.metaTitle || `${lesson.title} | دوره ${courseSlug} | تکا`,
      description: lesson.seo?.metaDescription || `درس ${lesson.title} از مستندات جامع تکا`,
      keywords: lesson.seo?.metaKeywords,
      robots: lesson.seo?.robotsNoIndex ? 'noindex, nofollow' : 'index, follow',
    };
  } catch (err) {
    if (isNotFoundError(err)) {
      return { title: 'درس یافت نشد | تکا' };
    }
    return { title: 'مستندات آموزشی | تکا' };
  }
}

export default async function LessonPage({ params }) {
  const resolvedParams = await params;
  const courseSlug = resolvedParams?.courseSlug || resolvedParams?.slug || '';
  const lessonSlug = resolvedParams?.lessonSlug || resolvedParams?.lessonId || '';

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
  } catch (err) {
    if (isNotFoundError(err)) {
      notFound();
    }
    // Network or server error - throw to trigger error boundary
    throw err;
  }

  // Calculate ordered lesson position, previous and next navigation from outline
  const flatLessons = [];
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

  return (
    <div className="relative w-full max-w-full">
      {/* Lesson Header */}
      <div className="pb-6 border-b border-gray-200 space-y-5">
        {/* Title + Index Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h1 className="font-black text-2xl md:text-3xl leading-snug text-[#042A1B]">
            {lesson.title}
          </h1>
          {totalLessons > 0 && (
            <span className="px-3.5 py-1.5 rounded-xl w-fit bg-gray-100 text-gray-700 text-sm font-bold whitespace-nowrap border border-gray-200">
              جلسه {lessonNumber} از {totalLessons}
            </span>
          )}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={`/docs/${courseSlug}`}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl border bg-white text-gray-700 border-gray-300 hover:bg-gray-50 transition text-sm font-medium shadow-sm"
            >
              <ArrowRight className="w-4 h-4" />
              بازگشت به معرفی دوره
            </Link>
            {lesson.readingTimeMinutes > 0 && (
              <div className="flex items-center gap-2 bg-emerald-50 px-3.5 py-2 rounded-xl text-sm border border-emerald-100">
                <Clock className="w-4 h-4 text-emerald-700" />
                <span className="text-emerald-700 font-medium">مدت مطالعه:</span>
                <span className="font-bold text-emerald-900 font-mono" dir="ltr">
                  {lesson.readingTimeMinutes} min
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500 font-medium bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
            <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
            <span>نسخه محتوا: {lesson.contentSchemaVersion}</span>
          </div>
        </div>
      </div>

      {/* Main Lesson Content Body (13 Content Blocks Renderer) */}
      <div className="w-full pb-8 border-b-2 border-emerald-500 mt-8">
        <div className="lesson-content w-full max-w-none">
          <ContentBlocksRenderer
            blocks={lesson.contentBlocks}
            schemaVersion={lesson.contentSchemaVersion}
          />
        </div>
      </div>

      {/* Previous / Next Lesson Navigation Buttons */}
      <div className="flex justify-between items-center mt-8 pb-10">
        {prevLesson ? (
          <Link
            href={`/docs/${courseSlug}/${prevLesson.slug}`}
            className="flex items-center gap-2 px-5 py-3 bg-[#042A1B] text-white rounded-xl hover:bg-emerald-900 transition-colors shadow-md"
          >
            <ArrowRight className="w-5 h-5" />
            <div className="text-right">
              <span className="text-xs text-gray-300 block">درس قبلی</span>
              <span className="text-sm font-bold truncate max-w-xs block">{prevLesson.title}</span>
            </div>
          </Link>
        ) : (
          <div className="flex items-center gap-2 px-4 py-3 bg-gray-100 text-gray-400 rounded-xl cursor-not-allowed opacity-50">
            <ArrowRight className="w-5 h-5" />
            <span className="text-sm font-medium">ابتدای دوره</span>
          </div>
        )}

        {nextLesson ? (
          <Link
            href={`/docs/${courseSlug}/${nextLesson.slug}`}
            className="flex items-center gap-2 px-5 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors shadow-md"
          >
            <div className="text-left">
              <span className="text-xs text-emerald-100 block">درس بعدی</span>
              <span className="text-sm font-bold truncate max-w-xs block">{nextLesson.title}</span>
            </div>
            <ArrowLeft className="w-5 h-5" />
          </Link>
        ) : (
          <div className="flex items-center gap-2 px-4 py-3 bg-gray-100 text-gray-400 rounded-xl cursor-not-allowed opacity-50">
            <span className="text-sm font-medium">پایان دوره</span>
            <ArrowLeft className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
}