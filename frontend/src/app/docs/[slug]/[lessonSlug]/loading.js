import React from 'react';

export default function Loading() {
  return (
    <div className="flex flex-col lg:flex-row items-start gap-6 xl:gap-8 animate-pulse">
      <div className="hidden lg:block w-72 shrink-0 h-[420px] rounded-2xl border border-slate-200 bg-white p-4 space-y-4">
        <div className="h-5 bg-slate-200 rounded w-3/4" />
        <div className="space-y-2 pt-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-8 bg-slate-100 rounded-xl" />
          ))}
        </div>
      </div>

      <div className="flex-1 w-full max-w-4xl bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 space-y-6">
        <div className="h-4 bg-slate-100 rounded w-48" />
        <div className="h-9 bg-slate-200 rounded-lg w-3/4" />
        <div className="h-4 bg-slate-100 rounded w-1/2" />
        <div className="space-y-3 pt-4">
          <div className="h-4 bg-slate-100 rounded w-full" />
          <div className="h-4 bg-slate-100 rounded w-11/12" />
          <div className="h-4 bg-slate-100 rounded w-4/5" />
        </div>
        <div className="h-48 bg-slate-900/10 rounded-2xl" />
      </div>
    </div>
  );
}
