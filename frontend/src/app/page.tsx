import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  BookOpen,
  ArrowLeft,
  CheckCircle2,
  Code2,
  Cpu,
  GraduationCap,
  Briefcase,
  FileCode2,
  Terminal,
  AlertCircle,
  Compass,
} from 'lucide-react';
import {
  getHomepage,
  getPublishedCourses,
  getCourseOutline,
} from '../lib/server';
import DocCard from '../components/docs/DocCard';
import LearningRoadmap from '../components/roadmap/LearningRoadmap';
import { formatPersianCount, formatReadingDuration } from '../lib/format-duration';

export const revalidate = 60;

function normalizePublicCtaUrl(url?: string): string {
  if (!url) return '/docs';
  if (url === '/courses' || url.startsWith('/courses?')) {
    return url.replace(/^\/courses/, '/docs');
  }
  return url.startsWith('/') ? url : '/docs';
}

function renderFeatureIcon(iconName?: string) {
  const key = (iconName || '').toLowerCase();
  if (key.includes('cpu')) return <Cpu className="h-5 w-5 text-emerald-700" />;
  if (key.includes('graduation') || key.includes('academic')) {
    return <GraduationCap className="h-5 w-5 text-emerald-700" />;
  }
  if (key.includes('briefcase') || key.includes('career')) {
    return <Briefcase className="h-5 w-5 text-emerald-700" />;
  }
  if (key.includes('terminal')) return <Terminal className="h-5 w-5 text-emerald-700" />;
  return <FileCode2 className="h-5 w-5 text-emerald-700" />;
}

export async function generateMetadata() {
  try {
    const page = await getHomepage();
    if (page?.seo) {
      return {
        title: page.seo.metaTitle || 'تکا | مرجع تخصصی آموزش و مستندات برنامه‌نویسی وب',
        description:
          page.seo.metaDescription ||
          'آموزش جامع و ساختاریافته برنامه‌نویسی وب، ری‌اکت، تایپ‌اسکریپت و معماری نرم‌افزار به زبان فارسی.',
        keywords: ['آموزش برنامه‌نویسی', 'تکا', 'TECHA', 'ری‌اکت', 'تایپ‌اسکریپت', 'مستندات فنی'],
        alternates: { canonical: '/' },
        robots: 'index, follow',
      };
    }
  } catch {
    // Graceful fallback
  }

  return {
    title: 'تکا | مرجع تخصصی آموزش و مستندات برنامه‌نویسی وب',
    description:
      'آموزش جامع و استاندارد برنامه‌نویسی وب با ۱۳ بلوک محتوایی و محیط اجرای زنده کد به زبان فارسی.',
    alternates: { canonical: '/' },
  };
}

