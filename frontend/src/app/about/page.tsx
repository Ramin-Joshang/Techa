import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  BookOpen,
  Briefcase,
  Code2,
  Cpu,
  GraduationCap,
  Layers,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { getPublishedCourses } from '../../lib/server';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'درباره ما | پلتفرم آموزشی تکا',
  description:
    'آشنایی با ماموریت آکادمیک و صنعتی پلتفرم آموزشی تکا، استانداردهای تولید مستندات فنی و مسیر توانمندسازی دانشجویان برای بازار کار.',
};

const VALUES = [
  {
    icon: GraduationCap,
    title: 'ریشه دانشگاهی و رویکرد علمی',
    description:
      'تکا در بدنه دانشگاهی شکل گرفته است تا فاصله میان مباحث نظری علوم کامپیوتر و مهندسی نرم‌افزار در صنعت را با ساختاری منظم پر کند.',
  },
  {
    icon: Code2,
    title: 'ساختار ۱۳ بلوکی محتوای فنی',
    description:
      'هر درس به جای متن‌های پراکنده، با ۱۳ قالب تخصصی شامل قطعه کد، جدول مقایسه، هشدارهای معماری، تصویر و راهنمای اجرایی تدوین می‌شود.',
  },
  {
    icon: Cpu,
    title: 'تکنولوژی‌های به‌روز و استاندارد',
    description:
      'تمامی سرفصل‌ها بر پایه نسخه‌های پایدار Node.js 24، React 19، Next.js 16، TypeScript و MongoDB تدوین و به‌طور مستمر بازبینی می‌شوند.',
  },
  {
    icon: Briefcase,
    title: 'مسیر هموار به بازار کار و کارآموزی',
    description:
      'تمرکز ما بر حل مسائل واقعی، کدنویسی تمیز، امنیت و معماری نرم‌افزار است تا دانشجو پس از اتمام دوره آماده مشارکت در تیم‌های حرفه‌ای باشد.',
  },
];

const WORKFLOW_STEPS = [
  {
    step: '۰۱',
    title: 'انتخاب مسیر یا دوره تخصصی',
    detail: 'شروع از سرفصل‌های استاندارد فرانت‌اند، بک‌اند یا مهندسی تمام‌سویه متناسب با سطح فعلی.',
  },
  {
    step: '۰۲',
    title: 'مطالعه عمیق درس‌های ساختاریافته',
    detail: 'بررسی گام‌به‌گام مفاهیم، نکات کلیدی معماری و الگوهای صحیح کدنویسی به زبان فارسی.',
  },
  {
    step: '۰۳',
    title: 'آزمایش کدها و تمرین‌های عملی',
    detail: 'تغییر مستقیم نمونه کدها و مشاهده تاثیر هر تغییر در محیط واقعی بدون نیاز به تنظیمات پیچیده.',
  },
  {
    step: '۰۴',
    title: 'آمادگی برای ارزیابی و کارآموزی',
    detail: 'ساخت نمونه‌کار قابل استناد، تسلط بر استانداردهای تولید و ورود به پروژه‌های تیمی.',
  },
];

