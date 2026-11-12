import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import VerifyOtpForm from './VerifyOtpForm';
import { Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'تأیید کد اعتبارسنجی پیامکی | تکا ۲.۰',
  description: 'اعتبارسنجی شماره موبایل و ورود امن به پلتفرم تکا',
};

export default function VerifyOtpPage() {
  return (
    <main className="min-h-screen bg-[#02180F] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#7AE36A]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <Suspense
          fallback={
            <div className="bg-[#042A1B]/90 border border-[#7AE36A]/20 rounded-2xl p-12 text-center text-slate-300 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-[#7AE36A] animate-spin mb-4" />
              <p className="text-sm">در حال بارگذاری صفحه اعتبارسنجی...</p>
            </div>
          }
        >
          <VerifyOtpForm />
        </Suspense>
      </div>
    </main>
  );
}