export default async function HomePage() {
  let homeConfig: Awaited<ReturnType<typeof getHomepage>> = null;
  let publishedCourses: Awaited<ReturnType<typeof getPublishedCourses>>['courses'] = [];
  let totalCourses = 0;
  let coursesUnavailable = false;

  const [homeRes, coursesRes] = await Promise.allSettled([
    getHomepage(),
    getPublishedCourses({ limit: 24 }),
  ]);

  if (homeRes.status === 'fulfilled') {
    homeConfig = homeRes.value;
  }

  if (coursesRes.status === 'fulfilled') {
    publishedCourses = coursesRes.value?.courses || [];
    totalCourses = coursesRes.value?.total || publishedCourses.length;
  } else {
    coursesUnavailable = true;
  }

  const showcaseCourses =
    homeConfig?.featuredCourses && homeConfig.featuredCourses.length > 0
      ? homeConfig.featuredCourses.slice(0, 6)
      : publishedCourses.slice(0, 6);

  const roadmapCourses =
    publishedCourses.length > 0 ? publishedCourses : showcaseCourses;

  const firstCourseWithLessons =
    showcaseCourses.find((c) => (c.stats?.totalLessons ?? 0) > 0) || showcaseCourses[0];
  let firstInteractiveLessonUrl = firstCourseWithLessons
    ? `/docs/${firstCourseWithLessons.slug}`
    : '/docs';

  if (firstCourseWithLessons && (firstCourseWithLessons.stats?.totalLessons ?? 0) > 0) {
    try {
      const outline = await getCourseOutline(firstCourseWithLessons.slug);
      const firstLesson = outline?.chapters?.[0]?.lessons?.[0];
      if (firstLesson?.slug) {
        firstInteractiveLessonUrl = `/docs/${firstCourseWithLessons.slug}/${firstLesson.slug}`;
      }
    } catch {
      // Keep course overview link
    }
  }

  const heroTitle =
    homeConfig?.heroSection?.title || 'پلتفرم آموزشی و کارآموزی تکا';
  const heroSubtitle =
    homeConfig?.heroSection?.subtitle ||
    'مجموعه‌ای در بدنه دانشگاه، با هدف توانمندسازی دانشجویان و علاقه‌مندان برای ورود به بازار کار و توسعه تخصصی سامانه‌های نرم‌افزاری بر پایه جدیدترین استانداردهای وب مدرن.';
  const primaryCtaLabel =
    homeConfig?.heroSection?.primaryCta?.label || 'مشاهده کاتالوگ دوره‌ها';
  const primaryCtaUrl = normalizePublicCtaUrl(
    homeConfig?.heroSection?.primaryCta?.url
  );

  const realStats = homeConfig?.statistics;
  const formattedTotalDuration = formatReadingDuration(
    realStats?.totalReadingTimeMinutes
  );

  const platformFeatures =
    homeConfig?.features && homeConfig.features.length > 0
      ? homeConfig.features
      : [
          {
            title: '۱۳ بلوک محتوایی ساختاریافته',
            description:
              'محتوای هر درس شامل سرفصل‌ها، قطعه کدهای رنگی، جداول مقایسه‌ای، نکات کلیدی و تمرین‌های تعاملی است.',
            icon: 'code-2',
          },
          {
            title: 'آزمایشگاه اجرای زنده در مرورگر',
            description:
              'امکان ویرایش و اجرای مثال‌های HTML/CSS/JS و React 19 در سندباکس ایزوله بدون نیاز به نصب ابزار.',
            icon: 'cpu',
          },
          {
            title: 'پشتوانه دانشگاهی و استاندارد صنعتی',
            description:
              'طراحی‌شده بر پایه ساختار آموزشی منظم برای انتقال دقیق مفاهیم مهندسی وب تا سطح تولید.',
            icon: 'graduation-cap',
          },
        ];

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: homeConfig?.branding?.siteName || 'TECHA',
    alternateName: 'پلتفرم آموزشی تکا',
    url: 'https://techa.ir',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://techa.ir/docs?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'TECHA - آکادمی و پلتفرم آموزش برنامه‌نویسی تکا',
    url: 'https://techa.ir',
    description: heroSubtitle,
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />

      {/* =========================================================================
          1. HERO SECTION — Clean Deep Emerald (#042A1B) + Animated Astronaut
          ========================================================================= */}
      <section className="relative bg-[#042A1B] text-white pt-12 pb-16 lg:pt-16 lg:pb-24 overflow-hidden border-b border-[#7AE36A]/20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #7AE36A 1px, transparent 1px), linear-gradient(to bottom, #7AE36A 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-28 right-1/4 w-[440px] h-[440px] bg-[#7AE36A]/10 rounded-full blur-3xl"
        />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Hero Copy & Primary Actions */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-right">
              <div className="inline-flex items-center gap-2 bg-[#7AE36A]/15 text-[#7AE36A] px-3.5 py-1.5 rounded-lg border border-[#7AE36A]/30 font-bold text-xs">
                <span>اعتبار بگیر، مسلط شو، وارد بازار کار شو</span>
              </div>

              <div className="space-y-3">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.2] text-white text-balance">
                  {heroTitle}
                </h1>
                <div className="relative w-44 sm:w-56 h-2.5 mx-auto lg:mr-0 opacity-90">
                  <Image
                    src="/images/line.svg"
                    alt=""
                    fill
                    className="object-contain"
                  />
                </div>
              </div>

              <p className="text-white/80 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto lg:mr-0">
                {heroSubtitle}
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                <Link
                  href={primaryCtaUrl}
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#7AE36A] text-[#042A1B] font-extrabold text-sm rounded-xl hover:bg-[#6acf5a] transition-colors shadow-lg shadow-[#7AE36A]/15"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>{primaryCtaLabel}</span>
                </Link>

                <Link
                  href={firstInteractiveLessonUrl}
                  className="inline-flex items-center gap-2 px-5 py-3.5 bg-white/10 hover:bg-white/15 text-white font-bold text-sm rounded-xl border border-white/20 transition-colors"
                >
                  <Code2 className="h-4 w-4 text-[#7AE36A]" />
                  <span>شروع مطالعه مستندات</span>
                </Link>

                <Link
                  href="/roadmap"
                  className="inline-flex items-center gap-1.5 px-4 py-3.5 text-[#7AE36A] hover:text-white font-bold text-sm transition-colors"
                >
                  <span>نقشه راه یادگیری</span>
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Hero Floating Astronaut + Real Stats */}
            <div className="lg:col-span-5 flex flex-col items-center gap-6">
              <div className="relative w-64 sm:w-80 h-64 sm:h-80 animate-float-astronaut">
                <Image
                  src="/images/aster.png"
                  alt="فضانورد و نشان پلتفرم آموزشی تکا"
                  fill
                  priority
                  className="object-contain drop-shadow-[0_20px_42px_rgba(0,0,0,0.48)]"
                />
              </div>

              {realStats && realStats.totalCourses > 0 && (
                <div className="w-full max-w-md grid grid-cols-3 gap-2 rounded-2xl bg-[#031F14]/90 border border-[#7AE36A]/25 p-3.5 text-center tabular-nums">
                  <div>
                    <div className="text-lg sm:text-xl font-black text-[#7AE36A]">
                      {formatPersianCount(realStats.totalCourses)}
                    </div>
                    <div className="text-[11px] text-white/70 font-medium">دوره منتشرشده</div>
                  </div>
                  <div className="border-x border-white/10">
                    <div className="text-lg sm:text-xl font-black text-white">
                      {formatPersianCount(realStats.totalLessons)}
                    </div>
                    <div className="text-[11px] text-white/70 font-medium">درس ساختاریافته</div>
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-black text-white leading-tight pt-0.5">
                      {formattedTotalDuration || '—'}
                    </div>
                    <div className="text-[11px] text-white/70 font-medium mt-0.5">محتوای آموزشی</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. PUBLISHED COURSES SHOWCASE (Crisp White Canvas)
          ========================================================================= */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 pb-6 border-b border-slate-100">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700">
                <BookOpen className="h-4 w-4" />
                <span>دوره‌ها و مستندات فعال</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                مسیرهای آموزشی و مستندات تخصصی تکا
              </h2>
              <p className="text-slate-600 text-sm">
                مجموعه سرفصل‌های استاندارد مهندسی فرانت‌اند و بک‌اند بر پایه جدیدترین فناوری‌های وب.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs">
                <Link
                  href="/docs?level=beginner"
                  className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 hover:border-emerald-400 hover:text-emerald-800 transition-colors"
                >
                  مقدماتی
                </Link>
                <Link
                  href="/docs?level=intermediate"
                  className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 hover:border-emerald-400 hover:text-emerald-800 transition-colors"
                >
                  متوسط
                </Link>
                <Link
                  href="/docs?level=advanced"
                  className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 hover:border-emerald-400 hover:text-emerald-800 transition-colors"
                >
                  پیشرفته
                </Link>
              </div>
              <Link
                href="/docs"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700 hover:text-emerald-800 transition-colors tabular-nums"
              >
                <span>مشاهده همه ({formatPersianCount(totalCourses)})</span>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {coursesUnavailable ? (
            <div className="bg-slate-50 rounded-2xl p-8 text-center border border-slate-200 text-slate-800 space-y-2 max-w-xl mx-auto">
              <AlertCircle className="h-9 w-9 text-amber-600 mx-auto" />
              <h3 className="text-base font-bold text-slate-950">
                دوره‌های آموزشی هم‌اکنون در حال آماده‌سازی هستند
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                امکان دریافت دوره‌ها در این لحظه وجود ندارد. لطفاً کمی بعد دوباره تلاش کنید.
              </p>
            </div>
          ) : showcaseCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {showcaseCourses.map((course) => (
                <DocCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <div className="bg-slate-50 rounded-2xl p-10 text-center border border-dashed border-slate-300">
              <BookOpen className="h-9 w-9 text-slate-400 mx-auto mb-2.5" />
              <h3 className="text-base font-bold text-slate-800">
                به زودی دوره‌های جدید در این بخش منتشر می‌شوند
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                برای مشاهده فهرست به‌روز می‌توانید صفحه مستندات را دنبال کنید.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* =========================================================================
          3. EDITORIAL ARCHITECTURE STRIP (Varied Asymmetric Layout)
          ========================================================================= */}
      <section className="py-16 lg:py-20 bg-slate-50 border-y border-slate-200/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            <div className="lg:col-span-4 space-y-3 lg:sticky lg:top-24">
              <span className="text-xs font-bold text-emerald-700 block">معماری و کیفیت محتوا</span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight text-balance">
                چرا یادگیری در مستندات تکا متفاوت است؟
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                ساختار محتوایی تکا به‌جای متن‌های پراکنده، هر موضوع را با کدهای تست‌شده، مثال‌های تعاملی و مسیر منظم ارائه می‌دهد.
              </p>
              <Link
                href="/about"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 pt-1"
              >
                <span>آشنایی بیشتر با استاندارد تکا</span>
                <ArrowLeft className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="lg:col-span-8 divide-y divide-slate-200/80 bg-white rounded-3xl border border-slate-200/90 px-6 sm:px-8 shadow-xs">
              {platformFeatures.map((feat, idx) => (
                <div
                  key={idx}
                  className="py-6 sm:py-7 flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6"
                >
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono text-sm font-black text-emerald-700/70 tabular-nums">
                      0{idx + 1}.
                    </span>
                    <div className="h-11 w-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                      {renderFeatureIcon(feat.icon)}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-base sm:text-lg font-extrabold text-slate-950">
                      {feat.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {feat.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. INTERACTIVE SANDBOX & READING EXPERIENCE SHOWCASE
          ========================================================================= */}
      <section className="py-16 lg:py-20 bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-5">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-[#7AE36A]">
                <Terminal className="h-4 w-4" />
                <span>تجربه مطالعه و اجرای زنده</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-snug text-balance">
                خواندن مستندات و آزمایش مستقیم کدها در یک محیط یکپارچه
              </h2>
              <p className="text-slate-300 text-sm sm:text-[15px] leading-relaxed">
                در هر درس، مفاهیم همراه با قطعه کدهای تفکیک‌شده و سندباکس ایزوله مرورگر ارائه می‌شوند تا بتوانید ساختار کد را تغییر دهید و خروجی کامپوننت را بلافاصله ببینید.
              </p>

              <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#7AE36A] shrink-0" />
                  <span>پشتیبانی بومی از محیط‌های HTML/CSS/JS، React 19 و Tailwind</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#7AE36A] shrink-0" />
                  <span>هایلایت سینتکس دقیق، شماره خطوط، دکمه کپی و نمایش خروجی کنسول</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#7AE36A] shrink-0" />
                  <span>فهرست عناوین پویا و جمع‌شونده برای مطالعه با تمرکز بالا</span>
                </li>
              </ul>

              <div className="pt-2 flex flex-wrap gap-3">
                <Link
                  href={firstInteractiveLessonUrl}
                  className="px-5 py-3 bg-[#7AE36A] text-[#042A1B] rounded-xl font-extrabold text-xs sm:text-sm hover:bg-[#6acf5a] transition-colors inline-flex items-center gap-2"
                >
                  <span>ورود به اولین درس تعاملی</span>
                  <ArrowLeft className="h-4 w-4" />
                </Link>
                <Link
                  href="/docs"
                  className="px-5 py-3 bg-white/10 hover:bg-white/15 text-white rounded-xl font-bold text-xs sm:text-sm border border-white/15 transition-colors"
                >
                  مشاهده همه مستندات
                </Link>
              </div>
            </div>

            <div
              className="lg:col-span-6 bg-[#0d131a] rounded-2xl p-5 border border-slate-800 shadow-2xl text-left"
              dir="ltr"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4 text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                    App.tsx
                  </span>
                  <span className="text-xs font-mono text-slate-400">React 19 Sandbox</span>
                </div>
                <span className="text-[11px] font-sans font-semibold text-slate-400">
                  اجرای ایزوله در مرورگر
                </span>
              </div>

              <pre className="font-mono text-xs sm:text-[13px] text-slate-200 leading-relaxed overflow-x-auto pb-4">
{`import React, { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount((c) => c + 1)}>
      تعداد کلیک: {count}
    </button>
  );
}`}
              </pre>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between bg-slate-900/70 p-3.5 rounded-xl">
                <span className="text-xs text-slate-400 font-sans">خروجی کامپوننت در سندباکس:</span>
                <span className="px-3.5 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold font-sans">
                  تعداد کلیک: ۱
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. INTERACTIVE 7-STAGE LEARNING ROADMAP (Linked to Real Courses)
          ========================================================================= */}
      <section className="py-16 lg:py-20 bg-[#042A1B] text-white border-t border-[#7AE36A]/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-[#7AE36A]">
                <Compass className="h-4 w-4" />
                <span>مسیر ۷ مرحله‌ای یادگیری تا بازار کار</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                نقشه راه جامع مهندسی نرم‌افزار وب
              </h2>
              <p className="text-white/75 text-sm leading-relaxed">
                روی هر مرحله کلیک کنید تا مهارت‌های کلیدی و دوره‌های مرتبط تکا برای آن گام را مشاهده کنید.
              </p>
            </div>
            <Link
              href="/roadmap"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#7AE36A] text-[#042A1B] rounded-xl font-extrabold text-xs sm:text-sm hover:bg-[#6acf5a] transition-colors shrink-0 self-start md:self-auto"
            >
              <span>مشاهده صفحه کامل نقشه راه</span>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>

          <LearningRoadmap courses={roadmapCourses} />
        </div>
      </section>

      {/* =========================================================================
          6. BOTTOM CALL TO ACTION
          ========================================================================= */}
      <section className="py-14 bg-white border-t border-slate-200/80">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center space-y-4">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight text-balance">
            یادگیری ساختاریافته برنامه‌نویسی وب را همین حالا آغاز کنید
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            تمام دوره‌ها و مستندات فنی تکا با ساختار شفاف، مثال‌های زنده و دسترسی رایگان در اختیار دانشجویان قرار دارد.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <Link
              href="/docs"
              className="inline-flex items-center gap-2 px-7 py-3 bg-[#042A1B] text-[#7AE36A] rounded-xl font-extrabold text-sm hover:bg-[#053723] transition-colors"
            >
              <BookOpen className="h-4 w-4" />
              <span>ورود به کاتالوگ مستندات</span>
            </Link>
            <Link
              href="/faq"
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-800 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors"
            >
              <span>سوالات متداول</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
