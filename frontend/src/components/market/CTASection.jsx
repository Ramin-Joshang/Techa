"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "../ui/button";

export default function CTASection() {
    return (
        <section>
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="
          relative 
          overflow-hidden 
          rounded-[40px] 
          border border-green-300/30 
          bg-gradient-to-br from-green-500 via-emerald-600 to-teal-700 
          px-10 py-20 
          text-center 
          text-white
          shadow-2xl shadow-green-500/20
        "
            >
                {/* تزئینات محو */}
                <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-white/10 blur-[120px]" />
                <div className="absolute -right-20 -bottom-20 h-80 w-80 rounded-full bg-lime-400/10 blur-[140px]" />
                <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-300/10 blur-[160px]" />

                {/* آیکون با انیمیشن شناور */}
                <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                    className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm"
                >
                    <Sparkles className="h-8 w-8 text-white" />
                </motion.div>

                <h2 className="text-4xl font-black leading-tight md:text-5xl">
                    آماده‌ای که وارد
                    <span className="relative mx-2 inline-block">
                        بازار کار
                        <svg
                            className="absolute -bottom-2 left-0 w-full"
                            viewBox="0 0 100 8"
                            preserveAspectRatio="none"
                        >
                            <path
                                d="M0,5 Q50,0 100,5"
                                fill="none"
                                stroke="rgba(255,255,255,0.5)"
                                strokeWidth="2"
                            />
                        </svg>
                    </span>
                    بشی؟
                </h2>

                <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/80">
                    دوره‌های Techa بر اساس نیاز واقعی شرکت‌های استخدام‌کننده طراحی شده‌اند.
                    مهارت یاد بگیر، پروژه بساز و برای اولین فرصت شغلی آماده شو.
                </p>

                <div className="mt-10 flex flex-wrap justify-center gap-5">
                    <Button
                        size="lg"
                        className="
              rounded-xl bg-white text-green-700 shadow-lg shadow-white/20 
              transition-all hover:bg-green-50 hover:shadow-xl hover:scale-105
            "
                    >
                        شروع یادگیری
                        <ArrowLeft className="mr-2 h-5 w-5" />
                    </Button>

                    <Button
                        size="lg"
                        variant="outline"
                        className="
              rounded-xl border-2 border-white/40 bg-transparent text-white
              backdrop-blur-sm transition-all hover:bg-white hover:text-green-700 
              hover:border-white hover:scale-105
            "
                    >
                        مشاهده سرفصل‌ها
                    </Button>
                </div>

                {/* ذرات تزئینی کوچک */}
                <div className="absolute left-10 top-10 h-2 w-2 rounded-full bg-white/30" />
                <div className="absolute right-16 top-20 h-3 w-3 rounded-full bg-white/20" />
                <div className="absolute bottom-12 left-20 h-2 w-2 rounded-full bg-lime-300/40" />
            </motion.div>
        </section>
    );
}