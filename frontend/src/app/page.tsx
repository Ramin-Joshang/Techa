import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  BookOpen,
  ArrowLeft,
  CheckCircle2,
  Code2,
  Layers,
  Search,
  Cpu,
  GraduationCap,
  Briefcase,
  FileCode2,
  Terminal,
  AlertTriangle,
  Compass,
} from 'lucide-react';
import {
  getHomepage,
  getPublishedCourses,
  getCourseOutline,
  isServiceUnavailable,
} from '../lib/server';
import DocCard from '../components/docs/DocCard';

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
  let isDatabaseError = false;
  let loadErrorMessage: string | null = null;

  const [homeRes, coursesRes] = await Promise.allSettled([
    getHomepage(),
    getPublishedCourses({ limit: 6 }),
  ]);

  if (homeRes.status === 'fulfilled') {
    homeConfig = homeRes.value;
  }

  if (coursesRes.status === 'fulfilled') {
    publishedCourses = coursesRes.value?.courses || [];
    totalCourses = coursesRes.value?.total || publishedCourses.length;
  } else {
    const err = coursesRes.reason;
    isDatabaseError = isServiceUnavailable(err);
    loadErrorMessage =
      err instanceof Error ? err.message : 'خطا در دریافت اطلاعات دوره‌ها';
  }

  // Strictly use configured featuredCourses when present; otherwise fall back to ordered published courses
  const showcaseCourses =
    homeConfig?.featuredCourses && homeConfig.featuredCourses.length > 0
      ? homeConfig.featuredCourses.slice(0, 6)
      : publishedCourses.slice(0, 6);

  // Determine a genuine interactive lesson entry link if available
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

  // Extract genuine topic tags from published courses
  const realTopicTags = Array.from(
    new Set(publishedCourses.flatMap((c) => c.tags || []))
  ).slice(0, 6);

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
          1. HERO SECTION — Deep Emerald Authority (#042A1B) + Real Search & Stats
          ========================================================================= */}
      <section className="relative bg-[#042A1B] text-white pt-12 pb-16 lg:pt-16 lg:pb-24 overflow-hidden border-b border-[#7AE36A]/20">
        {/* Subtle Architectural Grid & Soft Emerald Radial Light */}
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
          className="pointer-events-none absolute -top-24 right-1/4 w-[420px] h-[420px] bg-[#7AE36A]/10 rounded-full blur-3xl"
        />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Hero Copy & Search */}
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

              {/* Search Bar */}
              <div className="pt-1 max-w-xl mx-auto lg:mr-0 space-y-3">
                <form
                  action="/docs"
                  method="GET"
                  className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-[#031F14] p-2 rounded-2xl border border-[#7AE36A]/30 shadow-xl"
                >
                  <div className="relative flex-1 flex items-center">
                    <Search className="h-4 w-4 text-[#7AE36A] absolute right-3.5 pointer-events-none" />
                    <input
                      type="text"
                      name="q"
                      aria-label="جستجو در دوره‌ها و درس‌ها"
                      placeholder="جستجو در دوره‌ها و مباحث (مثال: React، TypeScript)..."
                      className="w-full bg-transparent text-white text-sm pr-10 pl-3 py-2.5 focus:outline-none placeholder:text-white/50"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#7AE36A] hover:bg-[#6acf5a] text-[#042A1B] font-extrabold text-sm rounded-xl transition-colors shrink-0 inline-flex items-center justify-center gap-1.5"
                  >
                    <span>جستجو</span>
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                </form>

                {/* Genuine Topic Quick Filters Derived from Published Courses */}
                {realTopicTags.length > 0 && (
                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 text-xs text-white/75">
                    <span className="text-[#7AE36A] font-semibold">مباحث موجود:</span>
                    {realTopicTags.map((tag) => (
                      <Link
                        key={tag}
                        href={`/docs?tag=${encodeURIComponent(tag)}`}
                        className="font-mono text-[11px] bg-white/5 hover:bg-[#7AE36A]/15 hover:text-[#7AE36A] border border-white/10 px-2.5 py-0.5 rounded-md transition-colors"
                        dir="ltr"
                      >
                        #{tag}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Primary CTAs */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-1">
                <Link
                  href={primaryCtaUrl}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#7AE36A] text-[#042A1B] font-extrabold text-sm rounded-xl hover:bg-[#6acf5a] transition-colors"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>{primaryCtaLabel}</span>
                </Link>

                <Link
                  href={firstInteractiveLessonUrl}
                  className="inline-flex items-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/15 text-white font-bold text-sm rounded-xl border border-white/20 transition-colors"
                >
                  <Code2 className="h-4 w-4 text-[#7AE36A]" />
                  <span>شروع مطالعه مستندات</span>
                </Link>
              </div>
            </div>

            {/* Hero Visual & Authentic DB Stats Strip */}
            <div className="lg:col-span-5 flex flex-col items-center gap-6">
              <div className="relative w-64 sm:w-80 h-64 sm:h-80">
                <Image
                  src="/images/aster.png"
                  alt="نشان پلتفرم آموزشی تکا"
                  fill
                  priority
                  className="object-contain drop-shadow-[0_18px_40px_rgba(0,0,0,0.45)]"
                />
              </div>

              {/* Only render real live MongoDB catalog statistics when available */}
              {realStats && realStats.totalCourses > 0 && (
                <div className="w-full max-w-md grid grid-cols-3 gap-2 rounded-2xl bg-[#031F14]/90 border border-[#7AE36A]/25 p-3.5 text-center tabular-nums">
                  <div>
                    <div className="text-lg sm:text-xl font-black text-[#7AE36A]">
                      {realStats.totalCourses}
                    </div>
                    <div className="text-[11px] text-white/70 font-medium">دوره منتشرشده</div>
                  </div>
                  <div className="border-x border-white/10">
                    <div className="text-lg sm:text-xl font-black text-white">
                      {realStats.totalLessons}
                    </div>
                    <div className="text-[11px] text-white/70 font-medium">درس ساختاریافته</div>
                  </div>
                  <div>
                    <div className="text-lg sm:text-xl font-black text-white">
                      {realStats.totalReadingTimeMinutes}
                      <span className="text-[11px] font-medium text-white/60 mr-0.5">دقیقه</span>
                    </div>
                    <div className="text-[11px] text-white/70 font-medium">محتوای آموزشی</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. PUBLISHED COURSES SHOWCASE (Strictly Authentic DB Records)
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
                <span>مشاهده همه ({totalCourses})</span>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {isDatabaseError || loadErrorMessage ? (
            <div className="bg-amber-50/80 rounded-2xl p-8 text-center border border-amber-200 text-amber-950 space-y-2 max-w-2xl mx-auto">
              <AlertTriangle className="h-9 w-9 text-amber-600 mx-auto" />
              <h3 className="text-base font-bold text-amber-950">
                {isDatabaseError
                  ? 'سرویس پایگاه داده در حال حاضر در دسترس نیست'
                  : 'خطا در بارگذاری دوره‌های آموزشی'}
              </h3>
              <p className="text-xs text-amber-800 leading-relaxed">
                {isDatabaseError
                  ? 'ارتباط با سرور داده‌ها برقرار نیست یا در حال بازیابی اتصال است.'
                  : loadErrorMessage}
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
                هنوز دوره‌ای در وضعیت منتشرشده ثبت نشده است
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                دوره‌ها پس از انتشار از پنل مدیریت در این بخش نمایش داده می‌شوند.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* =========================================================================
          3. PLATFORM CAPABILITIES (Real CMS Features + Architecture Highlights)
          ========================================================================= */}
      <section className="py-16 lg:py-20 bg-slate-50 border-y border-slate-200/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12 space-y-2">
            <span className="text-xs font-bold text-emerald-700">معماری و کیفیت محتوا</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              چرا یادگیری در مستندات تکا متفاوت است؟
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              ساختار محتوایی تکا به‌جای متن‌های پراکنده، هر موضوع را با کدهای تست‌شده، مثال‌های تعاملی و مسیر منظم ارائه می‌دهد.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {platformFeatures.map((feat, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-2xl border border-slate-200/90 hover:border-emerald-300 transition-colors space-y-3"
              >
                <div className="h-11 w-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                  {renderFeatureIcon(feat.icon)}
                </div>
                <h3 className="text-base font-extrabold text-slate-950">{feat.title}</h3>
                <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed">
                  {feat.description}
                </p>
              </div>
            ))}
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
                  <span>فهرست عناوین پویا برای پرش سریع میان بخش‌های هر درس</span>
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

            {/* Clean Code & Runtime Card Preview */}
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
          5. COMPREHENSIVE LEARNING ROADMAP
          ========================================================================= */}
      <section className="py-16 lg:py-20 bg-[#042A1B] text-white border-t border-[#7AE36A]/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-[#7AE36A]">
                <Compass className="h-4 w-4" />
                <span>مسیر گام‌به‌گام یادگیری</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                نقشه راه جامع مهندسی نرم‌افزار وب
              </h2>
              <p className="text-white/75 text-sm leading-relaxed">
                از مبانی استاندارد فرانت‌اند تا معماری بک‌اند و استقرار نرم‌افزار در محیط واقعی.
              </p>
            </div>
            <Link
              href="/roadmap"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#7AE36A] text-[#042A1B] rounded-xl font-extrabold text-xs sm:text-sm hover:bg-[#6acf5a] transition-colors shrink-0 self-start md:self-auto"
            >
              <span>مشاهده نقشه راه کامل</span>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
            {[
              {
                step: '01',
                title: 'مبانی و فرانت‌اند پایه',
                desc: 'تسلط بر HTML5 معنایی، CSS3 واکنش‌گرا، فلکس‌باکس، گرید و جاوااسکریپت مدرن.',
                stack: 'HTML · CSS · Modern JS',
              },
              {
                step: '02',
                title: 'فریم‌ورک‌های مدرن رابط کاربری',
                desc: 'طراحی کامپوننت‌های پیشرفته با React 19، TypeScript، Next.js App Router و Tailwind.',
                stack: 'React 19 · TypeScript · Next.js',
              },
              {
                step: '03',
                title: 'مهندسی بک‌اند و داده',
                desc: 'پیاده‌سازی سرویس‌های مقیاس‌پذیر با Node.js، Express 5، اعتبارسنجی Zod و MongoDB.',
                stack: 'Node.js · Express 5 · MongoDB',
              },
              {
                step: '04',
                title: 'پروژه عملی و استقرار',
                desc: 'تست‌نویسی، مستندسازی، کنترل کیفیت کد و استقرار سامانه‌های واقعی در تولید.',
                stack: 'Testing · Security · Deploy',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="bg-[#053723] border border-[#7AE36A]/20 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-[#7AE36A]/60 transition-colors"
              >
                <div className="space-y-2">
                  <span className="text-2xl font-black text-[#7AE36A]/50 font-mono tabular-nums block">
                    {item.step}
                  </span>
                  <h3 className="text-base font-extrabold text-white">{item.title}</h3>
                  <p className="text-xs text-white/75 leading-relaxed">{item.desc}</p>
                </div>
                <div className="text-[11px] text-[#7AE36A] font-mono pt-2 border-t border-white/10" dir="ltr">
                  {item.stack}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-[#031F14] rounded-2xl p-5 sm:p-8 border border-[#7AE36A]/20">
            <div className="relative w-full max-w-4xl mx-auto h-56 sm:h-80 rounded-xl overflow-hidden">
              <Image
                src="/images/Roadmap.png"
                alt="نقشه راه مهندسی نرم‌افزار تکا"
                fill
                className="object-contain"
              />
            </div>
          </div>
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
