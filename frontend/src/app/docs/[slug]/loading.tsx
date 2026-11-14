import React from 'react';

export default function CourseDetailLoading() {
  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-pulse">
      <div className="h-4 w-64 rounded bg-slate-200" />

      <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white">
        <div className="bg-[#042A1B] p-6 sm:p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="h-4 w-60 rounded bg-white/15" />
            <div className="h-9 w-3/4 rounded-xl bg-white/20" />
            <div className="h-4 w-full rounded bg-white/10" />
            <div className="h-4 w-5/6 rounded bg-white/10" />
            <div className="flex gap-3 pt-2">
              <div className="h-11 w-44 rounded-xl bg-[#7AE36A]/40" />
              <div className="h-11 w-36 rounded-xl bg-white/10" />
            </div>
          </div>
          <div className="lg:col-span-4 h-48 rounded-2xl bg-white/10" />
        </div>

        <div className="p-6 sm:p-8 lg:p-10 space-y-6">
          <div className="h-32 rounded-2xl bg-slate-100" />
          <div className="space-y-3">
            <div className="h-6 w-48 rounded bg-slate-200" />
            <div className="h-20 rounded-xl bg-slate-100" />
            <div className="h-20 rounded-xl bg-slate-100" />
          </div>
        </div>
      </div>
    </div>
  );
}
