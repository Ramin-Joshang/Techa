import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  BookOpen,
  ArrowLeft,
  CheckCircle2,
  Code2,
  Layers,
  Sparkles,
  Search,
  Cpu,
  GraduationCap,
  Briefcase,
  FileCode2,
  Terminal,
} from 'lucide-react';
import { getHomepage, getPublishedCourses } from '../lib/server';
import DocCard from '../components/docs/DocCard';

export const revalidate = 60;

export async function generateMetadata() {
  try {
    const page = await getHomepage();
    if (page?.seo) {
      return {
        title: page.seo.metaTitle || 'مرجع تخصصی آموزش برنامه‌نویسی وب | تکا',
        description:
          page.seo.metaDescription ||
          'آموزش جامع فرانت‌اند و بک‌اند با استانداردهای مدرن وب به زبان فارسی.',
        keywords: ['آموزش برنامه‌نویسی', 'تکا', 'TECHA', 'ری‌اکت', 'نکست جی‌اس'],
        robots: 'index, follow',
      };
    }
  } catch {
    // Graceful fallback
  }

  return {
    title: 'تکا | مرجع تخصصی آموزش و مستندات برنامه‌نویسی وب',
    description: 'آموزش جامع و پروژه محور برنامه‌نویسی با استانداردهای مدرن وب به زبان فارسی.',
  };
}

