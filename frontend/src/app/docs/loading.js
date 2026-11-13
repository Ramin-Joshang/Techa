import React from 'react';
import DocsSkeleton from '../../components/common/DocsSkeleton';

export default function Loading() {
  return (
    <div className="w-full bg-slate-50/70 min-h-screen py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8 animate-pulse">
        <div className="space-y-3">
          <div className="h-5 w-32 bg-emerald-100 rounded-md" />
          <div className="h-9 w-80 max-w-full bg-slate-200 rounded-lg" />
          <div className="h-4 w-96 max-w-full bg-slate-200/70 rounded" />
        </div>
        <div className="h-16 bg-white rounded-2xl border border-slate-200" />
        <DocsSkeleton />
      </div>
    </div>
  );
}
