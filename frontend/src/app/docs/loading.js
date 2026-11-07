import React from 'react';
import DocsSkeleton from '../../components/common/DocsSkeleton';

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-20">
      <div className="container mx-auto px-5 xl:px-20">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-10 animate-pulse">
          <div className="h-8 bg-gray-200 rounded-lg w-48 mb-3" />
          <div className="h-4 bg-gray-200 rounded w-80" />
        </div>
        <DocsSkeleton />
      </div>
    </div>
  );
}
