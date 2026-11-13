import React from 'react';

export default function DocsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full animate-pulse">
      {[1, 2, 3, 4, 5, 6].map((idx) => (
        <div
          key={idx}
          className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col justify-between h-[280px]"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50" />
                <div className="h-4 w-20 bg-slate-200 rounded" />
              </div>
              <div className="h-4 w-24 bg-slate-100 rounded" />
            </div>
            <div className="h-6 bg-slate-200 rounded-lg w-4/5" />
            <div className="space-y-2">
              <div className="h-3.5 bg-slate-100 rounded w-full" />
              <div className="h-3.5 bg-slate-100 rounded w-5/6" />
              <div className="h-3.5 bg-slate-100 rounded w-2/3" />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="h-4 w-24 bg-slate-100 rounded" />
            <div className="h-4 w-24 bg-emerald-100 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
