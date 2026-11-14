'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { CoursePublicDto } from '@techa/shared';
import {
  ArrowLeft,
  BookOpen,
  Briefcase,
  CheckCircle2,
  Clock,
  Code2,
  Cpu,
  FileCode2,
  GraduationCap,
  Layers,
  Palette,
  Sparkles,
} from 'lucide-react';
import { formatPersianCount, formatReadingDuration } from '../../lib/format-duration';

export interface RoadmapStageConfig {
  id: string;
  step: string;
  labelEn: string;
  titleFa: string;
  subtitle: string;
  description: string;
  skills: string[];
  matchKeywords: string[];
  fallbackHref: string;
  fallbackCtaLabel: string;
  icon: 'html' | 'css' | 'js' | 'tailwind' | 'react' | 'internship' | 'career';
}

const ROADMAP_STAGES: RoadmapStageConfig[] = [
  {
    id: 'html',
    step: '۰۱',
    labelEn: 'HTML',
    titleFa: 'ساختار معنایی وب',
    subtitle: 'نقطه شروع مهندسی فرانت‌اند',
    description:
      'تسلط بر تگ‌های معنایی HTML5، فرم‌های استاندارد، ساختار سند و اصول دسترس‌پذیری (Accessibility) و سئو فنی پایه.',
    skills: ['HTML5 Semantic Tags', 'Forms & Validation', 'SEO Structure', 'Accessibility (ARIA)'],
    matchKeywords: ['html'],
    fallbackHref: '/docs?level=beginner',
    fallbackCtaLabel: 'شروع از دوره‌های مقدماتی',
    icon: 'html',
  },
  {
    id: 'css',
    step: '۰۲',
    labelEn: 'CSS',
    titleFa: 'طراحی و چیدمان ریسپانسیو',
    subtitle: 'معماری بصری و واکنش‌گرا',
    description:
      'پیاده‌سازی چیدمان‌های دقیق با Flexbox و CSS Grid، متغیرهای CSS، انیمیشن‌های روان و طراحی سازگار با موبایل و دسکتاپ.',
    skills: ['Flexbox & CSS Grid', 'Responsive Breakpoints', 'CSS Variables', 'Transitions & Keyframes'],
    matchKeywords: ['css'],
    fallbackHref: '/docs?level=beginner',
    fallbackCtaLabel: 'مشاهده مستندات CSS',
    icon: 'css',
  },
  {
    id: 'javascript',
    step: '۰۳',
    labelEn: 'JavaScript',
    titleFa: 'منطق تعاملی و برنامه‌نویسی وب',
    subtitle: 'هسته پویاسازی صفحات وب',
    description:
      'درک عمیق ES6+، کار با DOM، مدیریت رویدادها، برنامه‌نویسی ناهمگام (Promise و Async/Await) و ارتباط با APIهای واقعی.',
    skills: ['ES6+ & Modules', 'DOM & Events', 'Async / Await & Fetch', 'Clean State Logic'],
    matchKeywords: ['javascript', 'js', 'typescript'],
    fallbackHref: '/docs',
    fallbackCtaLabel: 'مرور دوره‌های جاوااسکریپت',
    icon: 'js',
  },
  {
    id: 'tailwind',
    step: '۰۴',
    labelEn: 'Tailwind',
    titleFa: 'طراحی سریع رابط کاربری مدرن',
    subtitle: 'سیستم طراحی Utility-First',
    description:
      'ساخت رابط‌های کاربری حرفه‌ای با سرعت بالا، شخصی‌سازی توکن‌های طراحی در Tailwind CSS و پیاده‌سازی دیزاین‌سیستم‌های تمیز.',
    skills: ['Utility-First Workflow', 'Design Tokens & Themes', 'Responsive Grids', 'Component Patterns'],
    matchKeywords: ['tailwind', 'css'],
    fallbackHref: '/docs',
    fallbackCtaLabel: 'دوره‌های طراحی رابط کاربری',
    icon: 'tailwind',
  },
  {
    id: 'react',
    step: '۰۵',
    labelEn: 'React',
    titleFa: 'معماری کامپوننتی مدرن',
    subtitle: 'توسعه اپلیکیشن‌های مقیاس‌پذیر',
    description:
      'ساخت وب‌اپلیکیشن‌های مدرن با React، مدیریت State و Hooks، تایپ‌اسکریپت و آمادگی برای فریم‌ورک‌هایی مثل Next.js.',
    skills: ['Components & Props', 'Hooks & Effects', 'Routing & Data Flow', 'TypeScript Integration'],
    matchKeywords: ['react', 'next', 'typescript'],
    fallbackHref: '/docs',
    fallbackCtaLabel: 'مشاهده مسیر React و TypeScript',
    icon: 'react',
  },
  {
    id: 'internship',
    step: '۰۶',
    labelEn: 'Internship',
    titleFa: 'کارآموزی و پروژه تیمی',
    subtitle: 'تجربه محیط واقعی تولید کد',
    description:
      'ورود به تیم‌های پروژه، کار با Git Flow، نوشتن کد تمیز و تست‌پذیر، دریافت بازخورد مهندسی (Code Review) و کار تیمی چابک.',
    skills: ['Git & Pull Requests', 'Real Team Sprints', 'Code Review Standards', 'API Integration'],
    matchKeywords: ['git', 'node', 'sql', 'backend'],
    fallbackHref: '/contact',
    fallbackCtaLabel: 'درخواست ارزیابی کارآموزی',
    icon: 'internship',
  },
  {
    id: 'career',
    step: '۰۷',
    labelEn: 'Job & Freelance',
    titleFa: 'استخدام و فریلنسری',
    subtitle: 'آمادگی بازار کار و پروژه‌های مستقل',
    description:
      'تدوین پورتفولیو فنی قابل استناد، آمادگی برای مصاحبه‌های تخصصی فرانت‌اند/فول‌استک، برآورد پروژه و عقد قراردادهای حرفه‌ای.',
    skills: ['Technical Portfolio', 'Interview Readiness', 'Project Estimation', 'Client Delivery'],
    matchKeywords: [],
    fallbackHref: '/contact',
    fallbackCtaLabel: 'مشاوره مسیر شغلی و همکاری',
    icon: 'career',
  },
];

