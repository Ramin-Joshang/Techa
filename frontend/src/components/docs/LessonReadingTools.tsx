'use client';

import React, { useState, useEffect } from 'react';
import { Link2, Check, ArrowUp } from 'lucide-react';

export function LessonReadingProgress() {
  const [progress, setProgress] = useState(0);
  const [showBackTop, setShowBackTop] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)) : 0;
      setProgress(pct);
      setShowBackTop(scrollTop > 420);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <div
        aria-hidden="true"
        className="fixed top-16 left-0 right-0 z-40 h-[3px] bg-transparent pointer-events-none"
      >
        <div
          className="h-full bg-emerald-500 transition-[width] duration-75"
          style={{ width: `${progress}%` }}
        />
      </div>

      {showBackTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="بازگشت به بالای صفحه"
          className="fixed bottom-5 left-5 z-40 inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#042A1B] text-[#7AE36A] border border-[#7AE36A]/30 shadow-lg hover:bg-[#053723] text-xs font-bold transition-colors"
        >
          <ArrowUp className="w-4 h-4" />
          <span className="hidden sm:inline">بالای درس</span>
        </button>
      )}
    </>
  );
}

export function CopyLessonLinkButton() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (typeof window !== 'undefined' && navigator?.clipboard) {
      void navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 text-xs font-medium transition-colors"
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-600" />
          <span className="text-emerald-700 font-bold">لینک کپی شد</span>
        </>
      ) : (
        <>
          <Link2 className="w-3.5 h-3.5" />
          <span>کپی پیوند درس</span>
        </>
      )}
    </button>
  );
}
