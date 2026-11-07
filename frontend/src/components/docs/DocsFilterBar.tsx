'use client';

import React, { useTransition } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { FiSearch, FiFilter } from 'react-icons/fi';

const CATEGORIES = [
  { id: 'all', title: 'همه سطوح' },
  { id: 'beginner', title: 'مبتدی' },
  { id: 'intermediate', title: 'متوسط' },
  { id: 'advanced', title: 'پیشرفته' },
];

interface DocsFilterBarProps {
  currentLevel?: string;
  currentSearch?: string;
}

export default function DocsFilterBar({ currentLevel = 'all', currentSearch = '' }: DocsFilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [searchTerm, setSearchTerm] = React.useState(currentSearch);

  // Sync internal search input with url param
  React.useEffect(() => {
    setSearchTerm(currentSearch);
  }, [currentSearch]);

  const updateQueryParams = (newParams: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams ? searchParams.toString() : '');

    for (const [key, value] of Object.entries(newParams)) {
      if (value === undefined || value === '' || value === 'all') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }

    // Reset to page 1 whenever filters change
    if ('level' in newParams || 'q' in newParams) {
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

  const handleCategoryClick = (categoryId: string) => {
    updateQueryParams({ level: categoryId === 'all' ? undefined : categoryId });
  };

  const activeCat = currentLevel.toLowerCase();

  return (
    <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-gray-50 p-4 rounded-2xl border border-gray-100">
      {/* Search Input Form */}
      <form onSubmit={handleSearchSubmit} className="relative w-full lg:w-1/2">
        <FiSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
        <input
          type="text"
          placeholder="جستجوی عنوان دوره یا موضوع..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white pr-12 pl-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all text-sm shadow-sm"
        />
      </form>

      {/* Categories (Pills) */}
      <div className="w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
        <div className="flex items-center gap-2 min-w-max">
          <FiFilter className="text-gray-400 mr-2 ml-1" />
          {CATEGORIES.map((cat) => {
            const isSelected = (activeCat === '' && cat.id === 'all') || activeCat === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryClick(cat.id)}
                disabled={isPending}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  isSelected
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                } ${isPending ? 'opacity-70 cursor-wait' : ''}`}
              >
                {cat.title}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
