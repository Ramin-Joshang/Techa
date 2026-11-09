"use client";

import { motion } from "framer-motion";
import { Wallet, TrendingUp, BriefcaseBusiness, BadgeCheck } from "lucide-react";

const getCards = (data) => [
    {
        title: "حقوق Junior",
        value: data.salaries.junior,
        subTitle: "شروع مسیر",
        icon: Wallet,
        color: "from-green-500/20 to-green-500/5",
    },
    {
        title: "حقوق Mid-Level",
        value: data.salaries.mid,
        subTitle: "۲ تا ۴ سال تجربه",
        icon: TrendingUp,
        color: "from-emerald-500/20 to-emerald-500/5",
    },
    {
        title: "حقوق Senior",
        value: data.salaries.senior,
        subTitle: "حرفه‌ای",
        icon: BriefcaseBusiness,
        color: "from-teal-500/20 to-teal-500/5",
    },
    {
        title: "تقاضای بازار",
        value: data.demand.text,
        subTitle: `${data.demand.value}% تقاضا`,
        icon: BadgeCheck,
        color: "from-lime-500/20 to-lime-500/5",
    },
];

export default function StatsCards({ data }) {
    return (
        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {getCards(data).map((item, index) => {
                const Icon = item.icon;
                return (
                    <motion.div
                        key={item.title}
                        initial={{ opacity: 0, y: 35 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.08, duration: 0.45 }}
                        whileHover={{ y: -8, scale: 1.02 }}
                        className="group relative overflow-hidden rounded-3xl border border-green-200/50 bg-white/70 backdrop-blur-md shadow-sm transition-shadow hover:shadow-lg hover:shadow-green-500/10 dark:border-green-800/30 dark:bg-gray-900/70"
                    >
                        {/* گرادینت محو هنگام هاور */}
                        <div
                            className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
                        />
                        <div className="relative p-7">
                            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-green-600 transition-all duration-300 group-hover:rotate-6 group-hover:scale-110 dark:bg-green-900/30 dark:text-green-400">
                                <Icon size={26} />
                            </div>
                            <p className="text-sm text-muted-foreground">{item.title}</p>
                            <h3 className="mt-3 text-2xl font-extrabold text-gray-900 dark:text-white">
                                {item.value}
                            </h3>
                            <p className="mt-2 text-sm text-muted-foreground">{item.subTitle}</p>

                            {item.title === "تقاضای بازار" && (
                                <div className="mt-5">
                                    <div className="h-2 overflow-hidden rounded-full bg-green-100 dark:bg-green-900/30">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            whileInView={{ width: `${data.demand.value}%` }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 1, ease: "easeOut" }}
                                            className="h-full rounded-full bg-gradient-to-r from-green-400 to-emerald-500"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="mt-6 h-px bg-green-200/50 dark:bg-green-800/30" />
                            <div className="mt-5 flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                                <TrendingUp size={16} />
                                {data.slug === "react"
                                    ? "بازار رو به رشد"
                                    : "تقاضای بالا در سازمان‌ها"}
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </section>
    );
}