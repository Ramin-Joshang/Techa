"use client";

import { motion } from "framer-motion";
import { Wallet, TrendingUp, Building2, ArrowUpRight } from "lucide-react";

export default function SalarySection({ data }) {
    const demandItems =
        data.slug === "react"
            ? [
                "فرصت‌های شغلی رو به افزایش",
                "تقاضای بالای برنامه‌نویسان React",
                "امکان همکاری Remote",
                "نیاز مستمر شرکت‌های محصول‌محور",
            ]
            : [
                "نیاز دائمی سازمان‌ها به SQL Developer",
                "فرصت استخدام در بانک‌ها و شرکت‌های بزرگ",
                "تقاضای بالا برای بهینه‌سازی دیتابیس",
                "فرصت همکاری در تیم‌های Backend و BI",
            ];

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.15 },
        },
    };

    const item = {
        hidden: { opacity: 0, y: 40 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    };

    return (
        <motion.section
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid gap-8 xl:grid-cols-3"
        >
            {/* Salary Column */}
            <motion.div
                variants={item}
                className="rounded-3xl border border-green-200/50 bg-white/70 backdrop-blur-md p-8 shadow-sm transition-shadow hover:shadow-lg hover:shadow-green-500/10 dark:border-green-800/30 dark:bg-gray-900/70"
            >
                <div className="mb-8 flex items-center gap-3">
                    <div className="rounded-2xl bg-green-100 p-3 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                        <Wallet size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">میانگین حقوق</p>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            {data.title}
                        </h3>
                    </div>
                </div>

                <SalaryItem level="Junior" salary={data.salaries.junior} />
                <SalaryItem level="Mid-Level" salary={data.salaries.mid} />
                <SalaryItem level="Senior" salary={data.salaries.senior} />
            </motion.div>

            {/* Demand Column */}
            <motion.div
                variants={item}
                className="rounded-3xl border border-green-200/50 bg-white/70 backdrop-blur-md p-8 shadow-sm transition-shadow hover:shadow-lg hover:shadow-green-500/10 dark:border-green-800/30 dark:bg-gray-900/70"
            >
                <div className="mb-8 flex items-center gap-3">
                    <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">وضعیت بازار</p>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            {data.demand.text}
                        </h3>
                    </div>
                </div>

                <div className="mb-6">
                    <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">تقاضای بازار</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            {data.demand.value}%
                        </span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-green-100 dark:bg-green-900/20">
                        <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${data.demand.value}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full rounded-full bg-gradient-to-r from-green-400 to-emerald-500"
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    {demandItems.map((text) => (
                        <DemandItem key={text} text={text} />
                    ))}
                </div>
            </motion.div>

            {/* Companies Column */}
            <motion.div
                variants={item}
                className="rounded-3xl border border-green-200/50 bg-white/70 backdrop-blur-md p-8 shadow-sm transition-shadow hover:shadow-lg hover:shadow-green-500/10 dark:border-green-800/30 dark:bg-gray-900/70"
            >
                <div className="mb-8 flex items-center gap-3">
                    <div className="rounded-2xl bg-teal-100 p-3 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400">
                        <Building2 size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">شرکت‌های استخدام‌کننده</p>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            محبوب‌ترین شرکت‌ها
                        </h3>
                    </div>
                </div>

                <div className="space-y-3">
                    {data.companies.map((company) => (
                        <motion.div
                            key={company.name}
                            whileHover={{ y: -2, scale: 1.01 }}
                            className="flex items-center justify-between rounded-2xl border border-green-200/50 bg-green-50/30 p-4 transition-colors hover:border-green-300 dark:border-green-800/30 dark:bg-green-900/10"
                        >
                            <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white">
                                    {company.name}
                                </h4>
                                <p className="text-xs text-muted-foreground">
                                    {company.jobs} فرصت استخدام
                                </p>
                            </div>
                            <span className="text-sm font-medium text-green-600 dark:text-green-400">
                                {company.salary}
                            </span>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </motion.section>
    );
}

function SalaryItem({ level, salary }) {
    return (
        <motion.div
            whileHover={{ x: 4 }}
            className="mb-5 flex items-center justify-between rounded-2xl bg-green-50/50 p-4 transition-colors hover:bg-green-100/70 dark:bg-green-900/20 dark:hover:bg-green-900/40"
        >
            <span className="font-medium text-gray-700 dark:text-gray-300">
                {level}
            </span>
            <div className="flex items-center gap-2 font-bold text-green-600 dark:text-green-400">
                {salary}
                <ArrowUpRight size={16} />
            </div>
        </motion.div>
    );
}

function DemandItem({ text }) {
    return (
        <motion.div
            whileHover={{ x: 2 }}
            className="flex items-center gap-3 rounded-xl bg-green-50/50 p-4 transition-colors hover:bg-green-100/70 dark:bg-green-900/20 dark:hover:bg-green-900/40"
        >
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
            <span className="text-gray-700 dark:text-gray-300">{text}</span>
        </motion.div>
    );
}