export default async function AboutPage() {
  let publishedCourseCount = 0;
  try {
    const res = await getPublishedCourses({ limit: 1 });
    publishedCourseCount = res?.total || 0;
  } catch {
    publishedCourseCount = 0;
  }

  return (
    <div className="w-full bg-slate-50 text-gray-900">
      {/* Hero Banner */}
      <section className="bg-[#042A1B] text-white py-14 sm:py-20 border-b border-[#7AE36A]/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-[#7AE36A]">
                <Layers className="h-4 w-4" />
                <span>درباره پلتفرم آموزشی و کارآموزی تکا</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight text-white">
                پلی میان آموزش آکادمیک و مهندسی حرفه‌ای وب
              </h1>

              <p className="text-sm sm:text-base text-white/80 leading-relaxed max-w-2xl text-justify">
                تکا با هدف توانمندسازی دانشجویان، برنامه‌نویسان جوان و تیم‌های فنی بنا شده است تا یادگیری مهندسی نرم‌افزار بر پایه مستندات شفاف، استانداردهای واقعی صنعت و تمرین عملی پیش برود.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/docs"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#7AE36A] text-[#042A1B] font-bold text-sm rounded-xl hover:bg-[#6acf5a] transition-colors"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>مشاهده کاتالوگ دوره‌ها</span>
                </Link>
                <Link
                  href="/roadmap"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/15 text-white font-semibold text-sm rounded-xl border border-white/20 transition-colors"
                >
                  <span>بررسی نقشه راه یادگیری</span>
                  <ArrowLeft className="h-4 w-4 text-[#7AE36A]" />
                </Link>
              </div>
            </div>

            {/* Key Platform Facts Card */}
            <div className="lg:col-span-5">
              <div className="bg-[#053723] border border-[#7AE36A]/25 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="relative w-28 h-8">
                    <Image
                      src="/images/logo-light.svg"
                      alt="TECHA"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <span className="text-xs font-mono text-[#7AE36A]">TECHA 2.0</span>
                </div>

                <div className="grid grid-cols-2 gap-4 tabular-nums">
                  <div className="bg-[#042A1B]/70 rounded-2xl p-4 border border-white/10">
                    <p className="text-2xl font-black text-[#7AE36A]">۱۳</p>
                    <p className="text-xs text-white/75 mt-1">قالب بلوک محتوایی تخصصی</p>
                  </div>
                  <div className="bg-[#042A1B]/70 rounded-2xl p-4 border border-white/10">
                    <p className="text-2xl font-black text-[#7AE36A]">
                      {publishedCourseCount > 0 ? publishedCourseCount : '۴+'}
                    </p>
                    <p className="text-xs text-white/75 mt-1">دوره و مستند منتشرشده</p>
                  </div>
                  <div className="bg-[#042A1B]/70 rounded-2xl p-4 border border-white/10">
                    <p className="text-2xl font-black text-white">۴ گام</p>
                    <p className="text-xs text-white/75 mt-1">مسیر استاندارد تا بازار کار</p>
                  </div>
                  <div className="bg-[#042A1B]/70 rounded-2xl p-4 border border-white/10">
                    <p className="text-2xl font-black text-white">۱۰۰٪</p>
                    <p className="text-xs text-white/75 mt-1">مستندسازی بومی و استاندارد</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 text-xs text-white/75 pt-1">
                  <ShieldCheck className="h-4 w-4 text-[#7AE36A] shrink-0" />
                  <span>مستقر در مجموعه دانشگاهی و شتابدهنده تکا — تهران، خیابان آزادی</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Pillars */}
      <section className="py-16 sm:py-20 bg-white border-b border-gray-200/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl space-y-2 mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-950">
              اصول و استانداردهای آموزشی تکا
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              تفاوت اصلی تکا در معماری محتوای آن است: هر مفهوم پیش از انتشار بازبینی فنی می‌شود تا دقیق، کاربردی و بدون اضافه‌گویی باشد.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {VALUES.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-gray-200 bg-slate-50/60 p-6 sm:p-7 space-y-3 hover:border-emerald-300 transition-colors"
              >
                <div className="h-11 w-11 rounded-xl bg-emerald-600/10 text-emerald-700 flex items-center justify-center">
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-gray-950">{item.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed text-justify">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Learning Methodology */}
      <section className="py-16 sm:py-20 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div className="space-y-2 max-w-2xl">
              <h2 className="text-2xl sm:text-3xl font-black text-gray-950">
                چگونه در تکا به تسلط می‌رسید؟
              </h2>
              <p className="text-sm text-gray-600">
                فرآیند چهارمرحله‌ای که برای تبدیل دانش تئوری به مهارت قابل ارائه در مصاحبه‌های فنی طراحی شده است.
              </p>
            </div>
            <Link
              href="/faq"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700 hover:text-emerald-800"
            >
              <span>مطالعه پرسش‌های متداول</span>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {WORKFLOW_STEPS.map((item) => (
              <div
                key={item.step}
                className="bg-white rounded-2xl border border-gray-200 p-6 space-y-3 shadow-xs"
              >
                <span className="inline-block font-mono text-2xl font-black text-emerald-700 tabular-nums">
                  {item.step}
                </span>
                <h3 className="text-base font-bold text-gray-950">{item.title}</h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-14 bg-[#042A1B] text-white border-t border-[#7AE36A]/20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center space-y-5">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#7AE36A]">
            <Users className="h-4 w-4" />
            <span>همراهی با جامعه برنامه‌نویسان تکا</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black">
            سوالی درباره سرفصل‌ها یا همکاری دانشگاهی دارید؟
          </h2>
          <p className="text-sm text-white/75 max-w-xl mx-auto leading-relaxed">
            تیم علمی و فنی تکا آماده پاسخگویی به پرسش‌های دانشجویان، اساتید و شرکت‌های متقاضی جذب کارآموز است.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#7AE36A] text-[#042A1B] rounded-xl font-bold text-sm hover:bg-[#6acf5a] transition-colors"
            >
              <span>تماس با تیم تکا</span>
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <Link
              href="/docs"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/15 text-white rounded-xl font-semibold text-sm border border-white/20 transition-colors"
            >
              <span>ورود به بخش مستندات</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
