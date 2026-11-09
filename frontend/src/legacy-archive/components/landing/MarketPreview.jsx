"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
    TrendingUp,
    BriefcaseBusiness,
    Wallet,
    ArrowLeft,
    Sparkles,
    Building2,
    Users,
} from "lucide-react";

// هوک شمارنده انیمیشنی
const useCounter = (end, duration = 2000, startCounting) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
        if (!startCounting) return;
        let startTime;
        let animationFrame;
        const step = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            setCount(Math.floor(progress * end));
            if (progress < 1) {
                animationFrame = requestAnimationFrame(step);
            }
        };
        animationFrame = requestAnimationFrame(step);
        return () => cancelAnimationFrame(animationFrame);
    }, [end, duration, startCounting]);
    return count;
};

const previewData = [
    {
        slug: "react",
        title: "React Front-End",
        icon: "⚛️",
        ads: 1200,
        activeAds: 315,
        companies: 6,
        demand: 95,
        seniorSalary: 85,
        color: "from-green-500 to-emerald-500",
        badge: "بسیار پرتقاضا 🔥",
    },
    {
        slug: "sql",
        title: "SQL Server",
        icon: "🗄️",
        ads: 720,
        activeAds: 185,
        companies: 5,
        demand: 87,
        seniorSalary: 65,
        color: "from-teal-500 to-cyan-500",
        badge: "تقاضای بالا 📈",
    },
];

