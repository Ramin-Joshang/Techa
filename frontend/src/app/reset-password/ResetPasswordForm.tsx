'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, ArrowLeft, KeyRound } from 'lucide-react';
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

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const challengeId = searchParams.get('challengeId') || '';
  const initialCode = searchParams.get('code') || '';

  const [code, setCode] = useState(initialCode);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedCode = normalizePersianDigits(code.trim());
    if (trimmedCode.length !== 6) {
      setErrorMessage('کد اعتبارسنجی باید دقیقاً ۶ رقم باشد.');
      return;
    }

    if (!newPassword) {
      setErrorMessage('لطفاً رمز عبور جدید را وارد کنید.');
      return;
    }

    if (newPassword.length < 12) {
      setErrorMessage('رمز عبور باید حداقل ۱۲ کاراکتر باشد.');
      return;
    }

    const hasLetters = /[a-zA-Z]/.test(newPassword);
    const hasNumbers = /[0-9]/.test(newPassword);
    if (!hasLetters || !hasNumbers) {
      setErrorMessage('رمز عبور باید ترکیبی از حروف انگلیسی و اعداد باشد.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('رمز عبور و تکرار آن یکسان نیستند.');
      return;
    }

    if (!challengeId) {
      setErrorMessage('شناسه درخواست معتبر نیست. لطفاً مجدداً از صفحه فراموشی رمز اقدام کنید.');
      return;
    }

    setIsLoading(true);
    try {
      await authClient.resetPassword({
        challengeId,
        code: trimmedCode,
        newPassword,
        confirmPassword,
      });

      setIsSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'خطا در بازنشانی رمز عبور';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-[#042A1B]/95 backdrop-blur-md border border-[#7AE36A]/30 rounded-2xl p-6 sm:p-8 shadow-2xl text-center">
        <div className="w-16 h-16 bg-[#7AE36A]/10 border border-[#7AE36A]/30 rounded-2xl flex items-center justify-center mx-auto mb-5 text-[#7AE36A]">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <h1 className="text-xl sm:text-2xl font-black text-white mb-3">رمز عبور با موفقیت تغییر کرد</h1>

        <p className="text-slate-300 text-sm leading-relaxed mb-6">
          کلیه نشست‌های فعال قبلی به دلایل امنیتی لغو شدند. در حال انتقال به صفحه ورود...
        </p>

        <Link
          href="/login"
          className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-4 bg-[#7AE36A] hover:bg-[#6bd65b] text-[#042A1B] font-bold text-sm rounded-xl shadow-lg shadow-[#7AE36A]/20 transition-all"
        >
          <span>ورود با رمز عبور جدید</span>
          <ArrowLeft className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#042A1B]/90 backdrop-blur-md border border-[#7AE36A]/20 rounded-2xl p-6 sm:p-8 shadow-2xl">
      {/* Brand & Heading */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-block text-2xl font-black text-white tracking-wider mb-2">
          TECH<span className="text-[#7AE36A]">A</span>
        </Link>
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#7AE36A]/10 text-[#7AE36A] mb-3">
          <KeyRound className="w-6 h-6" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">تعیین رمز عبور جدید</h1>
        <p className="text-sm text-slate-300">
          کد تایید پیامکی و رمز عبور جدید خود را وارد نمایید
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
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* OTP Code */}
        <div>
          <label htmlFor="reset-code" className="block text-xs font-semibold text-slate-300 mb-1.5 text-right">
            کد ۶ رقمی پیامک‌شده <span className="text-[#7AE36A]">*</span>
          </label>
          <input
            id="reset-code"
            name="code"
            type="text"
            dir="ltr"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="123456"
            disabled={isLoading}
            className="w-full bg-[#02180F] border border-[#7AE36A]/25 rounded-xl py-2.5 px-3 text-center text-white text-lg font-mono tracking-widest placeholder-slate-500 focus:outline-none focus:border-[#7AE36A] focus:ring-1 focus:ring-[#7AE36A] transition-all disabled:opacity-50"
          />
        </div>

        {/* New Password */}
        <div>
          <label htmlFor="reset-password" className="block text-xs font-semibold text-slate-300 mb-1.5 text-right">
            رمز عبور جدید <span className="text-[#7AE36A]">*</span> <span className="text-[11px] text-slate-400">(حداقل ۱۲ کاراکتر شامل حروف و اعداد)</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id="reset-password"
              name="newPassword"
              type={showPassword ? 'text' : 'password'}
              dir="ltr"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••••••"
              autoComplete="new-password"
              disabled={isLoading}
              className="w-full bg-[#02180F] border border-[#7AE36A]/25 rounded-xl py-2.5 pr-10 pl-11 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-[#7AE36A] focus:ring-1 focus:ring-[#7AE36A] transition-all disabled:opacity-50 font-mono"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'مخفی کردن رمز عبور' : 'نمایش رمز عبور'}
              disabled={isLoading}
              className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 hover:text-[#7AE36A] transition-colors focus:outline-none"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Confirm New Password */}
        <div>
          <label htmlFor="reset-confirm-password" className="block text-xs font-semibold text-slate-300 mb-1.5 text-right">
            تکرار رمز عبور جدید <span className="text-[#7AE36A]">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id="reset-confirm-password"
              name="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              dir="ltr"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              autoComplete="new-password"
              disabled={isLoading}
              className="w-full bg-[#02180F] border border-[#7AE36A]/25 rounded-xl py-2.5 pr-10 pl-4 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-[#7AE36A] focus:ring-1 focus:ring-[#7AE36A] transition-all disabled:opacity-50 font-mono"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-4 py-3.5 px-4 bg-[#7AE36A] hover:bg-[#6bd65b] active:scale-[0.99] text-[#042A1B] font-bold text-sm rounded-xl shadow-lg shadow-[#7AE36A]/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>در حال ثبت رمز جدید...</span>
            </>
          ) : (
            <span>تغییر رمز عبور</span>
          )}
        </button>
      </form>

      {/* Switch to Login */}
      <div className="mt-6 pt-5 border-t border-white/10 text-center">
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
