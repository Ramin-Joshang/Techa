import React from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Compass } from 'lucide-react';
import { getPublishedCourses } from '../../lib/server';
import DocCard from '../../components/docs/DocCard';
import LearningRoadmap from '../../components/roadmap/LearningRoadmap';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'نقشه راه یادگیری و کارآموزی مهندسی وب | TECHA',
  description:
    'مسیر گام‌به‌گام تبدیل شدن به مهندس نرم‌افزار وب در پلتفرم تکا؛ از HTML، CSS، JavaScript، Tailwind و React تا کارآموزی، استخدام و فریلنسری.',
};

export default async function RoadmapPage() {
  let courses: Awaited<ReturnType<typeof getPublishedCourses>>['courses'] = [];
  try {
    const res = await getPublishedCourses({ limit: 24 });
    courses = res?.courses || [];
  } catch {
    courses = [];
  }

  return (
    <div className="w-full bg-slate-50 text-gray-900">
      {/* Interactive 7-Stage Roadmap Hero */}
      <section className="bg-[#042A1B] text-white py-14 sm:py-18 border-b border-[#7AE36A]/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-4 max-w-3xl">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-[#7AE36A]">
                <Compass className="h-4 w-4" />
                <span>مسیر ساختاریافته آموزش تا بازار کار</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight text-white text-balance">
                نقشه راه جامع مهندسی نرم‌افزار وب
              </h1>
              <p className="text-sm sm:text-base text-white/80 leading-relaxed">
                یادگیری بدون نقشه راه باعث سردرگمی میان ابزارهای پراکنده می‌شود. در تکا، مسیر یادگیری از مبانی وب تا پروژه‌های کارآموزی و بازار کار را در ۷ گام پیوسته و متصل به دوره‌های واقعی پلتفرم طراحی کرده‌ایم.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 shrink-0">
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

          <LearningRoadmap courses={courses} />
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.slice(0, 6).map((course) => (
                <DocCard key={course.id} course={course} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
