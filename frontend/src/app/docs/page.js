import React from 'react';
import Link from 'next/link';
import { FiFrown, FiChevronRight, FiChevronLeft } from 'react-icons/fi';
import { AlertCircle } from 'lucide-react';
import { getPublishedCourses } from '../../lib/server';
import DocCard from '../../components/docs/DocCard';
import DocsFilterBar from '../../components/docs/DocsFilterBar';

export const metadata = {
  title: 'مستندات آموزشی | پلتفرم تکا',
  description: 'در میان مستندات جامع تکا جستجو کنید و مهارت‌های برنامه‌نویسی وب خود را ارتقا دهید.',
};

export default async function DocsPage({ searchParams }) {
  // Normalize and validate incoming query parameters
  const pageParam = parseInt(searchParams?.page || '1', 10);
  const page = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

  const rawLevel = searchParams?.level?.toLowerCase();
  const validLevel = ['beginner', 'intermediate', 'advanced'].includes(rawLevel || '')
    ? rawLevel
    : undefined;

  const tag = searchParams?.tag ? searchParams.tag.trim() : undefined;
  const searchQuery = searchParams?.q ? searchParams.q.trim().toLowerCase() : '';

  let coursesResult;
  let fetchError = null;

  try {
    coursesResult = await getPublishedCourses({
      page,
      limit: 12,
      level: validLevel,
      tag,
    });
  } catch (err) {
    fetchError = err instanceof Error ? err.message : 'خطا در برقراری ارتباط با سرویس‌دهنده مستندات';
    coursesResult = {
      courses: [],
      total: 0,
      page: 1,
      limit: 12,
      totalPages: 1,
    };
  }

  // Filter by client search query if provided
  let displayedCourses = coursesResult.courses;
  if (searchQuery && displayedCourses.length > 0) {
    displayedCourses = displayedCourses.filter(
      (c) =>
        c.title?.toLowerCase().includes(searchQuery) ||
        c.summary?.toLowerCase().includes(searchQuery)
    );
  }

  // Build pagination URLs helper
  const createPageUrl = (targetPage) => {
    const params = new URLSearchParams();
    if (targetPage > 1) params.set('page', String(targetPage));
    if (validLevel) params.set('level', validLevel);
    if (tag) params.set('tag', tag);
    if (searchQuery) params.set('q', searchQuery);
    const qs = params.toString();
    return qs ? `/docs?${qs}` : '/docs';
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-20">
      {/* Header & Control Panel */}
      <div className="bg-white shadow-sm border-b border-gray-100 mb-10 pb-8 pt-8">
        <div className="container mx-auto px-5 xl:px-20">
          {/* Title Section */}
          <div className="text-center md:text-start mb-8">
            <h1 className="font-extrabold text-3xl md:text-4xl text-[#042A1B]">
              مستندات <span className="text-emerald-600">آموزشی</span>
            </h1>
            <p className="text-gray-500 mt-3 text-sm md:text-base">
              در میان مستندات جستجو کنید و مهارت‌های خود را ارتقا دهید.
            </p>
          </div>

          {/* Filters & Search Bar (Client Boundary Component) */}
          <DocsFilterBar currentLevel={validLevel || 'all'} currentSearch={searchQuery} />
        </div>
      </div>

      {/* Docs Grid Section */}
      <div className="container mx-auto px-5 xl:px-20">
        {/* 1) Error State */}
        {fetchError && (
          <div className="flex flex-col items-center justify-center py-20 text-red-500 bg-red-50 rounded-2xl border border-red-200">
            <AlertCircle size={48} className="mb-4" />
            <h3 className="text-xl font-bold">خطا در دریافت اطلاعات</h3>
            <p className="mt-2 text-gray-600">{fetchError}</p>
            <Link
              href="/docs"
              className="mt-6 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              تلاش مجدد
            </Link>
          </div>
        )}

        {/* 2) Success State */}
        {!fetchError && displayedCourses.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {displayedCourses.map((doc, index) => (
                <div key={doc.id || doc.slug || index} className="h-full">
                  <DocCard doc={doc} />
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {coursesResult.totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-12">
                {coursesResult.page > 1 ? (
                  <Link
                    href={createPageUrl(coursesResult.page - 1)}
                    className="flex items-center gap-1 px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition text-sm font-medium shadow-sm"
                  >
                    <FiChevronRight className="w-4 h-4" />
                    صفحه قبلی
                  </Link>
                ) : (
                  <span className="flex items-center gap-1 px-4 py-2 bg-gray-100 text-gray-400 rounded-xl text-sm font-medium opacity-50 cursor-not-allowed">
                    <FiChevronRight className="w-4 h-4" />
                    صفحه قبلی
                  </span>
                )}

                <span className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl shadow-sm">
                  صفحه {coursesResult.page} از {coursesResult.totalPages}
                </span>

                {coursesResult.page < coursesResult.totalPages ? (
                  <Link
                    href={createPageUrl(coursesResult.page + 1)}
                    className="flex items-center gap-1 px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition text-sm font-medium shadow-sm"
                  >
                    صفحه بعدی
                    <FiChevronLeft className="w-4 h-4" />
                  </Link>
                ) : (
                  <span className="flex items-center gap-1 px-4 py-2 bg-gray-100 text-gray-400 rounded-xl text-sm font-medium opacity-50 cursor-not-allowed">
                    صفحه بعدی
                    <FiChevronLeft className="w-4 h-4" />
                  </span>
                )}
              </div>
            )}
          </>
        )}

        {/* 3) Empty State */}
        {!fetchError && displayedCourses.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mb-4">
              <FiFrown className="text-4xl text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">هیچ مستندی پیدا نشد!</h3>
            <p className="text-gray-500 max-w-md">
              با عبارت جستجو شده یا فیلترهای انتخابی شما نتیجه‌ای یافت نشد. لطفاً فیلترها را تغییر دهید.
            </p>
            <Link
              href="/docs"
              className="mt-6 px-6 py-2 bg-emerald-100 text-emerald-700 rounded-full font-medium hover:bg-emerald-200 transition-colors"
            >
              حذف همه فیلترها
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
