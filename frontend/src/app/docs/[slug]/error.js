'use client';

import React from 'react';
import Link from 'next/link';
import { AlertCircle, RefreshCw, BookOpen } from 'lucide-react';

export default function Error({ error, reset }) {
  return (
    <div className="py-16 px-4 bg-white rounded-3xl border border-red-100 shadow-sm text-center">
      <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-100">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h2 className="text-xl font-black text-gray-900 mb-2">
        خطا در دریافت اطلاعات دوره
      </h2>
      <p className="text-gray-500 text-sm max-w-md mx-auto mb-6 leading-relaxed">
        امکان دریافت محتوای دوره یا درس درخواستی وجود ندارد. این مشکل ممکن است ناشی از قطع ارتباط موقت با سرور باشد.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={() => reset()}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-colors shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          تلاش دوباره
        </button>
        <Link
          href="/docs"
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-200 transition-colors"
        >
          <BookOpen className="w-4 h-4" />
          فهرست مستندات
        </Link>
      </div>
    </div>
  );
}
