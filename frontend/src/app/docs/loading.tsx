import React from 'react';

export default function DocsCatalogLoading() {
  return (
    <div className="w-full bg-slate-50/70 min-h-screen py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-7 animate-pulse">
        <div className="space-y-3">
          <div className="h-4 w-40 rounded-lg bg-emerald-100" />
          <div className="h-9 w-80 max-w-full rounded-xl bg-slate-200" />
          <div className="h-4 w-[520px] max-w-full rounded-lg bg-slate-200/80" />
        </div>

        <div className="h-20 rounded-2xl bg-white border border-slate-200" />

        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 7 }).map((_, idx) => (
            <div key={idx} className="h-7 w-20 rounded-lg bg-slate-200/70" />
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-slate-200 bg-white overflow-hidden"
            >
              <div className="h-44 bg-slate-200" />
              <div className="p-6 space-y-3">
                <div className="h-4 w-24 rounded bg-slate-200" />
                <div className="h-6 w-3/4 rounded-lg bg-slate-200" />
                <div className="h-4 w-full rounded bg-slate-100" />
                <div className="h-4 w-5/6 rounded bg-slate-100" />
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="h-4 w-24 rounded bg-slate-200" />
                  <div className="h-4 w-16 rounded bg-emerald-100" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