export default async function HomePage() {
  const [coursesResult] = await Promise.all([
    getPublishedCourses({ limit: 6 }).catch(() => ({
      courses: [],
      total: 0,
      page: 1,
      limit: 6,
      totalPages: 1,
    })),
  ]);

  const courses = coursesResult?.courses || [];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-gray-900 overflow-hidden">
      {/* =========================================================================
          1. AUTHENTIC HERO / BANNER SECTION (Dark Emerald #042A1B)
          ========================================================================= */}
      <section className="relative bg-[#042A1B] text-white pt-12 pb-24 lg:pt-16 lg:pb-32 overflow-hidden border-b border-[#7AE36A]/20">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 right-10 w-96 h-96 bg-[#7AE36A]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-5 xl:px-20 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Right Column: Hero Content & Search */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-right">
              {/* Authentic Tagline Badge */}
              <div className="inline-flex items-center gap-2 bg-[#F6DC66] text-[#042A1B] px-5 py-2.5 rounded-2xl font-black text-sm sm:text-base shadow-lg shadow-black/20">
                <Sparkles className="h-4 w-4 text-[#042A1B]" />
                <span>اعتبار بگیر، مسلط شو، درآمد کسب کن</span>
              </div>

              {/* Headline */}
              <div className="space-y-3">
                <h1 className="text-3xl sm:text-4xl xl:text-5xl font-black tracking-tight leading-tight text-white">
                  پلتفرم آموزشی و کارآموزی تکا
                </h1>
                <div className="relative w-48 sm:w-64 h-3 mx-auto lg:mr-0">
                  <Image
                    src="/images/line.svg"
                    alt="خط تزیینی"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>

              {/* Description */}
              <p className="text-white/80 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto lg:mr-0 text-justify">
                مجموعه‌ای در بدنه دانشگاه، با هدف توانمندسازی دانشجویان و علاقه‌مندان برای ورود به بازار کار و توسعه تخصصی سامانه‌های نرم‌افزاری بر پایه جدیدترین استانداردهای وب مدرن.
              </p>

              {/* Interactive Search & Explore Box in Hero */}
              <div className="pt-2 max-w-xl mx-auto lg:mr-0">
                <form
                  action="/docs"
                  method="GET"
                  className="flex flex-col sm:flex-row items-center gap-2.5 bg-white/10 p-2 rounded-2xl backdrop-blur-md border border-[#7AE36A]/30 shadow-xl"
                >
                  <div className="relative w-full flex items-center">
                    <Search className="h-5 w-5 text-[#7AE36A] absolute right-3 pointer-events-none" />
                    <input
                      type="text"
                      name="q"
                      placeholder="جستجو در دوره‌ها و مباحث (مثال: React، TypeScript)..."
                      className="w-full bg-[#053723] text-white text-sm pr-11 pl-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:border-[#7AE36A] placeholder-white/50"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-6 py-3 bg-[#7AE36A] hover:bg-[#6acf5a] text-[#042A1B] font-bold text-sm rounded-xl transition-all shadow-md shrink-0 flex items-center justify-center gap-2"
                  >
                    <span>جستجو</span>
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                </form>

                {/* Popular Topics Quick Links */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-3 text-xs text-white/70">
                  <span className="text-[#7AE36A] font-semibold">مباحث پرطرفدار:</span>
                  <Link href="/docs?q=react" className="hover:text-[#7AE36A] transition-colors underline underline-offset-4">ری‌اکت (React 19)</Link>
                  <span>·</span>
                  <Link href="/docs?q=next" className="hover:text-[#7AE36A] transition-colors underline underline-offset-4">نکست‌جی‌اس 16</Link>
                  <span>·</span>
                  <Link href="/docs?q=typescript" className="hover:text-[#7AE36A] transition-colors underline underline-offset-4">تایپ‌اسکریپت</Link>
                  <span>·</span>
                  <Link href="/docs?q=node" className="hover:text-[#7AE36A] transition-colors underline underline-offset-4">نود ۲۴ و اکسپرس</Link>
                  <span>·</span>
                  <Link href="/docs?q=mongo" className="hover:text-[#7AE36A] transition-colors underline underline-offset-4">مونگو دی‌بی</Link>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  href="/docs"
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-[#7AE36A] text-[#042A1B] font-black text-sm rounded-xl hover:bg-[#6acf5a] transition-all shadow-lg shadow-[#7AE36A]/20"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>مشاهده کاتالوگ دوره‌ها</span>
                </Link>

                <a
                  href="/api-docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-white/10 hover:bg-white/15 text-white font-bold text-sm rounded-xl border border-white/20 transition-all"
                >
                  <Terminal className="h-4 w-4 text-[#7AE36A]" />
                  <span>مستندات فنی Swagger</span>
                </a>
              </div>
            </div>

            {/* Left Column: Authentic Aster Visual Graphic */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-72 sm:w-96 h-72 sm:h-96">
                <div className="absolute inset-0 bg-[#7AE36A]/20 rounded-full blur-2xl animate-pulse" />
                <Image
                  src="/images/aster.png"
                  alt="نشان پلتفرم تکا"
                  fill
                  priority
                  className="object-contain relative z-10 drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. PUBLISHED COURSES SHOWCASE (Real MongoDB Data)
          ========================================================================= */}
      <section className="py-20 lg:py-24 bg-white">
        <div className="container mx-auto px-5 xl:px-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg mb-2">
                <BookOpen className="h-3.5 w-3.5" />
                <span>دوره‌های فعال آموزشی</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                مسیرهای آموزشی و مستندات تخصصی تکا
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                سرفصل‌های جامع مهندسی فرانت‌اند و بک‌اند با بلوک‌های محتوایی ساختاریافته.
              </p>
            </div>

            <Link
              href="/docs"
              className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
            >
              <span>مشاهده همه دوره‌ها ({coursesResult?.total || courses.length})</span>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>

          {/* Courses Grid */}
          {courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <DocCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-3xl p-12 text-center border border-dashed border-gray-300">
              <BookOpen className="h-10 w-10 text-gray-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-gray-800">هیچ دوره‌ای در حال حاضر منتشر نشده است</h3>
              <p className="text-xs text-gray-500 mt-1">به زودی دوره‌های جدید به سامانه اضافه خواهند شد.</p>
            </div>
          )}
        </div>
      </section>

      {/* =========================================================================
          3. COMPREHENSIVE LEARNING ROADMAP (نقشه راه جامع توسعه وب)
          ========================================================================= */}
      <section className="py-20 lg:py-24 bg-[#042A1B] text-white border-y border-[#7AE36A]/20">
        <div className="container mx-auto px-5 xl:px-20">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#7AE36A] bg-[#053723] px-3.5 py-1.5 rounded-full border border-[#7AE36A]/30">
              <Layers className="h-3.5 w-3.5" />
              <span>مسیر گام‌به‌گام یادگیری</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              نقشه راه جامع تبدیل شدن به مهندس نرم‌افزار وب
            </h2>
            <p className="text-white/70 text-sm sm:text-base leading-relaxed">
              از صفر مطلق تا استقرار در مقیاس سازمانی، گام‌به‌گام با استانداردهای دانشگاهی و صنعتی.
            </p>
          </div>

          {/* 4-Step Architecture Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {/* Step 1 */}
            <div className="bg-[#053723] border border-[#7AE36A]/25 rounded-2xl p-6 relative group hover:border-[#7AE36A] transition-all">
              <div className="text-3xl font-black text-[#7AE36A]/40 mb-3 font-mono">01</div>
              <h3 className="text-lg font-bold text-white mb-2">فرانت‌اند پایه</h3>
              <p className="text-xs text-white/70 leading-relaxed mb-4">
                تسلط عمیق بر HTML5 معنایی، CSS3 واکنش‌گرا، فلکس‌باکس، گرید و جاوااسکریپت مدرن ES6+.
              </p>
              <div className="text-[11px] text-[#7AE36A] font-mono">HTML · CSS · Modern JS</div>
            </div>

            {/* Step 2 */}
            <div className="bg-[#053723] border border-[#7AE36A]/25 rounded-2xl p-6 relative group hover:border-[#7AE36A] transition-all">
              <div className="text-3xl font-black text-[#7AE36A]/40 mb-3 font-mono">02</div>
              <h3 className="text-lg font-bold text-white mb-2">فریم‌ورک‌های مدرن</h3>
              <p className="text-xs text-white/70 leading-relaxed mb-4">
                توسعه کامپوننت‌های پیشرفته با React 19، رندرینگ سرور با Next.js 16 App Router و استایل‌دهی سریع با Tailwind.
              </p>
              <div className="text-[11px] text-[#7AE36A] font-mono">React 19 · Next.js 16 · Tailwind</div>
            </div>

            {/* Step 3 */}
            <div className="bg-[#053723] border border-[#7AE36A]/25 rounded-2xl p-6 relative group hover:border-[#7AE36A] transition-all">
              <div className="text-3xl font-black text-[#7AE36A]/40 mb-3 font-mono">03</div>
              <h3 className="text-lg font-bold text-white mb-2">مهندسی بک‌اند</h3>
              <p className="text-xs text-white/70 leading-relaxed mb-4">
                طراحی معماری RESTful با Express 5 و Node.js 24، قراردادهای داده با Zod 4 و مدل‌سازی پایگاه‌داده با MongoDB Atlas.
              </p>
              <div className="text-[11px] text-[#7AE36A] font-mono">Node 24 · Express 5 · MongoDB</div>
            </div>

            {/* Step 4 */}
            <div className="bg-[#053723] border border-[#7AE36A]/25 rounded-2xl p-6 relative group hover:border-[#7AE36A] transition-all">
              <div className="text-3xl font-black text-[#7AE36A]/40 mb-3 font-mono">04</div>
              <h3 className="text-lg font-bold text-white mb-2">کارآموزی و بازار کار</h3>
              <p className="text-xs text-white/70 leading-relaxed mb-4">
                ورود به پروژه‌های تیمی، استقرار روی سرور با PM2 و IIS، کنترل کیفیت کد و آمادگی کامل برای استخدام.
              </p>
              <div className="text-[11px] text-[#7AE36A] font-mono">Deployment · CI/CD · Portfolio</div>
            </div>
          </div>

          {/* Authentic Roadmap Image Preview */}
          <div className="bg-[#053723]/60 rounded-3xl p-6 sm:p-10 border border-[#7AE36A]/30 text-center">
            <div className="relative w-full max-w-4xl mx-auto h-64 sm:h-96 rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="/images/Roadmap.png"
                alt="نقشه راه مهندسی نرم‌افزار تکا"
                fill
                className="object-contain"
              />
            </div>
            <div className="mt-6 flex justify-center">
              <Link
                href="/docs"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#7AE36A] text-[#042A1B] rounded-xl font-bold text-sm shadow-md hover:bg-[#6acf5a] transition-all"
              >
                <span>مشاهده سرفصل‌های نقشه راه در کاتالوگ</span>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. PLATFORM ADVANTAGES & FEATURES (مزایای پلتفرم آموزشی تکا)
          ========================================================================= */}
      <section className="py-20 lg:py-24 bg-white">
        <div className="container mx-auto px-5 xl:px-20">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg">
              <Sparkles className="h-3.5 w-3.5" />
              <span>تمایز و استانداردهای تکا</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              چرا یادگیری با تکا متفاوت و اثربخش است؟
            </h2>
            <p className="text-gray-600 text-sm">
              معماری مدرن آموزشی متناسب با نیازهای واقعی شرکت‌های نرم‌افزاری تراز اول.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-gray-100 hover:border-emerald-300 hover:shadow-md transition-all">
              <div className="h-12 w-12 rounded-xl bg-emerald-600/10 text-emerald-600 flex items-center justify-center mb-5">
                <FileCode2 className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">۱۳ بلوک محتوایی ساختاریافته</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                محتوای هر درس به صورت کاملاً ساختاریافته همراه با قطعه کدهای تفکیک شده، جداول مقایسه‌ای و نمونه کدهای تعاملی ارائه می‌شود.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-gray-100 hover:border-emerald-300 hover:shadow-md transition-all">
              <div className="h-12 w-12 rounded-xl bg-emerald-600/10 text-emerald-600 flex items-center justify-center mb-5">
                <Cpu className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">پشته فناوری روز دنیا</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                آموزش‌ها کامپایل شده بر پایه Node.js 24 LTS، React 19، Next.js 16 و Express 5 بدون تکیه بر پکیج‌های منسوخ هستند.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-gray-100 hover:border-emerald-300 hover:shadow-md transition-all">
              <div className="h-12 w-12 rounded-xl bg-emerald-600/10 text-emerald-600 flex items-center justify-center mb-5">
                <GraduationCap className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">پشتوانه دانشگاهی و آکادمیک</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                طراحی شده در بدنه دانشگاه برای ارائه عمیق‌ترین مفاهیم علوم کامپیوتر و مهندسی وب با بیانی سلیس و کاربردی.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-gray-100 hover:border-emerald-300 hover:shadow-md transition-all">
              <div className="h-12 w-12 rounded-xl bg-emerald-600/10 text-emerald-600 flex items-center justify-center mb-5">
                <Briefcase className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">آماده‌سازی برای بازار کار</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                تمرکز بر چالش‌های دنیای واقعی، تحلیل معماری پروژه‌ها و کارآموزی برای تسهیل فرآیند جذب در شرکت‌های معتبر.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. DEVELOPER EXPERIENCE & API HUB (OpenAPI 3.1)
          ========================================================================= */}
      <section className="py-20 lg:py-24 bg-slate-900 text-white">
        <div className="container mx-auto px-5 xl:px-20">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-5">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-[#7AE36A] bg-[#7AE36A]/10 px-3 py-1 rounded-md border border-[#7AE36A]/20">
                <Code2 className="h-3.5 w-3.5" />
                <span>OpenAPI 3.1 & Developer Experience</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                پلتفرم باز و مستندسازی دقیق برای توسعه‌دهندگان
              </h2>
              <p className="text-gray-300 text-sm leading-relaxed text-justify">
                سرویس بک‌اند تکا از معماری شفاف RESTful و مشخصات استاندارد OpenAPI 3.1 بهره می‌برد. کلیه مدل‌ها، بلوک‌های محتوا و قراردادهای داده از طریق Swagger در دسترس توسعه‌دهندگان است.
              </p>

              <div className="space-y-2.5 text-xs text-gray-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#7AE36A]" />
                  <span>تضمین نوع داده با Zod 4 و TypeScript 5.7</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#7AE36A]" />
                  <span>درگاه داده‌های عمومی با رندرینگ بدون وقفه سرور (SSR)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#7AE36A]" />
                  <span>استقرار مقاوم و پایدار تحت فرآیندهای PM2 و معکوس IIS ARR</span>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap gap-3">
                <a
                  href="/api-docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 bg-[#7AE36A] text-[#042A1B] rounded-xl font-bold text-xs hover:bg-[#6acf5a] transition-all flex items-center gap-2"
                >
                  <Terminal className="h-4 w-4" />
                  <span>مشاهده رابط کاربری Swagger</span>
                </a>
                <a
                  href="/api-docs.json"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 bg-white/10 hover:bg-white/15 text-white rounded-xl font-bold text-xs border border-white/20 transition-all"
                >
                  مشخصات JSON خام
                </a>
              </div>
            </div>

            {/* Code Terminal Box */}
            <div className="lg:col-span-6 bg-slate-950 rounded-2xl p-5 border border-slate-800 shadow-2xl font-mono text-xs overflow-x-auto text-left" dir="ltr">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3 text-slate-500">
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-500/80" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                  <div className="h-3 w-3 rounded-full bg-green-500/80" />
                </div>
                <span className="text-[11px] text-emerald-400">techa-public-api.ts</span>
              </div>
              <pre className="text-slate-300 leading-relaxed">
{`// Greenfield Architecture Stack
export const TECHA_STACK = {
  runtime: 'Node.js 24 LTS',
  framework: 'Next.js 16.4.5 (React 19)',
  backend: 'Express 5.3.0',
  database: 'MongoDB Atlas (Mongoose 9)',
  validation: 'Zod 4.6.7',
  ports: { frontend: 3000, backend: 5000 },
  endpoints: [
    'GET /api/v1/public/home',
    'GET /api/v1/public/courses',
    'GET /api/v1/public/courses/:courseSlug',
    'GET /api/v1/public/courses/:courseSlug/outline',
    'GET /api/v1/public/courses/:courseSlug/lessons/:lessonSlug'
  ]
};`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. BOTTOM CALL TO ACTION
          ========================================================================= */}
      <section className="py-16 bg-[#042A1B] text-white border-t border-[#7AE36A]/20">
        <div className="container mx-auto px-5 xl:px-20 text-center space-y-6 max-w-3xl">
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            مسیر حرفه‌ای برنامه‌نویسی وب را از همین امروز آغاز کنید
          </h2>
          <p className="text-white/80 text-sm sm:text-base leading-relaxed">
            مستندات و دوره‌های تکا را به صورت رایگان مطالعه کنید و دانش خود را به سطح استانداردهای جهانی برسانید.
          </p>
          <div className="pt-2 flex justify-center gap-4">
            <Link
              href="/docs"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#7AE36A] text-[#042A1B] rounded-full font-black text-sm hover:bg-[#6acf5a] transition-all shadow-xl shadow-[#7AE36A]/30 hover:scale-102"
            >
              <BookOpen className="h-4 w-4" />
              <span>مشاهده همه دوره‌ها و سرفصل‌ها</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
