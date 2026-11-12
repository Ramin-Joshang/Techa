'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Phone, Lock, Eye, EyeOff, Loader2, AlertCircle, ArrowLeft, MessageSquare, KeyRound } from 'lucide-react';
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

export default function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();

  const [mode, setMode] = useState<'password' | 'otp'>('password');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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

    if (mode === 'password') {
      if (!password) {
        setErrorMessage('لطفاً رمز عبور خود را وارد کنید.');
        return;
      }

      setIsLoading(true);
      try {
        await login({ phone: trimmedPhone, password });
        router.push('/');
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'شماره موبایل یا رمز عبور صحیح نیست';
        setErrorMessage(msg);
      } finally {
        setIsLoading(false);
      }
    } else {
      // OTP Login Mode
      setIsLoading(true);
      try {
        const res = await authClient.requestOtp(trimmedPhone);
        const challengeId = res?.challengeId;
        if (challengeId) {
          router.push(
            `/verify-otp?challengeId=${encodeURIComponent(challengeId)}&phone=${encodeURIComponent(trimmedPhone)}&purpose=login`
          );
        } else {
          setErrorMessage('خطایی در درخواست کد رخ داد. لطفاً مجدداً تلاش نمایید.');
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'خطا در ارسال کد اعتبارسنجی';
        setErrorMessage(msg);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="bg-[#042A1B]/90 backdrop-blur-md border border-[#7AE36A]/20 rounded-2xl p-6 sm:p-8 shadow-2xl">
      {/* Brand & Heading */}
      <div className="text-center mb-6">
        <Link href="/" className="inline-block text-2xl font-black text-white tracking-wider mb-2">
          TECH<span className="text-[#7AE36A]">A</span>
        </Link>
        <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">ورود به حساب کاربری</h1>
        <p className="text-sm text-slate-300">
          برای دسترسی به دوره‌ها، یادداشت‌ها و تمرین‌ها وارد شوید
        </p>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="grid grid-cols-2 gap-2 bg-[#02180F] p-1.5 rounded-xl border border-[#7AE36A]/20 mb-6">
        <button
          type="button"
          onClick={() => {
            setMode('password');
            setErrorMessage(null);
          }}
          className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            mode === 'password'
              ? 'bg-[#7AE36A] text-[#042A1B] shadow-md shadow-[#7AE36A]/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>ورود با رمز عبور</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('otp');
            setErrorMessage(null);
          }}
          className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            mode === 'otp'
              ? 'bg-[#7AE36A] text-[#042A1B] shadow-md shadow-[#7AE36A]/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>ورود با پیامک (OTP)</span>
        </button>
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
        {/* Phone Input */}
        <div>
          <label htmlFor="login-phone" className="block text-xs font-semibold text-slate-300 mb-2 text-right">
            شماره موبایل
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
              <Phone className="w-4 h-4" />
            </div>
            <input
              id="login-phone"
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
          <p className="text-[11px] text-slate-400 mt-1 text-right">فرمت‌های معتبر: 09123456789 یا 989123456789+</p>
        </div>

        {/* Password Input (only in password mode) */}
        {mode === 'password' && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="login-password" className="block text-xs font-semibold text-slate-300">
                رمز عبور
              </label>
              <Link
                href="/forgot-password"
                className="text-[11px] text-[#7AE36A] hover:underline"
              >
                فراموشی رمز عبور؟
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="login-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                dir="ltr"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                autoComplete="current-password"
                disabled={isLoading}
                className="w-full bg-[#02180F] border border-[#7AE36A]/25 rounded-xl py-3 pr-10 pl-11 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-[#7AE36A] focus:ring-1 focus:ring-[#7AE36A] transition-all disabled:opacity-50 font-mono"
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
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 py-3.5 px-4 bg-[#7AE36A] hover:bg-[#6bd65b] active:scale-[0.99] text-[#042A1B] font-bold text-sm rounded-xl shadow-lg shadow-[#7AE36A]/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{mode === 'password' ? 'در حال ورود...' : 'در حال ارسال کد...'}</span>
            </>
          ) : (
            <span>{mode === 'password' ? 'ورود به سامانه' : 'ارسال کد یکبارمصرف (OTP)'}</span>
          )}
        </button>
      </form>

      {/* Switch to Register */}
      <div className="mt-8 pt-6 border-t border-white/10 text-center">
        <p className="text-xs text-slate-300">
          حساب کاربری ندارید؟{' '}
          <Link
            href="/register"
            className="text-[#7AE36A] hover:underline font-semibold inline-flex items-center gap-1"
          >
            <span>ثبت‌نام در تکا</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
        </p>
      </div>
    </div>
  );
}
