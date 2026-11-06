"use client"
import Link from 'next/link';
import React from 'react';
import { motion } from "framer-motion";
import { Sparkles } from 'lucide-react'; // آیکون برای بج تزئینی

const Roadmap = () => {
    const steps = [
        {
            id: 1,
            phase: 'فاز اول: تخصص',
            title: 'متخصص فرانت‌اند',
            techs: ['HTML5 & CSS3', 'JavaScript', 'React.js & Tailwind'],
            color: 'from-emerald-500 to-emerald-400',
            shadow: 'shadow-emerald-500/10 hover:shadow-emerald-500/20',
            icon: (
                <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
            )
        },
        {
            id: 2,
            phase: 'فاز دوم: تجربه واقعی',
            title: 'کارآموزی و کار تیمی',
            techs: ['Git & GitHub', 'Scrum / Agile', 'شبیه‌سازی محیط شرکت'],
            color: 'from-teal-500 to-teal-400',
            shadow: 'shadow-teal-500/10 hover:shadow-teal-500/20',
            icon: (
                <svg className="w-8 h-8 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            )
        },
        {
            id: 3,
            phase: 'فاز سوم: درآمدزایی',
            title: 'فریلنسری و استخدام',
            techs: ['رزومه و مصاحبه', 'دیپلوی (Deploy)', 'پروژه فریلنسری واقعی'],
            color: 'from-green-500 to-green-400',
            shadow: 'shadow-green-500/10 hover:shadow-green-500/20',
            icon: (
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            )
        }
    ];

    return (
        <div className="relative py-20  overflow-hidden text-slate-800" dir="rtl">
            {/* افکت‌های نوری پس‌زمینه (روشن و سبز) */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-200/50 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-200/50 rounded-full blur-3xl opacity-60 pointer-events-none"></div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">

                {/* تیتر اصلی - بخش ارتقا یافته */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center max-w-3xl mx-auto mb-20"
                >
                    {/* بج تزئینی */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2, type: "spring" }}
                        className="inline-flex items-center gap-2 rounded-full border border-green-300 bg-green-50 px-4 py-2 text-sm font-medium text-green-700 mb-6 dark:border-green-700 dark:bg-green-900/30 dark:text-green-300"
                    >
                        <Sparkles size={16} />
                        مسیر شغلی شما
                    </motion.div>

                    {/* تیتر اصلی با افکت زیرخط برای کلمه استخدام */}
                    <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6 leading-tight">
                        نقشه راه قطعی شما تا
                        <span className="relative inline-block mx-2 bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                            استخدام
                            {/* SVG برای خط زیرین */}
                            <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 100 8" preserveAspectRatio="none">
                                <defs>
                                    <linearGradient id="title-underline-green" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#4ade80" />
                                        <stop offset="100%" stopColor="#10b981" />
                                    </linearGradient>
                                </defs>
                                <path
                                    d="M0,5 Q50,0 100,5"
                                    fill="none"
                                    stroke="url(#title-underline-green)"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                />
                            </svg>
                        </span>
                    </h2>

                    {/* متن توضیحی */}
                    <p className="text-lg text-muted-foreground">
                        مسیر موفقیت شما در ۳ فاز اصلی طراحی شده است. با
                        <span className="text-green-600 font-bold mx-1">مگا پکیج الماس</span>{" "}
                        هر سه فاز را یکجا و با بیشترین تخفیف طی کنید.
                    </p>
                </motion.div>

                {/* کانتینر اصلی کارت‌ها (۳ ستونه) */}
                <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 xl:gap-10">

                    {/* خط اتصال نوری در دسکتاپ */}
                    <div className="hidden md:block absolute top-1/2 right-0 w-full h-1 bg-emerald-100 -translate-y-1/2 z-0">
                        <div className="h-full bg-gradient-to-l from-emerald-400 via-teal-400 to-green-400 w-full opacity-60"></div>
                    </div>

                    {steps.map((step) => (
                        <div
                            key={step.id}
                            className={`relative z-10 bg-white/70 backdrop-blur-xl border border-emerald-100 rounded-3xl p-6 transition-all duration-300 hover:-translate-y-2 ${step.shadow}`}
                        >
                            {/* آیکون و هدر کارت */}
                            <div className="flex items-center justify-between mb-6">
                                <div className={`p-3 rounded-2xl bg-gradient-to-br ${step.color} bg-opacity-10 shadow-sm border border-emerald-50`}>
                                    {step.icon}
                                </div>
                                <span className="text-5xl font-black text-slate-100 select-none drop-shadow-sm">
                                    0{step.id}
                                </span>
                            </div>

                            {/* محتوای کارت */}
                            <div>
                                <span className={`text-sm font-bold bg-clip-text text-transparent bg-gradient-to-l ${step.color}`}>
                                    {step.phase}
                                </span>
                                <h3 className="text-2xl font-bold mt-2 mb-4 text-slate-800">
                                    {step.title}
                                </h3>

                                {/* لیست تکنولوژی‌ها */}
                                <ul className="space-y-3">
                                    {step.techs.map((tech, idx) => (
                                        <li key={idx} className="flex items-center text-slate-600 font-medium text-sm">
                                            <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${step.color} ml-2 shadow-sm`}></div>
                                            <span dir="ltr">{tech}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>

                {/* بخش نمایش دربرگیری پکیج‌ها (آکاردئون بصری زیر کارت‌ها) */}
                <div className="mt-10 hidden md:flex flex-col space-y-4 max-w-7xl mx-auto">
                    {/* نشانگر مگاپکیج الماس (کل فازها) */}
                    <div className="relative flex w-full">
                        <div className="w-full border-b-2 border-r-2 border-l-2 border-teal-400 rounded-b-xl h-4 mt-2"></div>
                        <div className="absolute top-2 w-full text-center">
                            <Link href={`/packages/diamond-path-zero-to-hire`} className="bg-teal-50 text-teal-700 border border-teal-200 px-5 py-2 rounded-full text-sm font-bold -mt-5 inline-block shadow-sm">
                                مگاپکیج الماس 💎 (صفر تا بازار کار)
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Roadmap;