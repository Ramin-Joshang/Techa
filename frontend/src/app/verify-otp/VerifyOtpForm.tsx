'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, Loader2, AlertCircle, ArrowLeft, RotateCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
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

export default function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { verifyOtp } = useAuth();

  const initialChallengeId = searchParams.get('challengeId') || '';
  const initialPhone = searchParams.get('phone') || '';
  const purpose = searchParams.get('purpose') || 'login'; // registration, login, password_reset

  const [challengeId, setChallengeId] = useState(initialChallengeId);
  const [phone] = useState(initialPhone);
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Timer countdown
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Focus first input on mount
  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  const handleDigitChange = (index: number, value: string) => {
    setErrorMessage(null);
    const normalized = normalizePersianDigits(value).replace(/\D/g, '');

    if (!normalized) {
      const nextDigits = [...digits];
      nextDigits[index] = '';
      setDigits(nextDigits);
      return;
    }

    // Single digit input
    const nextDigits = [...digits];
    nextDigits[index] = normalized[normalized.length - 1];
    setDigits(nextDigits);

    // Auto-advance to next input
    if (index < 5 && normalized.length > 0) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = normalizePersianDigits(e.clipboardData.getData('text')).replace(/\D/g, '');
    if (!pasted) return;

    const nextDigits = [...digits];
    for (let i = 0; i < 6; i++) {
      nextDigits[i] = pasted[i] || '';
    }
    setDigits(nextDigits);

    const nextFocusIndex = Math.min(pasted.length, 5);
    inputsRef.current[nextFocusIndex]?.focus();
  };

  const handleResend = async () => {
    if (cooldown > 0 || isResending || !challengeId) return;

    setIsResending(true);
    setErrorMessage(null);
    setResendSuccess(false);

    try {
      const res = await authClient.resendOtp(challengeId);
      if (res?.challengeId) {
        setChallengeId(res.challengeId);
      }
      setCooldown(res?.retryAfterSeconds || 60);
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 5000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'خطا در ارسال مجدد کد';
      setErrorMessage(msg);
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const fullCode = digits.join('');
    if (fullCode.length !== 6) {
      setErrorMessage('لطفاً کد ۶ رقمی را به‌طور کامل وارد کنید.');
      return;
    }

    if (!challengeId) {
      setErrorMessage('شناسه درخواست معتبر نیست. لطفاً مجدداً تلاش کنید.');
      return;
    }

    // For password reset, forward to reset-password form with verified code
    if (purpose === 'password_reset') {
      router.push(`/reset-password?challengeId=${encodeURIComponent(challengeId)}&code=${encodeURIComponent(fullCode)}`);
      return;
    }

    setIsLoading(true);
    try {
      await verifyOtp({ challengeId, code: fullCode });
      router.push('/');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'کد وارد شده صحیح نیست یا منقضی شده است';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const getPurposeLabel = () => {
    switch (purpose) {
      case 'registration':
        return 'تأیید شماره و فعال‌سازی حساب';
      case 'password_reset':
        return 'تأیید شماره برای بازیابی رمز عبور';
      default:
        return 'ورود با کد یکبارمصرف';
    }
  };

  return (
    <div className="bg-[#042A1B]/90 backdrop-blur-md border border-[#7AE36A]/20 rounded-2xl p-6 sm:p-8 shadow-2xl">
      {/* Brand & Heading */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-block text-2xl font-black text-white tracking-wider mb-2">
          TECH<span className="text-[#7AE36A]">A</span>
        </Link>
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#7AE36A]/10 text-[#7AE36A] mb-3">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">{getPurposeLabel()}</h1>
        <p className="text-sm text-slate-300">
          کد ۶ رقمی ارسال‌شده به شماره{' '}
          <span className="font-mono text-[#7AE36A] font-semibold" dir="ltr">
            {phone || 'موبایل شما'}
          </span>{' '}
          را وارد کنید
        </p>
      </div>

      {/* Alerts */}
      {errorMessage && (
        <div
          role="alert"
          className="mb-6 p-4 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-sm flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">{errorMessage}</div>
        </div>
      )}

      {resendSuccess && (
        <div
          role="status"
          className="mb-6 p-4 rounded-xl bg-emerald-950/60 border border-[#7AE36A]/40 text-[#7AE36A] text-sm flex items-center gap-2"
        >
          <RotateCw className="w-4 h-4 animate-spin text-[#7AE36A]" />
          <span>کد جدید با موفقیت ارسال شد.</span>
        </div>
      )}

      {/* 6-Digit OTP Form */}
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-3 text-center">
            کد اعتبارسنجی پیامکی
          </label>
          <div className="flex items-center justify-center gap-2 sm:gap-3" dir="ltr">
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => {
                  inputsRef.current[idx] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                onPaste={handlePaste}
                disabled={isLoading}
                className="w-11 h-13 sm:w-12 sm:h-14 text-center font-mono text-xl sm:text-2xl font-bold bg-[#02180F] border border-[#7AE36A]/30 text-white rounded-xl focus:outline-none focus:border-[#7AE36A] focus:ring-2 focus:ring-[#7AE36A]/30 transition-all disabled:opacity-50"
              />
            ))}
          </div>
        </div>

        {/* Resend Cooldown Counter & Action */}
        <div className="text-center">
          {cooldown > 0 ? (
            <p className="text-xs text-slate-400">
              ارسال مجدد کد پس از{' '}
              <span className="font-mono font-bold text-[#7AE36A]">
                {Math.floor(cooldown / 60)}:{String(cooldown % 60).padStart(2, '0')}
              </span>{' '}
              امکان‌پذیر است
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending || isLoading}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7AE36A] hover:underline cursor-pointer disabled:opacity-50"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
              <span>ارسال مجدد کد پیامکی</span>
            </button>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || digits.join('').length !== 6}
          className="w-full py-3.5 px-4 bg-[#7AE36A] hover:bg-[#6bd65b] active:scale-[0.99] text-[#042A1B] font-bold text-sm rounded-xl shadow-lg shadow-[#7AE36A]/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>در حال اعتبارسنجی...</span>
            </>
          ) : (
            <span>تأیید و ادامه</span>
          )}
        </button>
      </form>

      {/* Return Links */}
      <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
        <Link href="/login" className="hover:text-white transition-colors inline-flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>بازگشت به صفحه ورود</span>
        </Link>
        <Link href="/" className="hover:text-white transition-colors">
          صفحه اصلی
        </Link>
      </div>
    </div>
  );
}