function StageIcon({ icon, className }: { icon: RoadmapStageConfig['icon']; className?: string }) {
  switch (icon) {
    case 'html':
      return <FileCode2 className={className} />;
    case 'css':
      return <Palette className={className} />;
    case 'js':
      return <Code2 className={className} />;
    case 'tailwind':
      return <Layers className={className} />;
    case 'react':
      return <Cpu className={className} />;
    case 'internship':
      return <GraduationCap className={className} />;
    case 'career':
      return <Briefcase className={className} />;
  }
}

function matchCoursesForStage(
  stage: RoadmapStageConfig,
  courses: CoursePublicDto[]
): CoursePublicDto[] {
  if (!stage.matchKeywords.length || !courses.length) return [];
  const scored = courses
    .map((course) => {
      const haystack = `${course.slug} ${course.title} ${(course.tags || []).join(' ')}`.toLowerCase();
      let score = 0;
      for (const kw of stage.matchKeywords) {
        if (course.slug.toLowerCase().includes(kw)) score += 3;
        else if ((course.tags || []).some((t) => t.toLowerCase().includes(kw))) score += 2;
        else if (haystack.includes(kw)) score += 1;
      }
      return { course, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, 3).map((item) => item.course);
}

interface LearningRoadmapProps {
  courses: CoursePublicDto[];
}

export default function LearningRoadmap({ courses }: LearningRoadmapProps) {
  const [activeId, setActiveId] = useState<string>(ROADMAP_STAGES[0].id);

  const stageMatches = useMemo(() => {
    const map: Record<string, CoursePublicDto[]> = {};
    for (const stage of ROADMAP_STAGES) {
      map[stage.id] = matchCoursesForStage(stage, courses);
    }
    return map;
  }, [courses]);

  const activeStage =
    ROADMAP_STAGES.find((s) => s.id === activeId) || ROADMAP_STAGES[0];
  const activeCourses = stageMatches[activeStage.id] || [];

  return (
    <div className="space-y-7">
      {/* 7-Stage Connected Track */}
      <div className="relative">
        <div
          aria-hidden="true"
          className="hidden lg:block absolute top-1/2 left-8 right-8 h-px bg-gradient-to-l from-[#7AE36A]/40 via-[#7AE36A]/25 to-[#7AE36A]/40 -translate-y-1/2 pointer-events-none"
        />

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 relative z-10">
          {ROADMAP_STAGES.map((stage) => {
            const isSelected = stage.id === activeStage.id;
            const matchedCount = stageMatches[stage.id]?.length ?? 0;

            return (
              <button
                key={stage.id}
                type="button"
                onClick={() => setActiveId(stage.id)}
                aria-pressed={isSelected}
                className={`group text-right rounded-2xl p-3.5 border transition-all duration-200 flex flex-col justify-between gap-3 min-h-[118px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7AE36A] ${
                  isSelected
                    ? 'bg-[#7AE36A] text-[#042A1B] border-[#7AE36A] shadow-lg shadow-[#7AE36A]/15 -translate-y-0.5'
                    : 'bg-[#053723]/90 hover:bg-[#06422A] text-white border-[#7AE36A]/20 hover:border-[#7AE36A]/60'
                }`}
              >
                <div className="flex items-center justify-between gap-2 w-full">
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-xl border transition-colors ${
                      isSelected
                        ? 'bg-[#042A1B] text-[#7AE36A] border-[#042A1B]'
                        : 'bg-[#032115] text-[#7AE36A] border-[#7AE36A]/25'
                    }`}
                  >
                    <StageIcon icon={stage.icon} className="w-4 h-4" />
                  </span>
                  <span
                    className={`text-xs font-mono font-black tabular-nums ${
                      isSelected ? 'text-[#042A1B]/70' : 'text-[#7AE36A]/55'
                    }`}
                  >
                    {stage.step}
                  </span>
                </div>

                <div className="space-y-1 w-full">
                  <div
                    dir="ltr"
                    className={`text-xs sm:text-[13px] font-extrabold font-mono text-left truncate ${
                      isSelected ? 'text-[#042A1B]' : 'text-white'
                    }`}
                  >
                    {stage.labelEn}
                  </div>
                  <div
                    className={`text-[11px] font-semibold line-clamp-1 ${
                      isSelected ? 'text-[#042A1B]/85' : 'text-white/75'
                    }`}
                  >
                    {stage.titleFa}
                  </div>
                </div>

                <div
                  className={`text-[10px] font-medium tabular-nums pt-1 border-t w-full ${
                    isSelected
                      ? 'border-[#042A1B]/15 text-[#042A1B]/80'
                      : 'border-white/10 text-[#7AE36A]/85'
                  }`}
                >
                  {matchedCount > 0
                    ? `${formatPersianCount(matchedCount)} دوره مرتبط`
                    : stage.id === 'internship' || stage.id === 'career'
                      ? 'مسیر عملی و شغلی'
                      : 'مسیر پیشنهادی'}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Stage Spotlight Panel */}
      <div className="rounded-3xl bg-[#031F14] border border-[#7AE36A]/25 p-5 sm:p-7 lg:p-8 shadow-2xl">
        <div className="grid lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Stage Explanation */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#7AE36A]/15 text-[#7AE36A] border border-[#7AE36A]/30 shrink-0">
                <StageIcon icon={activeStage.icon} className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 text-xs text-[#7AE36A] font-bold">
                  <span>گام {activeStage.step} از ۰۷</span>
                  <span aria-hidden="true">·</span>
                  <span dir="ltr" className="font-mono">
                    {activeStage.labelEn}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white mt-0.5">
                  {activeStage.titleFa}
                </h3>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
              {activeStage.description}
            </p>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {activeStage.skills.map((skill) => (
                <li
                  key={skill}
                  className="flex items-center gap-2 text-xs text-white/85"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#7AE36A] shrink-0" />
                  <span dir="ltr" className="font-mono text-[11.5px]">
                    {skill}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Linked Real Published Courses for This Stage */}
          <div className="lg:col-span-6 bg-[#053723]/75 rounded-2xl border border-[#7AE36A]/20 p-4 sm:p-5 space-y-3.5">
            <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#7AE36A]">
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>
                  {activeCourses.length > 0
                    ? 'دوره‌های منتشرشده تکا برای این مرحله'
                    : activeStage.subtitle}
                </span>
              </div>
              {activeCourses.length > 0 && (
                <span className="text-[11px] text-white/60 tabular-nums">
                  {formatPersianCount(activeCourses.length)} دوره فعال
                </span>
              )}
            </div>

            {activeCourses.length > 0 ? (
              <div className="space-y-2.5">
                {activeCourses.map((course) => {
                  const duration = formatReadingDuration(
                    course.stats?.estimatedReadingTimeMinutes
                  );
                  return (
                    <Link
                      key={course.id}
                      href={`/docs/${course.slug}`}
                      className="group flex items-center justify-between gap-3 rounded-xl bg-[#042A1B]/90 hover:bg-[#042A1B] border border-white/10 hover:border-[#7AE36A]/60 p-3.5 transition-all"
                    >
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-[#7AE36A] shrink-0" />
                          <span className="text-xs sm:text-sm font-bold text-white group-hover:text-[#7AE36A] transition-colors truncate">
                            {course.title}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-white/65 tabular-nums pr-6">
                          <span>{formatPersianCount(course.stats?.totalLessons ?? 0)} درس</span>
                          {duration && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="inline-flex items-center gap-1">
                                <Clock className="w-3 h-3 text-[#7AE36A]/80" />
                                <span>{duration}</span>
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-[#7AE36A] shrink-0 group-hover:-translate-x-0.5 transition-transform">
                        <span className="hidden sm:inline">مشاهده</span>
                        <ArrowLeft className="w-4 h-4" />
                      </span>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl bg-[#042A1B]/80 border border-white/10 p-4 space-y-3">
                <p className="text-xs text-white/80 leading-relaxed">
                  {activeStage.id === 'internship' || activeStage.id === 'career'
                    ? 'پس از تکمیل دوره‌های پایه تا React، می‌توانید از طریق صفحه تماس با تیم فنی تکا برای ارزیابی کارآموزی و پروژه‌های تیمی اقدام کنید.'
                    : 'سرفصل‌های مرتبط با این گام از طریق کاتالوگ مستندات قابل مشاهده و مطالعه است.'}
                </p>
                <Link
                  href={activeStage.fallbackHref}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#7AE36A] hover:bg-[#6acf5a] text-[#042A1B] text-xs font-extrabold transition-colors"
                >
                  <span>{activeStage.fallbackCtaLabel}</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