export default function MarketPreview() {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const current = previewData[activeIndex];

    // تشخیص ورود به viewport
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) setIsVisible(true);
            },
            { threshold: 0.3 }
        );
        const section = document.getElementById("market-preview");
        if (section) observer.observe(section);
        return () => observer.disconnect();
    }, []);

    // چرخش خودکار
    useEffect(() => {
        if (!isVisible) return;
        const timer = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % previewData.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [isVisible]);

    // شمارنده‌ها (فقط وقتی بخش دیده می‌شود شروع به شمارش می‌کنند)
    const displayAds = useCounter(current.ads, 2000, isVisible);
    const displayCompanies = useCounter(current.companies, 1800, isVisible);
    const displaySalary = useCounter(current.seniorSalary, 1800, isVisible);

    return (
        <section
            id="market-preview"
            className="relative py-24 overflow-hidden"
            dir="rtl"
        >
            {/* پس‌زمینه پویا */}
            <div className="absolute inset-0 -z-10">
                <motion.div
                    animate={{ x: [0, 100, 0], y: [0, -50, 0] }}
                    transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                    className="absolute top-1/4 left-0 w-[600px] h-[600px] bg-green-500/15 rounded-full blur-[180px]"
                />
                <motion.div
                    animate={{ x: [0, -80, 0], y: [0, 50, 0] }}
                    transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
                    className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-500/15 rounded-full blur-[150px]"
                />
            </div>

            {/* ذرات شناور */}
            <div className="absolute inset-0 -z-5 pointer-events-none">
                {[...Array(6)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-2 h-2 rounded-full bg-green-400/30"
                        animate={{
                            y: [0, -30, 0],
                            x: [0, i % 2 === 0 ? 20 : -20, 0],
                            opacity: [0.2, 0.6, 0.2],
                        }}
                        transition={{
                            duration: 3 + i,
                            repeat: Infinity,
                            delay: i * 0.7,
                        }}
                        style={{
                            top: `${20 + (i * 15) % 70}%`,
                            left: `${10 + (i * 20) % 80}%`,
                        }}
                    />
                ))}
            </div>

            <div className="container mx-auto px-4">
                {/* عنوان با تایپ‌رایتر */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <TypewriterBadge />
                    <h2 className="mt-5 text-3xl md:text-5xl font-black text-gray-900 dark:text-white leading-tight">
                        وضعیت{" "}
                        <span className="relative inline-block bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                            بازار کار برنامه‌نویسی
                        </span>{" "}
                        در یک نگاه
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                        تحلیل زنده از آگهی‌های استخدام ایران. داده‌ها هر ماه بروز می‌شوند.
                    </p>
                </motion.div>

                {/* کارت اصلی */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    className="relative max-w-5xl mx-auto rounded-[40px] border border-green-200/60 bg-white/80 backdrop-blur-3xl p-8 md:p-10 shadow-2xl shadow-green-500/10 dark:border-green-800/30 dark:bg-gray-900/80 overflow-hidden"
                >
                    {/* لایه تزئینی کارت */}
                    <div className="absolute -top-32 -left-32 w-80 h-80 bg-green-400/10 rounded-full blur-[120px]" />
                    <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-emerald-400/10 rounded-full blur-[120px]" />

                    <div className="relative z-10">
                        {/* تب‌ها */}
                        <div className="flex justify-center gap-3 mb-12">
                            {previewData.map((item, idx) => (
                                <button
                                    key={item.slug}
                                    onClick={() => setActiveIndex(idx)}
                                    className={`relative px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${activeIndex === idx
                                        ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/25"
                                        : "bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-300"
                                        }`}
                                >
                                    {item.icon} {item.title}
                                    {activeIndex === idx && (
                                        <motion.span
                                            layoutId="market-preview-tab"
                                            className="absolute inset-0 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 -z-10"
                                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                        />
                                    )}
                                </button>
                            ))}
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={current.slug}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                {/* ردیف آمار - ۴ ستونه */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-12">
                                    {/* فرصت‌های شغلی */}
                                    <div className="col-span-2 md:col-span-1 flex flex-col items-center rounded-3xl border border-green-200/50 bg-white/90 p-6 shadow-sm backdrop-blur-md dark:border-green-800/30 dark:bg-gray-800/80">
                                        <BriefcaseBusiness className="w-8 h-8 text-green-600 mb-3" />
                                        <span className="text-3xl font-black text-gray-900 dark:text-white">
                                            {displayAds.toLocaleString()}+
                                        </span>
                                        <span className="text-sm text-muted-foreground mt-1">
                                            آگهی شغلی
                                        </span>
                                        <span className="text-xs text-green-600 mt-2 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
                                            {current.activeAds} فعال
                                        </span>
                                    </div>

                                    {/* تقاضای بازار با رینگ */}
                                    <div className="flex flex-col items-center rounded-3xl border border-green-200/50 bg-white/90 p-6 shadow-sm backdrop-blur-md dark:border-green-800/30 dark:bg-gray-800/80">
                                        <TrendingUp className="w-8 h-8 text-green-600 mb-2" />
                                        <div className="relative w-16 h-16">
                                            <svg viewBox="0 0 36 36" className="w-16 h-16">
                                                <path
                                                    className="text-green-100 dark:text-green-900/30"
                                                    stroke="currentColor"
                                                    strokeWidth="3"
                                                    fill="none"
                                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                />
                                                <motion.path
                                                    className="text-green-500"
                                                    stroke="currentColor"
                                                    strokeWidth="3"
                                                    strokeLinecap="round"
                                                    fill="none"
                                                    strokeDasharray={`${current.demand}, 100`}
                                                    initial={{ strokeDashoffset: 100 }}
                                                    whileInView={{ strokeDashoffset: 100 - current.demand }}
                                                    viewport={{ once: true }}
                                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                />
                                            </svg>
                                            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-green-700 dark:text-green-300">
                                                {current.demand}%
                                            </span>
                                        </div>
                                        <span className="text-sm text-muted-foreground mt-1">
                                            تقاضا
                                        </span>
                                        <span className="text-xs text-green-600 mt-1">{current.badge}</span>
                                    </div>

                                    {/* حقوق ارشد */}
                                    <div className="flex flex-col items-center rounded-3xl border border-green-200/50 bg-white/90 p-6 shadow-sm backdrop-blur-md dark:border-green-800/30 dark:bg-gray-800/80">
                                        <Wallet className="w-8 h-8 text-green-600 mb-3" />
                                        <span className="text-3xl font-black text-gray-900 dark:text-white">
                                            {displaySalary}
                                        </span>
                                        <span className="text-sm text-muted-foreground mt-1">
                                            میلیون (Senior)
                                        </span>
                                        <span className="text-xs text-green-600 mt-2">میانگین درآمد</span>
                                    </div>

                                    {/* شرکت‌ها */}
                                    <div className="flex flex-col items-center rounded-3xl border border-green-200/50 bg-white/90 p-6 shadow-sm backdrop-blur-md dark:border-green-800/30 dark:bg-gray-800/80">
                                        <Building2 className="w-8 h-8 text-green-600 mb-3" />
                                        <span className="text-3xl font-black text-gray-900 dark:text-white">
                                            {displayCompanies}+
                                        </span>
                                        <span className="text-sm text-muted-foreground mt-1">
                                            شرکت برتر
                                        </span>
                                        <span className="text-xs text-green-600 mt-2">در استخدام فعال</span>
                                    </div>
                                </div>

                                {/* دکمه CTA با پالس */}
                                <div className="flex justify-center mt-8">
                                    <Link href="/market-analysis" className="group relative inline-block">
                                        {/* پالس بیرونی */}
                                        <motion.span
                                            className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-400 to-emerald-500 opacity-50 blur-md"
                                            animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.1, 0.4] }}
                                            transition={{ repeat: Infinity, duration: 2 }}
                                        />
                                        <span className="relative flex items-center gap-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-10 py-5 rounded-2xl font-bold shadow-xl shadow-green-500/30 hover:shadow-green-500/50 transition-all duration-300 text-lg">
                                            <span>مشاهده تحلیل کامل بازار</span>
                                            <ArrowLeft size={22} />
                                        </span>
                                    </Link>
                                </div>
                                <p className="text-center mt-5 text-xs text-muted-foreground flex items-center justify-center gap-1">
                                    <Sparkles size={12} className="text-green-500" />
                                    بر اساس جدیدترین آگهی‌های جابینجا، جاب‌ویژن و ای‌استخدام
                                </p>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

// کامپوننت تایپ‌رایتر بج
function TypewriterBadge() {
    const words = ["تحلیل بازار کار ۱۴۰۵", "حقوق و تقاضا", "نقشه راه استخدام"];
    const [wordIndex, setWordIndex] = useState(0);
    const [charIndex, setCharIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const currentWord = words[wordIndex];
        const timeout = setTimeout(
            () => {
                if (!isDeleting) {
                    if (charIndex < currentWord.length) {
                        setCharIndex((prev) => prev + 1);
                    } else {
                        setTimeout(() => setIsDeleting(true), 1500);
                    }
                } else {
                    if (charIndex > 0) {
                        setCharIndex((prev) => prev - 1);
                    } else {
                        setIsDeleting(false);
                        setWordIndex((prev) => (prev + 1) % words.length);
                    }
                }
            },
            isDeleting ? 50 : 100
        );
        return () => clearTimeout(timeout);
    }, [charIndex, isDeleting, wordIndex]);

    return (
        <span className="inline-flex min-h-10 items-center gap-2 rounded-full border border-green-300 bg-green-50 px-4 py-2 text-sm font-medium text-green-700 dark:border-green-700 dark:bg-green-900/30 dark:text-green-300">
            <TrendingUp size={16} />
            {words[wordIndex].substring(0, charIndex)}
            <motion.span
                animate={{ opacity: [0, 1] }}
                transition={{ repeat: Infinity, duration: 0.7 }}
                className="inline-block w-0.5 h-4 bg-green-500 ml-1"
            />
        </span>
    );
}