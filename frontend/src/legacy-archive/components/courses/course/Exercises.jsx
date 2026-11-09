"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
    Code2,
    CheckCircle2,
    Clock,
    Trophy,
    MessageSquare,
    GraduationCap,
    ArrowLeft,
    Terminal,
    Target
} from 'lucide-react';

const Exercises = ({ data }) => {
    const { slug } = useParams();

    return (
        <div className="min-h-screen  relative overflow-hidden font-sans">

            <div className=" relative z-10">

                {/* --- HERO SECTION: دکمه و توضیحات اصلی بالا --- */}
                <div className="grid lg:grid-cols-2 gap-12 items-center mb-24">
                    {/* Right Side: Content & CTA */}
                    <div className="text-right space-y-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-medium">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                            </span>
                            سیستم هوشمند تمرینات
                        </div>

                        <h1 className="text-4xl lg:text-5xl 3xl:text-6xl font-black text-slate-900 leading-10">
                            کدنویسی را با <br />
                            <span className="text-transparent  inline-block py-3 bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
                                چالش‌های واقعی
                            </span> <br />
                            یاد بگیرید
                        </h1>

                        <p className="text-lg text-slate-600 leading-relaxed max-w-xl">
                            فقط خواندن کافی نیست! با حل تمرین‌های تعاملی، دریافت بازخورد لحظه‌ای و پروژه‌های عملی، مهارت خود را تثبیت کنید.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <Link
                                href={`/docs/${slug}/exercises`}
                                className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-200 bg-emerald-600 rounded-2xl hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-200 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-600"
                            >
                                {/* <Terminal className="w-6 h-6 ml-2" /> */}
                                ورود به پنل تمرینات
                                <ArrowLeft className="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-1" />
                            </Link>

                            {/* <div className="flex items-center gap-4 px-6 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm text-slate-600">
                                <div className="flex -space-x-2 space-x-reverse overflow-hidden">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">U{i}</div>
                                    ))}
                                </div>
                                <span className="text-sm font-medium">+۵۰۰ دانشجو فعال</span>
                            </div> */}
                        </div>
                    </div>

                    {/* Left Side: Visual Stats/Card */}
                    <div className="relative hidden lg:block">
                        {/* <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-[2rem] rotate-3 opacity-20 blur-xl"></div> */}
                        <div className="relative bg-white border border-slate-100 rounded-[2rem] shadow-xl p-8 overflow-hidden">
                            {/* Decorative Header */}
                            <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                </div>
                                <span className="text-xs font-mono text-slate-400">exercise_status.js</span>
                            </div>

                            {/* Stats Grid inside Card */}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="p-4 bg-emerald-50 rounded-2xl">
                                    <div className="text-3xl font-bold text-emerald-700 mb-1">{data?.TotalExercises.toLocaleString()}</div>
                                    <div className="text-sm text-emerald-600 font-medium">تمرین چالشی</div>
                                </div>
                                <div className="p-4 bg-orange-50 rounded-2xl">
                                    <div className="text-3xl font-bold text-orange-700 mb-1">{data?.CompletedExercises}</div>
                                    <div className="text-sm text-orange-600 font-medium">تکمیل شده</div>
                                </div>
                                <div className="p-4 bg-blue-50 rounded-2xl">
                                    <div className="text-3xl font-bold text-blue-700 mb-1">۸۵٪</div>
                                    <div className="text-sm text-blue-600 font-medium">نمره قبولی</div>
                                </div>
                                <div className="p-4 bg-purple-50 rounded-2xl">
                                    <div className="text-3xl font-bold text-purple-700 mb-1">۱۰۰٪</div>
                                    <div className="text-sm text-purple-600 font-medium">پشتیبانی</div>
                                </div>
                            </div>

                            {/* Progress Bar Mockup */}
                            <div className="mt-8">
                                <div className="flex justify-between text-sm mb-2 text-slate-600">
                                    <span>پیشرفت دوره</span>
                                    <span className="font-bold">{data?.CompletionPercentage}٪</span>
                                </div>
                                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                    <div style={{ width: data?.CompletionPercentage && 0 }} className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- FEATURES GRID --- */}
                <div className="mb-16">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">چرا باید تمرینات را حل کنید؟</h2>
                        <p className="text-slate-500">مسیر یادگیری شما از اینجا می‌گذرد</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <FeatureCard
                            icon={<Code2 className="w-8 h-8 text-white" />}
                            title="تمرینات متنوع"
                            desc="ترکیبی از تست‌های چندگزینه‌ای، تکمیل کد و پروژه‌های کوچک."
                            color="bg-blue-500"
                        />
                        <FeatureCard
                            icon={<Clock className="w-8 h-8 text-white" />}
                            title="مهلت مشخص"
                            desc="تمرین‌ها زمان‌دار هستند تا نظم و سرعت عمل شما را تقویت کنند."
                            color="bg-orange-500"
                        />
                        <FeatureCard
                            icon={<CheckCircle2 className="w-8 h-8 text-white" />}
                            title="تصحیح هوشمند"
                            desc="بررسی خودکار کدها به همراه بازبینی نهایی توسط مدرس."
                            color="bg-green-500"
                        />
                        <FeatureCard
                            icon={<MessageSquare className="w-8 h-8 text-white" />}
                            title="فیدبک اختصاصی"
                            desc="روی تک‌تک خطوط کد شما نظر داده می‌شود تا اشتباهات تکرار نشوند."
                            color="bg-purple-500"
                        />
                        <FeatureCard
                            icon={<Trophy className="w-8 h-8 text-white" />}
                            title="ضرورت مدرک"
                            desc="برای دریافت گواهینامه پایان دوره، حل تمرینات الزامی است."
                            color="bg-yellow-500"
                        />
                        <FeatureCard
                            icon={<Target className="w-8 h-8 text-white" />}
                            title="یادگیری عمیق"
                            desc="تبدیل دانش تئوری به مهارت عملی با درگیر شدن در چالش‌ها."
                            color="bg-red-500"
                        />
                    </div>
                </div>

            </div>
        </div>
    );
};

// کامپوننت داخلی برای کارت‌ها جهت تمیزی کد
const FeatureCard = ({ icon, title, desc, color }) => (
    <div className="group bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <div className={`w-14 h-14 rounded-2xl ${color} shadow-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
            {icon}
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-emerald-700 transition-colors">
            {title}
        </h3>
        <p className="text-slate-600 leading-relaxed text-sm">
            {desc}
        </p>
    </div>
);

export default Exercises;