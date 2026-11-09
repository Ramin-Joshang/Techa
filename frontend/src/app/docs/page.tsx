import React from 'react';
import Link from 'next/link';
import { BookOpen, AlertCircle, ChevronLeft, ChevronRight, Search, RotateCcw } from 'lucide-react';
import { getPublishedCourses } from '../../lib/server';
import DocCard from '../../components/docs/DocCard';
import DocsFilterBar from '../../components/docs/DocsFilterBar';

export const metadata = {
  title: 'کاتالوگ دوره‌ها و مستندات آموزشی | TECHA',
  description: 'در میان مستندات استاندارد و دوره‌های تخصصی برنامه‌نویسی تکا جستجو کنید.',
};

interface DocsPageProps {
  searchParams: Promise<{
    page?: string;
    level?: string;
    tag?: string;
    q?: string;
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

  const tag = resolvedSearchParams?.tag ? resolvedSearchParams.tag.trim() : undefined;
  const searchQuery = resolvedSearchParams?.q ? resolvedSearchParams.q.trim() : undefined;

  let coursesResult;
  let fetchError: string | null = null;

  try {
    coursesResult = await getPublishedCourses({
      page,
      limit: 12,
      level: validLevel,
      tag,
      q: searchQuery,
    });
  } catch (err: unknown) {
    fetchError = err instanceof Error ? err.message : 'خطا در برقراری ارتباط با سرویس‌دهنده مستندات';
    coursesResult = {
      courses: [],
      total: 0,
      page: 1,
      limit: 12,
      totalPages: 1,
    };
  }

  const { courses, total, totalPages } = coursesResult;

  const createPageUrl = (targetPage: number) => {
    const params = new URLSearchParams();
    if (targetPage > 1) params.set('page', targetPage.toString());
    if (validLevel) params.set('level', validLevel);
    if (tag) params.set('tag', tag);
    if (searchQuery) params.set('q', searchQuery);
    const qs = params.toString();
    return qs ? `/docs?${qs}` : '/docs';
  };

  return (
    <div className="w-full bg-gray-50/50 min-h-screen py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Section */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            <BookOpen className="h-3.5 w-3.5" />
            <span>کاتالوگ آموزش‌ها</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-950 tracking-tight">
            مستندات و دوره‌های تخصصی برنامه‌نویسی
          </h1>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl leading-relaxed">
            مجموعه سرفصل‌ها و درس‌های ساختاریافته تکا؛ مناسب برای شروع یادگیری یا ارتقای مهارت‌های مهندسی وب.
          </p>
        </div>

        {/* Filter Bar */}
        <DocsFilterBar currentLevel={validLevel || 'all'} currentSearch={searchQuery || ''} />

        {/* Error Alert */}
        {fetchError && (
          <div className="rounded-2xl border border-red-200 bg-red-50/80 p-5 flex items-start gap-3 text-red-800">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <div className="space-y-1 text-sm">
              <p className="font-bold">خطا در بارگذاری دوره‌ها</p>
              <p className="text-red-700 text-xs">{fetchError}</p>
            </div>
          </div>
        )}

        {/* Results Count & Active Filters Indicator */}
        <div className="flex flex-wrap items-center justify-between text-xs text-gray-500 border-b border-gray-200/80 pb-3 gap-2">
          <span>
            نمایش <strong className="text-gray-900 font-semibold">{courses.length}</strong> از{' '}
            <strong className="text-gray-900 font-semibold">{total}</strong> دوره منتشر شده
          </span>

          {(validLevel || tag || searchQuery) && (
            <Link
              href="/docs"
              className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-semibold"
            >
              <RotateCcw className="h-3 w-3" />
              <span>پاک‌سازی تمام فیلترها</span>
            </Link>
          )}
        </div>

        {/* Courses Grid */}
        {courses.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-400 mx-auto">
              <Search className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900">دوره‌ای با این مشخصات یافت نشد</h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              لطفاً فیلترها یا عبارت جستجوی خود را تغییر دهید تا سرفصل‌های دیگر پلتفرم را مشاهده کنید.
            </p>
            <div className="pt-2">
              <Link
                href="/docs"
                className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors"
              >
                نمایش تمام دوره‌ها
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <DocCard key={course.id} course={course} />
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <nav aria-label="ناوبری صفحات" className="flex items-center justify-center gap-2 pt-8">
            {page > 1 ? (
              <Link
                href={createPageUrl(page - 1)}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
                <span>صفحه قبل</span>
              </Link>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-lg border border-gray-100 bg-gray-50 px-3.5 py-2 text-xs font-semibold text-gray-300 cursor-not-allowed">
                <ChevronRight className="h-4 w-4" />
                <span>صفحه قبل</span>
              </span>
            )}

            <div className="flex items-center gap-1 text-xs font-medium text-gray-600 px-3">
              <span>صفحه</span>
              <strong className="text-gray-900 font-bold">{page}</strong>
              <span>از</span>
              <strong className="text-gray-900 font-bold">{totalPages}</strong>
            </div>

            {page < totalPages ? (
              <Link
                href={createPageUrl(page + 1)}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <span>صفحه بعد</span>
                <ChevronLeft className="h-4 w-4" />
              </Link>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-lg border border-gray-100 bg-gray-50 px-3.5 py-2 text-xs font-semibold text-gray-300 cursor-not-allowed">
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
