import React from 'react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-20">
      <div className="container mx-auto px-5 xl:px-20 animate-pulse">
        {/* Header Skeleton */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-10">
          <div className="h-8 bg-gray-200 rounded-lg w-48 mb-3" />
          <div className="h-4 bg-gray-200 rounded w-80" />
        </div>

        {/* Search bar Skeleton */}
        <div className="h-14 bg-white rounded-2xl border border-gray-100 mb-8" />

        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white rounded-3xl border border-gray-100 p-6 flex flex-col justify-between h-72"
            >
              <div>
                <div className="h-6 bg-gray-200 rounded-md w-3/4 mb-4" />
                <div className="h-4 bg-gray-100 rounded w-full mb-2" />
                <div className="h-4 bg-gray-100 rounded w-5/6" />
              </div>
              <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                <div className="h-4 bg-gray-200 rounded w-20" />
                <div className="h-8 bg-gray-200 rounded-xl w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
