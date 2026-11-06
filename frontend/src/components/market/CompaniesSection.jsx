"use client";

import { motion } from "framer-motion";
import { Building2, BriefcaseBusiness, Wallet } from "lucide-react";

export default function CompaniesSection({ data }) {
    return (
        <section className="space-y-12">
            {/* عنوان */}
            <div className="text-center">
                <span className="inline-flex items-center gap-2 rounded-full border border-green-300 bg-green-50 px-4 py-2 text-sm font-medium text-green-700 dark:border-green-700 dark:bg-green-900/30 dark:text-green-300">
                    <Building2 size={16} />
                    بازار استخدام
                </span>

                <h2 className="mt-5 text-4xl font-black text-gray-900 dark:text-white">
                    شرکت‌های استخدام‌کننده
                    <span className="mt-2 block bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                        {data.title}
                    </span>
                </h2>

                <p className="mx-auto mt-5 max-w-3xl leading-8 text-muted-foreground">
                    این شرکت‌ها جزو فعال‌ترین مجموعه‌های منتشرکننده آگهی استخدام در حوزه{" "}
                    <strong>{data.title}</strong> هستند.
                </p>
            </div>

            {/* کارت‌های شرکت‌ها */}
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {data.companies.map((company, index) => (
                    <motion.div
                        key={company.name}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.08, duration: 0.4 }}
                        whileHover={{ y: -6, scale: 1.02 }}
                        className="group rounded-3xl border border-green-200/50 bg-white/70 backdrop-blur-md p-6 shadow-sm transition-all hover:shadow-lg hover:shadow-green-500/10 dark:border-green-800/30 dark:bg-gray-900/70"
                    >
                        <div className="mb-6 flex items-center gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-green-600 transition-all duration-300 group-hover:scale-110 group-hover:bg-green-500 group-hover:text-white dark:bg-green-900/30 dark:text-green-400">
                                <Building2 size={26} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                    {company.name}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    استخدام {data.title}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between rounded-xl bg-green-50/50 p-3 dark:bg-green-900/20">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <BriefcaseBusiness size={18} />
                                    فرصت‌های شغلی
                                </div>
                                <span className="font-bold text-gray-900 dark:text-white">
                                    {company.jobs}
                                </span>
                            </div>

                            <div className="flex items-center justify-between rounded-xl bg-green-50/50 p-3 dark:bg-green-900/20">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Wallet size={18} />
                                    میانگین حقوق
                                </div>
                                <span className="font-bold text-green-600 dark:text-green-400">
                                    {company.salary}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}