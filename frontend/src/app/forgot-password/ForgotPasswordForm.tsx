'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Phone, KeyRound, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { authClient } from '../../lib/auth-client';

function normalizePersianDigits(str: string): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return str
    .split('')
    .map((c) => {
      const pIdx = persianDigits.indexOf(c);
      if (pIdx !== -1) return String(pIdx);
      const aIdx = arabicDigits.indexOf(c);
      if (aIdx !== -1) return String(aIdx);
      return c;
    })
    .join('');
}

export default function ForgotPasswordForm() {
  const router = useRouter();

  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedPhone = normalizePersianDigits(phone.trim());
    if (!trimmedPhone) {
      setErrorMessage('لطفاً شماره موبایل خود را وارد کنید.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authClient.forgotPassword(trimmedPhone);
      // Forward to OTP verification with purpose=password_reset
      const challengeId = res?.challengeId;
      if (challengeId) {
        router.push(
          `/verify-otp?challengeId=${encodeURIComponent(challengeId)}&phone=${encodeURIComponent(trimmedPhone)}&purpose=password_reset`
        );
      } else {
        setErrorMessage('خطایی در صدور درخواست رخ داد. لطفاً مجدداً تلاش نمایید.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'خطا در ثبت درخواست بازیابی رمز عبور';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#042A1B]/90 backdrop-blur-md border border-[#7AE36A]/20 rounded-2xl p-4 sm:p-8 shadow-2xl">
      {/* Brand & Heading */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-block text-2xl font-black text-white tracking-wider mb-2">
          TECH<span className="text-[#7AE36A]">A</span>
        </Link>
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#7AE36A]/10 text-[#7AE36A] mb-3">
          <KeyRound className="w-6 h-6" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">بازیابی رمز عبور</h1>
        <p className="text-sm text-slate-300 leading-relaxed">
          شماره موبایل ثبت‌شده در حساب کاربری خود را وارد کنید تا کد بازیابی برای شما پیامک شود
        </p>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div
          role="alert"
          className="mb-6 p-4 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-sm flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">{errorMessage}</div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div>
          <label htmlFor="forgot-phone" className="block text-xs font-semibold text-slate-300 mb-2 text-right">
            شماره موبایل
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
              <Phone className="w-4 h-4" />
            </div>
            <input
              id="forgot-phone"
              name="phone"
              type="tel"
              dir="ltr"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="09123456789"
              autoComplete="tel"
              disabled={isLoading}
              className="w-full bg-[#02180F] border border-[#7AE36A]/25 rounded-xl py-3 pr-10 pl-4 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-[#7AE36A] focus:ring-1 focus:ring-[#7AE36A] transition-all disabled:opacity-50"
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-1 text-right">
            به دلایل امنیتی، در صورت وجود حساب فعال کد تایید ارسال خواهد شد.
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 px-4 bg-[#7AE36A] hover:bg-[#6bd65b] active:scale-[0.99] text-[#042A1B] font-bold text-sm rounded-xl shadow-lg shadow-[#7AE36A]/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>در حال ارسال درخواست...</span>
            </>
          ) : (
            <span>ارسال کد بازیابی</span>
          )}
        </button>
      </form>

      {/* Switch to Login */}
      <div className="mt-8 pt-6 border-t border-white/10 text-center">
        <Link
          href="/login"
          className="text-xs text-slate-300 hover:text-[#7AE36A] transition-colors inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>بازگشت به صفحه ورود</span>
        </Link>
      </div>
    </div>
  );
}
