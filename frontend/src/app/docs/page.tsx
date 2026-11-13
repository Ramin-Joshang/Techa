import React, { Suspense } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Search,
  RotateCcw,
  FileText,
  WifiOff,
  ServerCrash,
  ArrowLeft,
} from 'lucide-react';
import {
  getPublishedCourses,
  searchPublicContent,
  isServiceUnavailable,
  isNetworkError,
  type PublicCoursesPage,
} from '../../lib/server';
import DocCard from '../../components/docs/DocCard';
import DocsFilterBar from '../../components/docs/DocsFilterBar';
import DocsRetryButton from '../../components/docs/DocsRetryButton';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'کاتالوگ دوره‌ها و مستندات آموزشی | TECHA',
  description:
    'مجموعه مستندات استاندارد، دوره‌های آموزشی مهندسی وب و درس‌های تعاملی تکا با امکان جستجو و فیلتر تخصصی.',
  alternates: {
    canonical: '/docs',
  },
};

interface DocsPageProps {
  searchParams: Promise<{
    page?: string;
    level?: string;
    tag?: string;
    q?: string;
    sort?: string;
  }>;
}

export default async function DocsPage({ searchParams }: DocsPageProps) {
  const resolvedSearchParams = await searchParams;

  const pageParam = parseInt(resolvedSearchParams?.page || '1', 10);
  const page = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

  const rawLevel = resolvedSearchParams?.level?.toLowerCase();
  const validLevel = ['beginner', 'intermediate', 'advanced'].includes(rawLevel || '')
    ? rawLevel
    : undefined;

  const rawSort = resolvedSearchParams?.sort;
  const validSort: 'order' | 'title' | 'recentlyUpdated' =
    rawSort === 'title' || rawSort === 'recentlyUpdated' ? rawSort : 'order';

  const tag = resolvedSearchParams?.tag ? resolvedSearchParams.tag.trim() : undefined;
  const searchQuery = resolvedSearchParams?.q ? resolvedSearchParams.q.trim() : undefined;

  let coursesResult: PublicCoursesPage;
  let lessonMatches: Array<{
    id: string;
    title: string;
    summary: string;
    courseSlug: string;
    lessonSlug: string;
  }> = [];
  let fetchErrorKind: 'network' | 'database' | 'server' | null = null;
  let fetchErrorMessage: string | null = null;

  try {
    const [coursesRes, searchRes] = await Promise.all([
      getPublishedCourses({
        page,
        limit: 12,
        level: validLevel,
        tag,
        q: searchQuery,
        sort: validSort,
        noStore: true,
      }),
      searchQuery && searchQuery.length >= 2
        ? searchPublicContent({ q: searchQuery, type: 'lessons', limit: 6 }).catch(() => null)
        : Promise.resolve(null),
    ]);

    coursesResult = coursesRes;
    if (searchRes?.results) {
      lessonMatches = searchRes.results
        .filter((r) => r.type === 'lesson' && r.courseSlug && r.lessonSlug)
        .map((r) => ({
          id: r.id,
          title: r.title,
          summary: r.summary,
          courseSlug: r.courseSlug,
          lessonSlug: r.lessonSlug as string,
        }));
    }
  } catch (err: unknown) {
    if (isNetworkError(err)) {
      fetchErrorKind = 'network';
      fetchErrorMessage = 'امکان برقراری ارتباط با سرویس‌دهنده مستندات وجود ندارد.';
    } else if (isServiceUnavailable(err)) {
      fetchErrorKind = 'database';
      fetchErrorMessage = 'سرویس پایگاه داده یا API موقتاً در دسترس نیست.';
    } else {
      fetchErrorKind = 'server';
      fetchErrorMessage =
        err instanceof Error ? err.message : 'خطای غیرمنتظره در بارگذاری فهرست مستندات';
    }

    coursesResult = {
      courses: [],
      total: 0,
      page: 1,
      limit: 12,
      totalPages: 1,
    };
  }

  const { courses, total, totalPages } = coursesResult;

  // Collect real tags present on returned courses for quick discovery
  const availableTags = Array.from(
    new Set(courses.flatMap((c) => c.tags || []))
  ).slice(0, 8);

  const createPageUrl = (targetPage: number) => {
    const params = new URLSearchParams();
    if (targetPage > 1) params.set('page', targetPage.toString());
    if (validLevel) params.set('level', validLevel);
    if (tag) params.set('tag', tag);
    if (searchQuery) params.set('q', searchQuery);
    if (validSort !== 'order') params.set('sort', validSort);
    const qs = params.toString();
    return qs ? `/docs?${qs}` : '/docs';
  };

  const createTagUrl = (targetTag: string) => {
    const params = new URLSearchParams();
    if (validLevel) params.set('level', validLevel);
    if (searchQuery) params.set('q', searchQuery);
    if (validSort !== 'order') params.set('sort', validSort);
    if (tag !== targetTag) params.set('tag', targetTag);
    const qs = params.toString();
    return qs ? `/docs?${qs}` : '/docs';
  };

  const hasActiveFilters = Boolean(validLevel || tag || searchQuery || validSort !== 'order');

  return (
    <div className="w-full bg-slate-50/70 min-h-screen py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-7">
        {/* Catalog Header */}
        <header className="space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-800">
            <BookOpen className="h-4 w-4 text-emerald-600" />
            <span>کتابخانه مستندات و دوره‌های تکا</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-950 tracking-tight text-balance">
            مستندات و دوره‌های تخصصی مهندسی وب
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
            فهرست کامل دوره‌ها و سرفصل‌های منتشرشده؛ هر دوره شامل فصل‌های ساختاریافته، درس‌های متنی و مثال‌های تعاملی است.
          </p>
        </header>

        {/* Filter & Search Bar */}
        <Suspense fallback={<div className="h-16 rounded-2xl bg-white border border-slate-200" />}>
          <DocsFilterBar
            currentLevel={validLevel || 'all'}
            currentSearch={searchQuery || ''}
            currentSort={validSort}
            currentTag={tag || ''}
          />
        </Suspense>

        {/* Real Topic Tags Discovery Strip */}
        {!fetchErrorKind && availableTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">موضوعات موجود:</span>
            {availableTags.map((t) => {
              const active = tag === t;
              return (
                <Link
                  key={t}
                  href={createTagUrl(t)}
                  className={`px-2.5 py-1 rounded-lg font-mono text-[11px] border transition-colors ${
                    active
                      ? 'bg-emerald-700 text-white border-emerald-700 font-bold'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-400 hover:text-emerald-800'
                  }`}
                  dir="ltr"
                >
                  #{t}
                </Link>
              );
            })}
          </div>
        )}

        {/* Active Count & Reset Bar */}
        {!fetchErrorKind && (
          <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 border-b border-slate-200/80 pb-3 gap-2">
            <span className="tabular-nums">
              نمایش <strong className="text-slate-900 font-bold">{courses.length}</strong> از{' '}
              <strong className="text-slate-900 font-bold">{total}</strong> دوره منتشر شده
            </span>

            {hasActiveFilters && (
              <Link
                href="/docs"
                className="inline-flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 font-bold"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>پاک‌سازی تمام فیلترها</span>
              </Link>
            )}
          </div>
        )}

        {/* Matching Lessons Highlight when Searching */}
        {!fetchErrorKind && searchQuery && lessonMatches.length > 0 && (
          <section
            aria-label="درس‌های مرتبط با جستجو"
            className="rounded-2xl border border-emerald-200/80 bg-white p-5 space-y-3"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>درس‌های منطبق با «{searchQuery}»</span>
              </h2>
              <span className="text-xs text-slate-500 tabular-nums">
                {lessonMatches.length} نتیجه
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {lessonMatches.map((lesson) => (
                <Link
                  key={lesson.id}
                  href={`/docs/${lesson.courseSlug}/${lesson.lessonSlug}`}
                  className="group p-3.5 rounded-xl border border-slate-200/80 hover:border-emerald-400 hover:bg-emerald-50/40 transition-colors flex items-start justify-between gap-2"
                >
                  <div className="min-w-0 space-y-1">
                    <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-800 truncate">
                      {lesson.title}
                    </p>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{lesson.summary}</p>
                  </div>
                  <ArrowLeft className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-700 shrink-0 mt-0.5" />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Main Grid / Distinguishable API/Network Error / Empty State */}
        {fetchErrorKind ? (
          <div className="rounded-2xl border border-amber-200 bg-white p-8 sm:p-12 text-center space-y-4 max-w-2xl mx-auto">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-200 mx-auto">
              {fetchErrorKind === 'network' ? (
                <WifiOff className="h-6 w-6" />
              ) : fetchErrorKind === 'database' ? (
                <ServerCrash className="h-6 w-6" />
              ) : (
                <AlertCircle className="h-6 w-6" />
              )}
            </div>
            <div className="space-y-1.5">
              <h2 className="text-base sm:text-lg font-extrabold text-slate-950">
                {fetchErrorKind === 'network'
                  ? 'ارتباط با سرور مستندات برقرار نشد'
                  : fetchErrorKind === 'database'
                    ? 'سرویس پایگاه داده موقتاً در دسترس نیست'
                    : 'خطا در دریافت فهرست مستندات'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                {fetchErrorMessage}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <DocsRetryButton />
              <Link
                href="/"
                className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-semibold transition-colors"
              >
                بازگشت به صفحه اصلی
              </Link>
            </div>
          </div>
        ) : courses.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400 mx-auto">
              <Search className="h-6 w-6" />
            </div>
            <h2 className="text-base font-extrabold text-slate-900">
              {hasActiveFilters
                ? 'دوره‌ای با فیلترهای انتخاب‌شده یافت نشد'
                : 'هنوز دوره‌ای منتشر نشده است'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              {hasActiveFilters
                ? 'عبارت جستجو، سطح یا برچسب انتخابی را تغییر دهید تا دوره‌های دیگر نمایش داده شوند.'
                : 'در حال حاضر هیچ دوره‌ای در وضعیت منتشر شده در پایگاه داده ثبت نشده است.'}
            </p>
            {hasActiveFilters && (
              <div className="pt-2">
                <Link
                  href="/docs"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-200 hover:bg-emerald-100 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>نمایش تمام دوره‌ها</span>
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <DocCard key={course.id} course={course} />
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {!fetchErrorKind && totalPages > 1 && (
          <nav aria-label="صفحه‌بندی کاتالوگ" className="flex items-center justify-center gap-2 pt-6">
            {page > 1 ? (
              <Link
                href={createPageUrl(page - 1)}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:border-emerald-400 hover:text-emerald-800 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
                <span>صفحه قبل</span>
              </Link>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-xl border border-slate-200/70 bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-400 cursor-not-allowed">
                <ChevronRight className="h-4 w-4" />
                <span>صفحه قبل</span>
              </span>
            )}

            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 px-3 tabular-nums">
              <span>صفحه</span>
              <strong className="text-slate-950 font-bold">{page}</strong>
              <span>از</span>
              <strong className="text-slate-950 font-bold">{totalPages}</strong>
            </div>

            {page < totalPages ? (
              <Link
                href={createPageUrl(page + 1)}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:border-emerald-400 hover:text-emerald-800 transition-colors"
              >
                <span>صفحه بعد</span>
                <ChevronLeft className="h-4 w-4" />
              </Link>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-xl border border-slate-200/70 bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-400 cursor-not-allowed">
                <span>صفحه بعد</span>
                <ChevronLeft className="h-4 w-4" />
              </span>
            )}
          </nav>
        )}
      </div>
    </div>
  );
}
