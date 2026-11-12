'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function RegisterForm() {
  const router = useRouter();
  const { register } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [registeredPhone, setRegisteredPhone] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedFirstName) {
      setErrorMessage('لطفاً نام خود را وارد کنید.');
      return;
    }

    if (!trimmedPhone) {
      setErrorMessage('لطفاً شماره موبایل خود را وارد کنید.');
      return;
    }

    if (!password) {
      setErrorMessage('لطفاً رمز عبور خود را تعیین کنید.');
      return;
    }

    if (password.length < 12) {
      setErrorMessage('رمز عبور باید حداقل ۱۲ کاراکتر باشد.');
      return;
    }

    const hasLetters = /[a-zA-Z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    if (!hasLetters || !hasNumbers) {
      setErrorMessage('رمز عبور باید شامل ترکیب حروف انگلیسی و اعداد باشد.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('رمز عبور و تکرار آن یکسان نیستند.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await register({
        phone: trimmedPhone,
        password,
        firstName: trimmedFirstName,
        lastName: trimmedLastName || undefined,
      });

      if (res?.challengeId) {
        router.push(
          `/verify-otp?challengeId=${encodeURIComponent(res.challengeId)}&phone=${encodeURIComponent(res.phoneE164 || trimmedPhone)}&purpose=registration`
        );
        return;
      }

      setRegisteredPhone(res.phoneE164 || trimmedPhone);
      setIsSuccess(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'خطا در ثبت‌نام کاربر';
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

        <h1 className="text-xl sm:text-2xl font-black text-white mb-3">ثبت‌نام با موفقیت انجام شد</h1>

        <p className="text-slate-300 text-sm leading-relaxed mb-6">
          حساب کاربری شما با شماره <span className="font-mono text-[#7AE36A] font-bold" dir="ltr">{registeredPhone}</span> در پایگاه داده ایجاد شد.
        </p>

        <div className="bg-[#02180F] border border-[#7AE36A]/20 rounded-xl p-4 mb-6 text-right space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-[#7AE36A]">
            <ShieldCheck className="w-4 h-4" />
            <span>وضعیت حساب: در انتظار تأیید پیامکی (Pending Verification)</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            مطابق پروتکل امنیتی تکا، تمام حساب‌های جدید در نقش دانشجوی تأییدنشده قرار می‌گیرند. در فاز آینده (اتصال سامانه پیامکی)، کد فعال‌سازی برای شماره موبایل شما ارسال خواهد شد.
          </p>
        </div>

        <Link
          href="/login"
          className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-4 bg-[#7AE36A] hover:bg-[#6bd65b] text-[#042A1B] font-bold text-sm rounded-xl shadow-lg shadow-[#7AE36A]/20 transition-all"
        >
          <span>ورود به صفحه ورود</span>
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
        <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">ثبت‌نام در سامانه تکا</h1>
        <p className="text-sm text-slate-300">
          برای یادگیری عمیق، مطالعه مستندات و کدنویسی به جامعه ما بپیوندید
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
        {/* Name Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="reg-first-name" className="block text-xs font-semibold text-slate-300 mb-1.5 text-right">
              نام <span className="text-[#7AE36A]">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                id="reg-first-name"
                name="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="سهراب"
                disabled={isLoading}
                className="w-full bg-[#02180F] border border-[#7AE36A]/25 rounded-xl py-2.5 pr-10 pl-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-[#7AE36A] focus:ring-1 focus:ring-[#7AE36A] transition-all disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label htmlFor="reg-last-name" className="block text-xs font-semibold text-slate-300 mb-1.5 text-right">
              نام خانوادگی <span className="text-slate-500">(اختیاری)</span>
            </label>
            <input
              id="reg-last-name"
              name="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="سپهری"
              disabled={isLoading}
              className="w-full bg-[#02180F] border border-[#7AE36A]/25 rounded-xl py-2.5 px-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-[#7AE36A] focus:ring-1 focus:ring-[#7AE36A] transition-all disabled:opacity-50"
            />
          </div>
        </div>

        {/* Phone Input */}
        <div>
          <label htmlFor="reg-phone" className="block text-xs font-semibold text-slate-300 mb-1.5 text-right">
            شماره موبایل <span className="text-[#7AE36A]">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
              <Phone className="w-4 h-4" />
            </div>
            <input
              id="reg-phone"
              name="phone"
              type="tel"
              dir="ltr"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="09123456789"
              autoComplete="tel"
              disabled={isLoading}
              className="w-full bg-[#02180F] border border-[#7AE36A]/25 rounded-xl py-2.5 pr-10 pl-4 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-[#7AE36A] focus:ring-1 focus:ring-[#7AE36A] transition-all disabled:opacity-50"
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-1 text-right">شماره موبایل برای احراز هویت و ورود یکتا استفاده می‌شود.</p>
        </div>

        {/* Password */}
        <div>
          <label htmlFor="reg-password" className="block text-xs font-semibold text-slate-300 mb-1.5 text-right">
            رمز عبور <span className="text-[#7AE36A]">*</span> <span className="text-[11px] text-slate-400">(حداقل ۱۲ کاراکتر شامل حروف و اعداد)</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id="reg-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              dir="ltr"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="حداقل ۱۲ کاراکتر امن"
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

        {/* Confirm Password */}
        <div>
          <label htmlFor="reg-confirm-password" className="block text-xs font-semibold text-slate-300 mb-1.5 text-right">
            تکرار رمز عبور <span className="text-[#7AE36A]">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id="reg-confirm-password"
              name="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              dir="ltr"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="تکرار همان رمز عبور"
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
              <span>در حال ثبت اطلاعات...</span>
            </>
          ) : (
            <span>ایجاد حساب کاربری</span>
          )}
        </button>
      </form>

      {/* Switch to Login */}
      <div className="mt-6 pt-5 border-t border-white/10 text-center">
        <p className="text-xs text-slate-300">
          قبلاً ثبت‌نام کرده‌اید؟{' '}
          <Link
            href="/login"
            className="text-[#7AE36A] hover:underline font-semibold inline-flex items-center gap-1"
          >
            <span>ورود به حساب کاربری</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
        </p>
      </div>
    </div>
  );
}
