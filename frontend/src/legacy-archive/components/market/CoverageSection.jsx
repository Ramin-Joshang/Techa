"use client";

import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Sparkles } from "lucide-react";

const gridVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.04 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function CoverageSection({ data }) {
    return (
        <section className="space-y-12">
            {/* Header */}
            <div className="text-center">
                <div className="inline-flex items-center gap-2 rounded-full border border-green-300 bg-green-50 px-5 py-2 text-green-700 dark:border-green-700 dark:bg-green-900/30 dark:text-green-300">
                    <Sparkles size={16} />
                    پوشش مهارت‌های بازار
                </div>

                <h2 className="mt-6 text-4xl font-black text-gray-900 dark:text-white">
                    آیا این دوره برای ورود به
                    <span className="block bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                        بازار کار کافی است؟
                    </span>
                </h2>

                <p className="mx-auto mt-5 max-w-3xl leading-8 text-muted-foreground">
                    مهارت‌های زیر از پرتکرارترین موارد موجود در آگهی‌های استخدام استخراج شده‌اند.
                    بررسی کنید کدام مهارت‌ها در این دوره آموزش داده می‌شوند.
                </p>
            </div>

            {/* Compact Grid */}
            <motion.div
                variants={gridVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3"
            >
                {data.skills.map((skill) => (
                    <motion.div
                        key={skill.name}
                        variants={itemVariants}
                        whileHover={{ y: -3, scale: 1.01 }}
                        className="group relative overflow-hidden rounded-2xl border border-green-200/50 bg-white/70 p-4 shadow-sm backdrop-blur-md transition-all hover:border-green-300 hover:shadow-md dark:border-green-800/30 dark:bg-gray-900/70"
                    >
                        <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2 min-w-0">
                                {skill.covered ? (
                                    <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
                                ) : (
                                    <XCircle className="h-4 w-4 shrink-0 text-red-400" />
                                )}
                                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                                    {skill.name}
                                </span>
                            </div>
                            <span className="text-xs font-bold text-green-600 dark:text-green-400">
                                {skill.percent}%
                            </span>
                        </div>

                        <div className="h-1.5 overflow-hidden rounded-full bg-green-100 dark:bg-green-900/30">
                            <motion.div
                                initial={{ width: 0 }}
                                whileInView={{ width: `${skill.percent}%` }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                                className={`h-full rounded-full ${skill.covered
                                        ? "bg-gradient-to-r from-green-400 to-emerald-500"
                                        : "bg-gray-300 dark:bg-gray-600"
                                    }`}
                            />
                        </div>

                        {/* وضعیت به‌صورت متن کوچک */}
                        <div className="mt-2 text-xs">
                            {skill.covered ? (
                                <span className="text-green-600 dark:text-green-400">
                                    پوشش داده شده
                                </span>
                            ) : (
                                <span className="text-red-500 dark:text-red-400">
                                    پوشش داده نشده
                                </span>
                            )}
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        </section>
    );
}