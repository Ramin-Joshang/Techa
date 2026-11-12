'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShieldAlert, Lock, ArrowRight, LogOut } from 'lucide-react';
import { AdminPermission } from '@techa/shared';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import { sanitizeAdminReturnPath } from '../../../lib/admin/admin-formatters';

interface AdminGuardProps {
  children: React.ReactNode;
  requiredPermission?: AdminPermission;
  requiredAnyPermissions?: readonly AdminPermission[];
}

export function AdminGuardLoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse p-1" aria-label="در حال بررسی دسترسی">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-6 w-48 bg-slate-200 rounded" />
          <div className="h-4 w-72 bg-slate-100 rounded" />
        </div>
        <div className="h-10 w-32 bg-slate-200 rounded-lg" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((idx) => (
          <div key={idx} className="h-28 bg-white border border-slate-200 rounded-lg p-4 space-y-3">
            <div className="h-4 w-24 bg-slate-200 rounded" />
            <div className="h-7 w-16 bg-slate-200 rounded" />
          </div>
        ))}
      </div>
      <div className="h-64 bg-white border border-slate-200 rounded-lg p-5 space-y-3">
        <div className="h-5 w-40 bg-slate-200 rounded" />
        <div className="h-10 w-full bg-slate-100 rounded" />
        <div className="h-10 w-full bg-slate-100 rounded" />
        <div className="h-10 w-full bg-slate-100 rounded" />
      </div>
    </div>
  );
}

export default function AdminGuard({
  children,
  requiredPermission,
  requiredAnyPermissions,
}: AdminGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, isAuthenticated, hasAdminAccess, hasPermission, hasAnyPermission, logout } =
    useAdminAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const qs = typeof window !== 'undefined' ? window.location.search : '';
      const target = sanitizeAdminReturnPath(qs ? `${pathname}${qs}` : pathname);
      router.replace(`/admin/login?next=${encodeURIComponent(target)}`);
    }
  }, [isLoading, isAuthenticated, router, pathname]);

  if (isLoading) {
    return <AdminGuardLoadingSkeleton />;
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
        <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center mb-4">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">انتقال به صفحه ورود مدیران...</h2>
        <p className="text-sm text-slate-500 mt-1">
          برای ادامه لطفاً با حساب کاربری مدیریتی وارد شوید.
        </p>
      </div>
    );
  }

  if (!hasAdminAccess) {
    return (
      <div className="max-w-lg mx-auto my-12 bg-white border border-red-200 rounded-xl p-8 text-center shadow-xs">
        <div className="w-14 h-14 mx-auto rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-4 border border-red-100">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">عدم دسترسی به پنل مدیریت (۴۰۳)</h1>
        <p className="text-sm text-slate-600 mt-2 leading-relaxed">
          حساب کاربری شما با نقش فعلی مجوز ورود به پنل مدیریت تکا را ندارد. در صورت نیاز با مدیر ارشد سیستم تماس بگیرید.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            <span>بازگشت به سایت</span>
          </Link>
          <button
            type="button"
            onClick={async () => {
              await logout();
              router.replace('/admin/login');
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>خروج و ورود با حساب دیگر</span>
          </button>
        </div>
      </div>
    );
  }

  const permissionAllowed =
    (!requiredPermission || hasPermission(requiredPermission)) &&
    (!requiredAnyPermissions ||
      requiredAnyPermissions.length === 0 ||
      hasAnyPermission(requiredAnyPermissions));

  if (!permissionAllowed) {
    return (
      <div className="max-w-lg mx-auto my-12 bg-white border border-amber-200 rounded-xl p-8 text-center shadow-xs">
        <div className="w-14 h-14 mx-auto rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 border border-amber-100">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">دسترسی غیرمجاز (۴۰۳)</h1>
        <p className="text-sm text-slate-600 mt-2 leading-relaxed">
          نقش کاربری شما مجوز مشاهده یا تغییر این بخش را ندارد.
        </p>
        <div className="mt-6 flex justify-center">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-medium transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            <span>بازگشت به داشبورد مدیریت</span>
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
