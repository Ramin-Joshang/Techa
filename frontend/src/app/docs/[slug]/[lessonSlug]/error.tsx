'use client';

import React from 'react';
import Link from 'next/link';
import { AlertCircle, RefreshCw, BookOpen } from 'lucide-react';

export default function LessonError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="max-w-2xl mx-auto py-14 px-6 bg-white rounded-2xl border border-red-200 text-center space-y-4">
      <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto border border-red-100">
        <AlertCircle className="w-7 h-7" />
      </div>
      <div className="space-y-1.5">
        <h2 className="text-lg font-extrabold text-slate-950">
          خطا در بارگذاری محتوای درس
        </h2>
        <p className="text-slate-600 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
          {error?.message ||
            'امکان دریافت محتوای این درس در حال حاضر وجود ندارد. لطفاً دوباره تلاش کنید.'}
        </p>
      </div>
      <div className="flex flex-wrap gap-3 justify-center pt-2">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-xs sm:text-sm hover:bg-emerald-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>تلاش دوباره</span>
        </button>
        <Link
          href="/docs"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-semibold text-xs sm:text-sm hover:bg-slate-200 transition-colors"
        >
          <BookOpen className="w-4 h-4" />
          <span>فهرست مستندات</span>
        </Link>
      </div>
    </div>
  );
}
