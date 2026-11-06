"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Circle, Sparkles } from "lucide-react";

export default function SkillsSection({ data }) {
    return (
        <section className="grid gap-16 lg:grid-cols-2">
            {/* Left - description */}
            <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="flex flex-col justify-center"
            >
                <span className="inline-flex w-fit items-center gap-2 rounded-full border border-green-300 bg-green-50 px-4 py-2 text-sm font-medium text-green-700 dark:border-green-700 dark:bg-green-900/30 dark:text-green-300">
                    <Sparkles size={16} />
                    مهارت‌های موردنیاز بازار
                </span>

                <h2 className="mt-6 text-4xl font-black text-gray-900 dark:text-white">
                    شرکت‌ها دنبال چه
                    <span className="block bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                        مهارت‌هایی هستند؟
                    </span>
                </h2>

                <p className="mt-6 leading-8 text-muted-foreground">
                    این درصدها از بررسی آگهی‌های استخدام {data.title} استخراج شده‌اند.
                    هرچه درصد بالاتر باشد یعنی احتمال مشاهده آن مهارت داخل آگهی‌ها بیشتر است.
                </p>
            </motion.div>

            {/* Right - compact skills grid */}
            <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 gap-3 md:grid-cols-2 content-start"
            >
                {data.skills.map((skill, index) => (
                    <motion.div
                        key={skill.name}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.04, duration: 0.3 }}
                        viewport={{ once: true }}
                        whileHover={{ y: -2, scale: 1.02 }}
                        className="group rounded-xl border border-green-200/50 bg-white/70 p-3 shadow-sm backdrop-blur-md transition-all hover:border-green-300 hover:shadow-md dark:border-green-800/30 dark:bg-gray-900/70"
                    >
                        <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2 min-w-0">
                                {skill.covered ? (
                                    <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
                                ) : (
                                    <Circle className="h-4 w-4 shrink-0 text-gray-300 dark:text-gray-600" />
                                )}
                                <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                                    {skill.name}
                                </span>
                            </div>
                            <span className="text-xs font-bold text-green-600 dark:text-green-400 tabular-nums shrink-0">
                                {skill.percent}%
                            </span>
                        </div>

                        <div className="h-1.5 overflow-hidden rounded-full bg-green-100 dark:bg-green-900/20">
                            <motion.div
                                initial={{ width: 0 }}
                                whileInView={{ width: `${skill.percent}%` }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, delay: index * 0.03, ease: "easeOut" }}
                                className={`h-full rounded-full ${skill.covered
                                        ? "bg-gradient-to-r from-green-400 to-emerald-500"
                                        : "bg-gray-300 dark:bg-gray-600"
                                    }`}
                            />
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        </section>
    );
}