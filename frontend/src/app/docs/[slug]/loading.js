import React from 'react';

export default function Loading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Title & Badge */}
      <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
        <div className="h-5 bg-emerald-100 rounded-full w-24 mb-4" />
        <div className="h-9 bg-gray-200 rounded-xl w-2/3 mb-4" />
        <div className="h-4 bg-gray-100 rounded w-full mb-2" />
        <div className="h-4 bg-gray-100 rounded w-4/5" />
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 h-20" />
        ))}
      </div>

      {/* Chapters Skeleton */}
      <div className="bg-white rounded-3xl border border-gray-100 p-8">
        <div className="h-6 bg-gray-200 rounded-lg w-40 mb-6" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-50 rounded-2xl border border-gray-100" />
          ))}
        </div>
      </div>
    </div>
  );
}
