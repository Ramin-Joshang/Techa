'use client';

import React, { useTransition } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, X, ArrowUpDown } from 'lucide-react';

const LEVEL_FILTERS = [
  { id: 'all', title: 'همه سطوح' },
  { id: 'beginner', title: 'مقدماتی' },
  { id: 'intermediate', title: 'متوسط' },
  { id: 'advanced', title: 'پیشرفته' },
];

const SORT_OPTIONS = [
  { id: 'order', title: 'ترتیب پیشنهادی' },
  { id: 'title', title: 'مرتب‌سازی الفبایی' },
  { id: 'recentlyUpdated', title: 'جدیدترین به‌روزرسانی' },
];

interface DocsFilterBarProps {
  currentLevel?: string;
  currentSearch?: string;
  currentSort?: string;
  currentTag?: string;
}

export default function DocsFilterBar({
  currentLevel = 'all',
  currentSearch = '',
  currentSort = 'order',
  currentTag = '',
}: DocsFilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [searchTerm, setSearchTerm] = React.useState(currentSearch);

  React.useEffect(() => {
    setSearchTerm(currentSearch);
  }, [currentSearch]);

  const updateQueryParams = (newParams: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams ? searchParams.toString() : '');

    for (const [key, value] of Object.entries(newParams)) {
      if (
        value === undefined ||
        value === '' ||
        value === 'all' ||
        (key === 'sort' && value === 'order')
      ) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }

    if ('level' in newParams || 'q' in newParams || 'tag' in newParams || 'sort' in newParams) {
      params.delete('page');
    }

    startTransition(() => {
      const queryStr = params.toString();
      router.push(queryStr ? `${pathname}?${queryStr}` : pathname);
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateQueryParams({ q: searchTerm.trim() || undefined });
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    if (currentSearch) {
      updateQueryParams({ q: undefined });
    }
  };

  const activeLevel = currentLevel.toLowerCase();

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-4 space-y-3 shadow-xs">
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="جستجوی عنوان دوره، درس یا تکنولوژی (مثل React، TypeScript)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="جستجو در مستندات"
              className="w-full bg-slate-50 pr-10 pl-9 py-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15 transition-all text-sm"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={handleClearSearch}
                aria-label="پاک کردن متن جستجو"
                className="absolute left-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-xs sm:text-sm font-bold transition-colors shrink-0"
          >
            جستجو
          </button>
        </form>

        {/* Level Filter Segmented Tabs */}
        <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5">
          <div
            role="group"
            aria-label="فیلتر سطح دوره"
            className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/70 overflow-x-auto no-scrollbar max-w-full"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 mx-1.5 shrink-0 hidden sm:block" />
            {LEVEL_FILTERS.map((cat) => {
              const isSelected = (activeLevel === '' && cat.id === 'all') || activeLevel === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => updateQueryParams({ level: cat.id === 'all' ? undefined : cat.id })}
                  disabled={isPending}
                  aria-pressed={isSelected}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-white text-emerald-800 shadow-xs border border-slate-200/80 font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  } ${isPending ? 'opacity-70 cursor-wait' : ''}`}
                >
                  {cat.title}
                </button>
              );
            })}
          </div>

          {/* Sort Selector */}
          <div className="relative shrink-0 flex items-center">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 pointer-events-none" />
            <select
              value={currentSort}
              onChange={(e) => updateQueryParams({ sort: e.target.value })}
              disabled={isPending}
              aria-label="مرتب‌سازی دوره‌ها"
              className="bg-slate-50 border border-slate-200 rounded-xl pr-8 pl-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-600"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Active Tag Indicator & Transition Status Bar */}
      {(currentTag || isPending) && (
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
          {currentTag ? (
            <div className="flex items-center gap-2">
              <span className="text-slate-500">برچسب فعال:</span>
              <span
                className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-lg font-mono font-semibold"
                dir="ltr"
              >
                #{currentTag}
                <button
                  type="button"
                  onClick={() => updateQueryParams({ tag: undefined })}
                  aria-label="حذف فیلتر برچسب"
                  className="hover:text-red-600 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            </div>
          ) : (
            <span />
          )}

          {isPending && (
            <span className="inline-flex items-center gap-2 text-emerald-700 font-semibold">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>در حال به‌روزرسانی فهرست دوره‌ها...</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
