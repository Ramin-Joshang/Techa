"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Hero from "../../components/market/Hero";
import StatsCards from "../../components/market/StatsCards";
import CompaniesSection from "../../components/market/CompaniesSection";
import SkillsSection from "../../components/market/SkillsSection";
import SalarySection from "../../components/market/SalarySection";
import CoverageSection from "../../components/market/CoverageSection";
import RoadmapSection from "../../components/market/RoadmapSection";
import CTASection from "../../components/market/CTASection";
import { marketData } from "../../components/market/data";
import Roadmap from "../../components/landing/Roadmap";

const fadeSlide = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
};

export default function MarketAnalysis() {
    const [activeSlug, setActiveSlug] = useState(marketData[0].slug);
    const activeData = marketData.find((item) => item.slug === activeSlug);

    if (!activeData) return null;

    return (
        <section className="relative overflow-hidden">
            {/* پس‌زمینه با طیف سبز */}
            <div className="absolute inset-0 -z-30 bg-white dark:bg-gray-950" />
            <div className="absolute left-0 top-32 -z-20 h-80 w-80 rounded-full bg-green-500/20 blur-[140px]" />
            <div className="absolute right-0 bottom-0 -z-20 h-[420px] w-[420px] rounded-full bg-emerald-500/20 blur-[170px]" />
            <div className="absolute left-1/2 top-1/3 -z-20 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-lime-500/10 blur-[190px]" />

            {/* گرید شفاف سبز */}
            <div
                className="absolute inset-0 -z-10 opacity-[0.03]"
                style={{
                    backgroundImage: `
            linear-gradient(to right, #22c55e 1px, transparent 1px),
            linear-gradient(to bottom, #22c55e 1px, transparent 1px)
          `,
                    backgroundSize: "42px 42px",
                }}
            />

            <div className="container mx-auto px-4 py-5">
                {/* تب‌ها با استایل شیشه‌ای و گرادینت سبز */}
                <div className="mb-16 flex flex-wrap justify-center gap-3">
                    {marketData.map((item) => {
                        const isActive = activeSlug === item.slug;
                        return (
                            <motion.button
                                key={item.slug}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => setActiveSlug(item.slug)}
                                className={`
                  relative flex items-center gap-2 rounded-full border px-6 py-3 font-medium
                  transition-all duration-300 backdrop-blur-sm
                  ${isActive
                                        ? "border-emerald-400/50 bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/25"
                                        : "border-green-500/20 bg-white/70 dark:bg-gray-900/70 hover:border-green-400 hover:text-green-700 dark:hover:text-green-300"
                                    }
                `}
                            >
                                {item.icon && <item.icon className="h-4 w-4" />}
                                {item.title}
                                {isActive && (
                                    <motion.span
                                        layoutId="active-tab-glow"
                                        className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-green-400/30 to-emerald-400/30 blur-md"
                                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                    />
                                )}
                            </motion.button>
                        );
                    })}
                </div>

                {/* محتوای داینامیک با انیمیشن */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeSlug}
                        variants={fadeSlide}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{ duration: 0.35, ease: "easeInOut" }}
                        className="space-y-32 container px-5 2xl:px-20 mx-auto"

                    >
                        <Hero data={activeData} />
                        <StatsCards data={activeData} />
                        <CompaniesSection data={activeData} />
                        <SkillsSection data={activeData} />
                        <SalarySection data={activeData} />
                        <CoverageSection data={activeData} />
                        {/* <RoadmapSection data={activeData} /> */}
                        <Roadmap />
                        <CTASection data={activeData} />
                    </motion.div>
                </AnimatePresence>
            </div>
        </section>
    );
}