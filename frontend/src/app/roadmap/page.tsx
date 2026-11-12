import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Compass,
  Code2,
  Database,
  Layout,
  Rocket,
} from 'lucide-react';
import { getPublishedCourses } from '../../lib/server';
import DocCard from '../../components/docs/DocCard';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'نقشه راه یادگیری و کارآموزی مهندسی وب | TECHA',
  description:
    'مسیر گام‌به‌گام تبدیل شدن به مهندس نرم‌افزار وب در پلتفرم تکا؛ از مبانی فرانت‌اند و React 19 تا Node.js، MongoDB و ورود به کارآموزی.',
};

const ROADMAP_STAGES = [
  {
    step: '۰۱',
    icon: Layout,
    levelFilter: 'beginner',
    title: 'تسلط بر مبانی فرانت‌اند و وب مدرن',
    duration: 'گام اول · سطح مقدماتی',
    summary:
      'درک ساختار معنایی HTML5، طراحی واکنش‌گرا با CSS Grid و Flexbox و تسلط بر مبانی جاوااسکریپت ES6+ برای ساخت رابط‌های کاربری استاندارد.',
    skills: ['HTML5 معنایی', 'CSS Grid & Flexbox', 'JavaScript ES6+', 'TypeScript پایه', 'Git و کنترل نسخه'],
  },
  {
    step: '۰۲',
    icon: Code2,
    levelFilter: 'intermediate',
    title: 'مهندسی رابط کاربری با React و Next.js',
    duration: 'گام دوم · سطح متوسط',
    summary:
      'معماری کامپوننت‌ها در React 19، رندر سمت سرور در Next.js App Router، مدیریت فرم‌ها، بهینه‌سازی سئو و طراحی سیستم‌های واکنش‌گرا با Tailwind.',
    skills: ['React 19 Hooks', 'Next.js App Router', 'Tailwind CSS', 'State Management', 'اعتبارسنجی با Zod'],
  },
  {
    step: '۰۳',
    icon: Database,
    levelFilter: 'advanced',
    title: 'توسعه بک‌اند، امنیت و پایگاه داده',
    duration: 'گام سوم · سطح پیشرفته',
    summary:
      'طراحی سرویس‌های RESTful با Node.js 24 و Express 5، مدل‌سازی داده در MongoDB و Mongoose، احراز هویت امن مبتنی بر Session و کنترل دسترسی RBAC.',
    skills: ['Node.js 24 LTS', 'Express 5 API', 'MongoDB & Mongoose', 'JWT & HTTP-Only Cookies', 'معماری لایه‌ای و تست'],
  },
  {
    step: '۰۴',
    icon: Rocket,
    levelFilter: 'advanced',
    title: 'استقرار، کنترل کیفیت و کارآموزی تیمی',
    duration: 'گام چهارم · آمادگی بازار کار',
    summary:
      'آماده‌سازی پروژه برای محیط واقعی تولید، مدیریت فرآیندها با PM2 و Reverse Proxy، ثبت لاگ ساختاری و حضور در پروژه‌های تیمی و کارآموزی تکا.',
    skills: ['Production Deployment', 'PM2 & Reverse Proxy', 'Testing & Type Safety', 'Code Review تیمی', 'ساخت پورتفولیو'],
  },
];

export default async function RoadmapPage() {
  let courses: any[] = [];
  try {
    const res = await getPublishedCourses({ limit: 3 });
    courses = res?.courses || [];
  } catch {
    courses = [];
  }

  return (
    <div className="w-full bg-slate-50 text-gray-900">
      {/* Hero */}
      <section className="bg-[#042A1B] text-white py-14 sm:py-18 border-b border-[#7AE36A]/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-[#7AE36A]">
                <Compass className="h-4 w-4" />
                <span>مسیر ساختاریافته آموزش تا بازار کار</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight text-white">
                نقشه راه جامع مهندسی نرم‌افزار وب
              </h1>
              <p className="text-sm sm:text-base text-white/80 leading-relaxed max-w-2xl text-justify">
                یادگیری بدون نقشه راه باعث سردرگمی میان ابزارهای پراکنده می‌شود. در تکا، مهارت‌های ضروری توسعه مدرن وب را در ۴ مرحله پیوسته و استاندارد دسته‌بندی کرده‌ایم.
              </p>
              <div className="flex flex-wrap gap-3 pt-1">
                <Link
                  href="/docs?level=beginner"
                  className="inline-flex items-center gap-2 px-5 py-3 bg-[#7AE36A] text-[#042A1B] font-bold text-sm rounded-xl hover:bg-[#6acf5a] transition-colors"
                >
                  <span>شروع از سطح مقدماتی</span>
                  <ArrowLeft className="h-4 w-4" />
                </Link>
                <Link
                  href="/docs"
                  className="inline-flex items-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/15 text-white font-semibold text-sm rounded-xl border border-white/20 transition-colors"
                >
                  <BookOpen className="h-4 w-4 text-[#7AE36A]" />
                  <span>مشاهده همه دوره‌ها</span>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="bg-[#053723] rounded-3xl p-4 sm:p-6 border border-[#7AE36A]/25 shadow-2xl">
                <div className="relative w-full h-56 sm:h-72 rounded-2xl overflow-hidden">
                  <Image
                    src="/images/Roadmap.png"
                    alt="دیاگرام نقشه راه یادگیری در تکا"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Stages */}
      <section className="py-14 sm:py-20 bg-white border-b border-gray-200/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="max-w-2xl space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-950">
              مراحل چهارگانه یادگیری و توانمندسازی
            </h2>
            <p className="text-sm text-gray-600">
              هر مرحله پیش‌نیاز منطقی مرحله بعدی را می‌سازد و با مستندات متناظر در کاتالوگ تکا پشتیبانی می‌شود.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ROADMAP_STAGES.map((stage) => (
              <div
                key={stage.step}
                className="rounded-3xl border border-gray-200 bg-slate-50/60 p-6 sm:p-8 flex flex-col justify-between gap-6 hover:border-emerald-300 transition-colors"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-xl bg-[#042A1B] text-[#7AE36A] flex items-center justify-center shrink-0">
                        <stage.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-emerald-700 block">
                          {stage.duration}
                        </span>
                        <h3 className="text-lg font-black text-gray-950">{stage.title}</h3>
                      </div>
                    </div>
                    <span className="font-mono text-2xl font-black text-gray-300 tabular-nums">
                      {stage.step}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 leading-relaxed text-justify">
                    {stage.summary}
                  </p>

                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {stage.skills.map((skill) => (
                      <li key={skill} className="flex items-center gap-2 text-xs font-medium text-gray-700">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span>{skill}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-gray-200/80 flex items-center justify-between">
                  <Link
                    href={`/docs?level=${stage.levelFilter}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800"
                  >
                    <span>مشاهده دوره‌های مرتبط با این گام</span>
                    <ArrowLeft className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recommended Courses from Real Database */}
      {courses.length > 0 && (
        <section className="py-14 sm:py-16 bg-slate-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-gray-950">دوره‌های فعال در این مسیر</h2>
                <p className="text-sm text-gray-600 mt-1">
                  دوره‌های منتشرشده پلتفرم که هم‌اکنون می‌توانید مطالعه آن‌ها را آغاز کنید.
                </p>
              </div>
              <Link
                href="/docs"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700 hover:text-emerald-800"
              >
                <span>مشاهده کاتالوگ کامل</span>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {courses.map((course) => (
                <DocCard key={course.id} course={course} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
