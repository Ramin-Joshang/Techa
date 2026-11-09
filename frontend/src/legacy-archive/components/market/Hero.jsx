"use client";

import { motion } from "framer-motion";
import {
    TrendingUp,
    BriefcaseBusiness,
    Wallet,
    Sparkles,
    ArrowRight,
    CalendarDays,
} from "lucide-react";

import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.1, duration: 0.4, ease: "easeOut" },
    }),
};

export default function Hero({ data }) {
    return (
        <section className="grid items-center gap-16 lg:grid-cols-2">
            {/* Left */}
            <motion.div
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="space-y-8"
            >
                <Badge
                    variant="secondary"
                    className="w-fit rounded-full border-green-200 bg-green-50 px-4 py-2 text-green-700 dark:border-green-800 dark:bg-green-900/30 dark:text-green-300"
                >
                    <Sparkles className="mr-2 h-4 w-4 text-green-500" />
                    تحلیل بازار کار ایران
                </Badge>

                <div className="space-y-6">
                    <h1 className="text-4xl font-black leading-tight lg:text-6xl">
                        بازار کار
                        <span className="mt-2 block bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                            {data.title}
                        </span>
                    </h1>

                    <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                        {data.description}
                        <br />
                        <br />
                        اطلاعات این صفحه با تحلیل صدها آگهی استخدام منتشرشده در
                        <strong> جابینجا</strong>،
                        <strong> جاب‌ویژن</strong> و
                        <strong> ای‌استخدام</strong> {" "}
                        گردآوری شده و به‌صورت دوره‌ای به‌روزرسانی می‌شود.
                    </p>
                </div>

                <div className="flex flex-wrap gap-4">
                    <Button
                        size="lg"
                        className="rounded-xl bg-green-500 text-white shadow-lg shadow-green-500/25 transition-all hover:bg-green-600 hover:shadow-green-500/40"
                    >
                        شروع یادگیری
                        <ArrowRight className="mr-2 h-5 w-5" />
                    </Button>

                    <Button
                        variant="outline"
                        size="lg"
                        className="rounded-xl border-green-200 text-green-700 hover:bg-green-50 dark:border-green-800 dark:text-green-300 dark:hover:bg-green-900/20"
                    >
                        مشاهده سرفصل‌ها
                    </Button>
                </div>

                <div className="flex flex-wrap gap-3">
                    <Badge
                        variant="outline"
                        className="border-green-200 bg-green-50/50 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300"
                    >
                        💼 {data.ads.total}+ فرصت شغلی
                    </Badge>
                    <Badge
                        variant="outline"
                        className="border-green-200 bg-green-50/50 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300"
                    >
                        🏢 {data.companies.length}+ شرکت
                    </Badge>
                    <Badge
                        variant="outline"
                        className="border-green-200 bg-green-50/50 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300"
                    >
                        🧠 {data.skills.length} مهارت
                    </Badge>
                </div>
            </motion.div>

            {/* Right */}
            <motion.div
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
            >
                <div className="relative overflow-hidden rounded-3xl border border-green-200/50 bg-white/60 p-8 shadow-xl shadow-green-500/5 backdrop-blur-xl dark:border-green-800/30 dark:bg-gray-900/60">
                    {/* دایره‌های محو سبز */}
                    <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-green-500/15 blur-[120px]" />
                    <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-emerald-500/10 blur-[120px]" />

                    <div className="space-y-5">
                        <InfoCard
                            icon={<BriefcaseBusiness className="h-5 w-5" />}
                            title="فرصت‌های شغلی"
                            value={`${data.ads.total}+`}
                            subtitle={`${data.ads.active} آگهی فعال`}
                            index={0}
                        />
                        <InfoCard
                            icon={<Wallet className="h-5 w-5" />}
                            title="درآمد برنامه‌نویس"
                            value={data.salaries.senior}
                            subtitle={`از ${data.salaries.junior}`}
                            index={1}
                        />
                        <InfoCard
                            icon={<TrendingUp className="h-5 w-5" />}
                            title="تقاضای بازار"
                            value={data.demand.text}
                            subtitle={`${data.demand.value}% تقاضا`}
                            index={2}
                        />
                        <InfoCard
                            icon={<CalendarDays className="h-5 w-5" />}
                            title="آخرین بروزرسانی"
                            value={data.updatedAt}
                            index={3}
                        />
                    </div>
                </div>
            </motion.div>
        </section>
    );
}

function InfoCard({ icon, title, value, subtitle, index }) {
    return (
        <motion.div
            custom={index}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={cardVariants}
            whileHover={{ y: -5, scale: 1.02 }}
            transition={{ duration: 0.25 }}
            className="group flex items-center gap-4 rounded-2xl border border-green-100 bg-white/80 p-5 shadow-sm backdrop-blur-xl transition-all hover:border-green-300 hover:shadow-md dark:border-green-800/30 dark:bg-gray-800/80 dark:hover:border-green-600"
        >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-600 transition-colors group-hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:group-hover:bg-green-900/50">
                {icon}
            </div>

            <div className="min-w-0">
                <p className="text-sm text-muted-foreground">{title}</p>
                <h4 className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
                    {value}
                </h4>
                {subtitle && (
                    <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
                )}
            </div>
        </motion.div>
    );
}