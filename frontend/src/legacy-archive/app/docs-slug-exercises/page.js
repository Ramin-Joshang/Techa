"use client";

import { useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import Link from "next/link";
import { AlertCircle, FolderX, Compass, ArrowRight } from "lucide-react";
import LoadingSpinner from "../../../../components/common/LoadingSpinner";

export default function RedirectToFirstSession() {
  const { slug } = useParams();
  const router = useRouter();
  const { contents, loading, error } = useSelector((state) => state.exercises);

  // پیدا کردن اولین جلسه معتبر با memoization
  const firstValidSessionId = useMemo(() => {
    if (!contents || !Array.isArray(contents) || contents.length === 0) return null;

    // ۱. فیلتر کردن جلسات معتبر: 
    // حتماً ParentId داشته باشد (یعنی زیرمجموعه/جلسه باشد)
    // و IsExercise برابر 1 نباشد (آزمون کل فصل نباشد)
    const validSessions = contents.filter(
      (item) => item.ParentId && item.IsExercise !== 1
    );

    // ۲. مرتب‌سازی دقیق
    validSessions.sort((a, b) => {
      // اولویت با SortIndex (ایندکس مرتب‌سازی)
      if (a.SortIndex !== b.SortIndex) {
        return (a.SortIndex || 0) - (b.SortIndex || 0);
      }
      // اگر SortIndex برابر بود، بر اساس Id (قدیمی ترها اول)
      return a.Id - b.Id;
    });

    return validSessions.length > 0 ? validSessions[0].Id : null;
  }, [contents]);

  useEffect(() => {
    if (loading || error || !firstValidSessionId) return;

    // یک تاخیر خیلی کوتاه برای اینکه انیمیشن‌های صفحه نرم‌تر اجرا شوند (اختیاری)
    const timer = setTimeout(() => {
      router.replace(`/docs/${slug}/exercises/${firstValidSessionId}`);
    }, 300);

    return () => clearTimeout(timer);
  }, [loading, error, firstValidSessionId, slug, router]);

  // ==========================================
  // رندرهای وضعیت‌های مختلف (UI خفن‌تر)
  // ==========================================

  // ۱. در حال بارگذاری اولیه دیتای ریداکس
  if (loading) {
    return (
      <div className="flex flex-col min-h-[60vh] items-center justify-center animate-in fade-in duration-500">
        <div className="relative flex items-center justify-center">
          <div className="absolute w-20 h-20 bg-emerald-500/20 rounded-full blur-xl animate-pulse"></div>
          <LoadingSpinner className="w-10 h-10 text-emerald-500 relative z-10" />
        </div>
        <p className="mt-6 text-gray-500 font-medium animate-pulse tracking-wide">
          در حال دریافت مسیر یادگیری شما...
        </p>
      </div>
    );
  }

  // ۲. وضعیت خطا
  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-md border border-red-100 p-8 rounded-3xl shadow-xl shadow-red-900/5 max-w-md w-full text-center animate-in slide-in-from-bottom-4 fade-in duration-500">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4 rotate-12">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">اوه! مشکلی پیش آمد</h3>
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">
            {typeof error === "string" ? error : "در ارتباط با سرور خطایی رخ داده است. لطفاً اتصال اینترنت خود را بررسی کنید."}
          </p>
          <Link
            href={`/docs/${slug}`}
            className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors"
          >
            بازگشت به صفحه دوره
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  // ۳. وضعیت خالی (هیچ جلسه معتبری پیدا نشد)
  if (!firstValidSessionId) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-md border border-gray-200 p-8 rounded-3xl shadow-xl shadow-gray-900/5 max-w-md w-full text-center animate-in zoom-in-95 fade-in duration-500">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4 -rotate-6">
            <FolderX className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">محتوایی یافت نشد</h3>
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">
            هنوز هیچ تمرین یا جلسه آموزشی معتبری برای این دوره ثبت نشده است. لطفاً بعداً سر بزنید.
          </p>
          <Link
            href={`/docs/${slug}`}
            className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/20"
          >
            بازگشت به فهرست اصلی
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  // ۴. در حال ریدایرکت (پیدا شده و در حال انتقال است)
  return (
    <div className="flex flex-col min-h-[60vh] items-center justify-center animate-in fade-in zoom-in-95 duration-500">
      <div className="relative group">
        <div className="absolute -inset-4 bg-emerald-500/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="relative w-24 h-24 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-3xl flex items-center justify-center shadow-2xl shadow-emerald-500/30 rotate-3 transition-transform duration-500">
          <Compass className="w-10 h-10 text-white animate-spin-slow" />
        </div>
      </div>
      <h2 className="mt-8 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600">
        در حال انتقال به تمرین...
      </h2>
      <p className="mt-2 text-sm text-gray-500 font-medium">
        لطفاً چند لحظه صبر کنید
      </p>
    </div>
  );
}
