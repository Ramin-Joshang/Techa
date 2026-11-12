'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  AlertCircle,
  ArrowRight,
  KeyRound,
  Lock,
  LogOut,
  Phone,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import { AdminApiError } from '../../../lib/admin/admin-client';
import { sanitizeAdminReturnPath } from '../../../lib/admin/admin-formatters';
import { AdminButton } from '../../../components/admin/ui/AdminPrimitives';
import { AdminField, AdminInput } from '../../../components/admin/ui/AdminFormFields';

function AdminLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    user,
    isLoading: authLoading,
    isAuthenticated,
    hasAdminAccess,
    loginWithPassword,
    requestLoginOtp,
    verifyLoginOtp,
    resendOtp,
    logout,
  } = useAdminAuth();

  const nextPath = sanitizeAdminReturnPath(searchParams?.get('next'));

  const [mode, setMode] = useState<'password' | 'otp'>('password');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [challengeId, setChallengeId] = useState('');
  const [maskedPhone, setMaskedPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [resendSeconds, setResendSeconds] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated && hasAdminAccess) {
      router.replace(nextPath);
    }
  }, [authLoading, isAuthenticated, hasAdminAccess, router, nextPath]);

  useEffect(() => {
    if (resendSeconds <= 0) return;
    const timer = setInterval(() => {
      setResendSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendSeconds]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!phone.trim() || !password) {
      setErrorMsg('لطفاً شماره موبایل و رمز عبور را وارد کنید.');
      return;
    }

    setSubmitting(true);
    try {
      await loginWithPassword({ phone: phone.trim(), password });
      router.replace(nextPath);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'ورود ناموفق بود.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!phone.trim()) {
      setErrorMsg('لطفاً شماره موبایل را وارد کنید.');
      return;
    }

    setSubmitting(true);
    try {
      const challenge = await requestLoginOtp(phone.trim());
      setChallengeId(challenge.challengeId);
      setMaskedPhone(challenge.maskedPhone);
      setResendSeconds(challenge.retryAfterSeconds || 60);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'ارسال کد تأیید ناموفق بود.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!otpCode.trim()) {
      setErrorMsg('لطفاً کد تأیید پیامکی را وارد کنید.');
      return;
    }

    setSubmitting(true);
    try {
      await verifyLoginOtp({ challengeId, code: otpCode.trim() });
      router.replace(nextPath);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'تأیید کد ناموفق بود.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (!challengeId || resendSeconds > 0) return;
    setErrorMsg(null);
    setSubmitting(true);
    try {
      const res = await resendOtp(challengeId);
      setResendSeconds(res.retryAfterSeconds || 60);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'ارسال مجدد کد ناموفق بود.');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl p-8 space-y-4 animate-pulse">
          <div className="h-10 w-10 bg-slate-200 rounded-lg mx-auto" />
          <div className="h-6 w-48 bg-slate-200 rounded mx-auto" />
          <div className="h-10 w-full bg-slate-100 rounded-lg" />
          <div className="h-10 w-full bg-slate-100 rounded-lg" />
        </div>
      </div>
    );
  }

  if (isAuthenticated && user && !hasAdminAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white border border-red-200 rounded-xl p-8 text-center shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-100">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h1 className="text-lg font-bold text-slate-900">عدم مجوز ورود به پنل مدیریت</h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            شما هم‌اکنون با حساب <span dir="ltr" className="font-mono font-semibold">{user.phoneMasked}</span> وارد شده‌اید، اما این حساب فاقد نقش مدیریتی است.
          </p>
          <div className="flex flex-col gap-2 pt-2">
            <AdminButton
              variant="primary"
              onClick={async () => {
                await logout();
                setErrorMsg(null);
              }}
              icon={<LogOut className="w-4 h-4" />}
            >
              خروج و ورود با حساب مدیریتی
            </AdminButton>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 min-h-[40px] px-4 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <ArrowRight className="w-4 h-4" />
              <span>بازگشت به سایت عمومی</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-[#F8FAFC]">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl shadow-xs p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-[#042A1B] text-[#7AE36A] flex items-center justify-center mx-auto font-bold text-lg">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">ورود به پنل مدیریت تکا</h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            دسترسی مخصوص مدیران محتوا، ویرایشگران و مدیران پلتفرم
          </p>
        </div>

        {/* Auth Mode Tabs */}
        <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            type="button"
            onClick={() => {
              setMode('password');
              setErrorMsg(null);
            }}
            className={`min-h-[36px] rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
              mode === 'password'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>رمز عبور</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('otp');
              setErrorMsg(null);
            }}
            className={`min-h-[36px] rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
              mode === 'otp'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>کد یک‌بارمصرف</span>
          </button>
        </div>

        {errorMsg && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50/70 px-3.5 py-2.5 text-xs text-red-800 flex items-start gap-2"
          >
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMsg}</span>
          </div>
        )}

        {mode === 'password' ? (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <AdminField label="شماره موبایل" htmlFor="admin-phone" required>
              <div className="relative">
                <AdminInput
                  id="admin-phone"
                  type="tel"
                  dir="ltr"
                  placeholder="09123456789"
                  autoComplete="username"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-9 font-mono"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </AdminField>

            <AdminField label="رمز عبور" htmlFor="admin-password" required>
              <div className="relative">
                <AdminInput
                  id="admin-password"
                  type="password"
                  dir="ltr"
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </AdminField>

            <AdminButton
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={submitting}
            >
              ورود به پنل مدیریت
            </AdminButton>
          </form>
        ) : !challengeId ? (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <AdminField label="شماره موبایل مدیریتی" htmlFor="admin-otp-phone" required>
              <AdminInput
                id="admin-otp-phone"
                type="tel"
                dir="ltr"
                placeholder="09123456789"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="font-mono"
              />
            </AdminField>
            <AdminButton
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={submitting}
            >
              ارسال کد تأیید پیامکی
            </AdminButton>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="rounded-lg bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-xs text-slate-600">
              کد تأیید به شماره{' '}
              <span dir="ltr" className="font-mono font-semibold text-slate-900">
                {maskedPhone || phone}
              </span>{' '}
              ارسال شد.
            </div>
            <AdminField label="کد تأیید" htmlFor="admin-otp-code" required>
              <AdminInput
                id="admin-otp-code"
                type="text"
                inputMode="numeric"
                dir="ltr"
                maxLength={8}
                placeholder="123456"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className="font-mono text-center tracking-widest"
              />
            </AdminField>

            <AdminButton
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={submitting}
            >
              تأیید و ورود به پنل
            </AdminButton>

            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={() => {
                  setChallengeId('');
                  setOtpCode('');
                  setErrorMsg(null);
                }}
                className="text-slate-600 hover:text-slate-900"
              >
                تغییر شماره موبایل
              </button>
              <button
                type="button"
                disabled={resendSeconds > 0 || submitting}
                onClick={handleResendOtp}
                className="text-emerald-700 hover:text-emerald-800 disabled:text-slate-400 font-medium tabular-nums"
              >
                {resendSeconds > 0 ? `ارسال مجدد (${resendSeconds} ثانیه)` : 'ارسال مجدد کد'}
              </button>
            </div>
          </form>
        )}

        <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <Link href="/" className="hover:text-emerald-700 transition-colors flex items-center gap-1">
            <ArrowRight className="w-3.5 h-3.5" />
            <span>بازگشت به سایت</span>
          </Link>
          <span className="font-mono text-[11px] text-slate-400">TECHA Admin</span>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-6 text-sm text-slate-500">
          در حال بارگذاری فرم ورود...
        </div>
      }
    >
      <AdminLoginContent />
    </Suspense>
  );
}
