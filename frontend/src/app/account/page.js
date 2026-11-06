"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    LayoutDashboard, BarChart3, UserCircle, BookOpen,
    PencilRuler, FileCheck, Target, Award, KeyRound,
    MessageSquare, ShoppingBag, Flame, TrendingUp,
    CheckCircle2, XCircle, Clock, Zap, Sparkles
} from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserDashboardStats, fetchUserStudyStats } from '../../features/account/dashboard/dashboardActions';

ChartJS.register(
    CategoryScale, LinearScale, PointElement, LineElement,
    Title, Tooltip, Legend, Filler
);

export default function DashboardPage() {
    const [greeting, setGreeting] = useState('');
    const [chartPeriod, setChartPeriod] = useState('weekly');

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('صبح بخیر');
        else if (hour < 18) setGreeting('ظهر بخیر');
        else setGreeting('شب بخیر');
    }, []);

    const { loading, dashboardStats, studyStats, error } = useSelector(state => state.dashboard)
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(fetchUserDashboardStats())
        dispatch(fetchUserStudyStats({ "Mode": 'weekly' }))
    }, [dispatch])

    console.log(dashboardStats)
    console.log(studyStats)

    const chartDataConfig = {
        weekly: {
            labels: ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'],
            data: [15, 30, 45, 40, 60, 85, 90]
        },
        monthly: {
            labels: ['هفته اول', 'هفته دوم', 'هفته سوم', 'هفته چهارم'],
            data: [45, 65, 55, 80]
        }
    };

    const currentChartData = {
        labels: chartDataConfig[chartPeriod].labels,
        datasets: [{
            label: 'پیشرفت',
            data: chartDataConfig[chartPeriod].data,
            borderColor: '#10b981',
            backgroundColor: (context) => {
                const ctx = context.chart.ctx;
                const gradient = ctx.createLinearGradient(0, 0, 0, 300);
                gradient.addColorStop(0, 'rgba(16, 185, 129, 0.4)');
                gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
                return gradient;
            },
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#fff',
            pointBorderColor: '#10b981',
            pointRadius: 5,
            pointHoverRadius: 7
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#1e293b',
                padding: 12,
                titleFont: { family: 'inherit' },
                bodyFont: { family: 'inherit' },
                cornerRadius: 8,
                displayColors: false,
                callbacks: {
                    label: (context) => `پیشرفت: ${context.parsed.y}%`
                }
            }
        },
        scales: {
            x: { grid: { display: false }, ticks: { font: { family: 'inherit', size: 11 } } },
            y: { border: { display: false }, grid: { color: '#f1f5f9' }, ticks: { display: false } }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50/50 to-teal-50/50 pb-20 px-4 sm:px-8 font-sans text-slate-800" dir="rtl">
            {/* هدر */}
            <header className="pt-8 pb-8 flex flex-col md:flex-row justify-between items-end gap-6">
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ type: "spring", stiffness: 100 }}
                >
                    <h1 className="text-3xl font-extrabold text-slate-800">
                        {greeting}، <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">رامین عزیز!</span> 👋
                    </h1>
                    <p className="text-slate-500 mt-2 text-sm">امروز فرصت خوبی برای تکمیل فصل چهارم ری‌اکت است.</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex gap-3"
                >
                    <Link href="/account/profile" className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-emerald-100 text-sm font-medium text-emerald-700 hover:bg-emerald-50 transition-colors shadow-sm">
                        <UserCircle className="w-4 h-4" />
                        پروفایل من
                    </Link>
                </motion.div>
            </header>

            {/* گرید اصلی با انیمیشن استاگر */}
            <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                    hidden: { opacity: 0 },
                    visible: {
                        opacity: 1,
                        transition: { staggerChildren: 0.1 }
                    }
                }}
                className="grid grid-cols-1 md:grid-cols-12 gap-6"
            >
                {/* کارت‌های آمار (منوآیتم‌های اصلی) */}
                <div className="col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="دوره‌های من"
                        value="۳"
                        href="/account/courses"
                        icon={BookOpen}
                        color="emerald"
                        subText="۲ دوره فعال"
                    />
                    <StatCard
                        title="تمرین‌ها"
                        value="۲۴"
                        href="/account/exercises"
                        icon={PencilRuler}
                        color="teal"
                        subText="۸ تمرین جدید"
                    />
                    <StatCard
                        title="مدارک من"
                        value="۱"
                        href="/account/certificates"
                        icon={Award}
                        color="green"
                        subText="مشاهده مدرک"
                    />
                    <StatCard
                        title="تیکت‌ها"
                        value="۱"
                        href="/account/tickets"
                        icon={MessageSquare}
                        color="amber"
                        subText="پاسخ داده شده"
                        alert
                    />
                </div>

                {/* چارت پیشرفت من */}
                <motion.div
                    variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0 }
                    }}
                    className="col-span-12 lg:col-span-12 bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-emerald-100"
                >
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                                <BarChart3 className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">پیشرفت من</h3>
                                <p className="text-xs text-slate-500">نمودار عملکرد هفتگی/ماهانه</p>
                            </div>
                        </div>

                        <div className="bg-emerald-50/50 p-1 rounded-xl flex items-center text-xs font-bold border border-emerald-100">
                            <button
                                onClick={() => setChartPeriod('weekly')}
                                className={`px-4 py-1.5 rounded-lg transition-all ${chartPeriod === 'weekly' ? 'bg-white text-emerald-600 shadow-sm border border-emerald-200' : 'text-slate-500 hover:text-emerald-700'}`}
                            >
                                هفتگی
                            </button>
                            <button
                                onClick={() => setChartPeriod('monthly')}
                                className={`px-4 py-1.5 rounded-lg transition-all ${chartPeriod === 'monthly' ? 'bg-white text-emerald-600 shadow-sm border border-emerald-200' : 'text-slate-500 hover:text-emerald-700'}`}
                            >
                                ماهانه
                            </button>
                        </div>
                    </div>
                    <div className="h-[280px] w-full">
                        <Line data={currentChartData} options={chartOptions} />
                    </div>
                </motion.div>

                {/* دوره‌های من */}
                <motion.div
                    variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0 }
                    }}
                    className="col-span-12 lg:col-span-7 bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-emerald-100"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-emerald-500" />
                            دوره‌های من
                        </h3>
                        <Link href="/account/courses" className="text-xs text-slate-500 hover:text-emerald-600 transition-colors">
                            مشاهده همه
                        </Link>
                    </div>

                    <div className="space-y-4">
                        <CourseItem
                            title="متخصص React و Next.js"
                            status="در حال برگزاری"
                            progress={75}
                            imageColor="bg-emerald-100 text-emerald-700"
                            icon="⚛️"
                        />
                        <CourseItem
                            title="جامع UI/UX دیزاین"
                            status="جلسه جدید منتشر شد"
                            progress={45}
                            imageColor="bg-teal-100 text-teal-700"
                            icon="🎨"
                        />
                        <CourseItem
                            title="Python برای داده‌کاوی"
                            status="تا آزمون نهایی ۳ روز"
                            progress={20}
                            imageColor="bg-green-100 text-green-700"
                            icon="🐍"
                        />
                    </div>
                </motion.div>

                {/* آزمون‌ها و تمرین‌های اخیر (ترکیبی از دو منو) */}
                <motion.div
                    variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0 }
                    }}
                    className="col-span-12 lg:col-span-5 bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-emerald-100"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <FileCheck className="w-5 h-5 text-emerald-500" />
                            آزمون‌ها و تمرین‌ها
                        </h3>
                        <div className="flex gap-2">
                            <Link href="/account/quiz" className="text-xs font-bold text-emerald-600 hover:text-emerald-700">
                                آزمون‌ها
                            </Link>
                            <span className="text-slate-300">|</span>
                            <Link href="/account/exercises" className="text-xs font-bold text-emerald-600 hover:text-emerald-700">
                                تمرین‌ها
                            </Link>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {/* نتیجه آزمون خوب */}
                        <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50/50 border border-emerald-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
                                    <CheckCircle2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-800">آزمون جاوااسکریپت</h4>
                                    <p className="text-xs text-slate-500">نمره: ۹۵ از ۱۰۰</p>
                                </div>
                            </div>
                            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">قبول</span>
                        </div>

                        {/* تمرین در انتظار بررسی */}
                        <div className="flex items-center justify-between p-3 rounded-2xl bg-white border border-emerald-100 hover:border-emerald-300 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                                    <Clock className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-800">تمرین طراحی رابط کاربری</h4>
                                    <p className="text-xs text-slate-500">ارسال شده - در انتظار نمره</p>
                                </div>
                            </div>
                            <Link href="/account/exercises" className="text-xs text-emerald-600 font-bold">پیگیری</Link>
                        </div>

                        {/* آزمون با نمره ضعیف */}
                        <div className="flex items-center justify-between p-3 rounded-2xl bg-white border border-emerald-100 hover:border-emerald-300 transition-colors opacity-80">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                                    <XCircle className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-800">آزمون CSS Flexbox</h4>
                                    <p className="text-xs text-slate-500">نمره: ۴۰ از ۱۰۰</p>
                                </div>
                            </div>
                            <Link href="/account/quiz" className="text-xs font-bold text-slate-500 underline">تلاش مجدد</Link>
                        </div>

                        {/* نکته: آزمون تعیین سطح هوشمند */}
                        <div className="mt-4 p-4 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Target className="w-5 h-5 text-emerald-700" />
                                <p className="text-sm text-emerald-800 font-bold">تعیین سطح هوشمند</p>
                            </div>
                            <Link href="/account/level-assessment" className="text-xs bg-emerald-700 text-white px-3 py-1 rounded-full hover:bg-emerald-800 transition-colors">
                                شروع
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}

// ----- کامپوننت‌های داخلی -----

const StatCard = ({ title, value, subText, icon: Icon, color, href, alert }) => {
    const colors = {
        emerald: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'hover:border-emerald-300' },
        teal: { bg: 'bg-teal-100', text: 'text-teal-700', border: 'hover:border-teal-300' },
        green: { bg: 'bg-green-100', text: 'text-green-700', border: 'hover:border-green-300' },
        amber: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'hover:border-amber-300' },
    };
    const t = colors[color] || colors.emerald;

    return (
        <Link href={href}>
            <motion.div
                whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)" }}
                className={`bg-white/80 backdrop-blur-sm p-5 rounded-3xl border border-emerald-100 shadow-sm flex flex-col justify-between h-36 transition-all ${t.border} group`}
            >
                <div className="flex justify-between items-start">
                    <div className={`p-3 rounded-2xl ${t.bg} ${t.text} transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                        <Icon className="w-6 h-6" />
                    </div>
                    {alert && (
                        <span className="flex h-3 w-3 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                        </span>
                    )}
                </div>
                <div>
                    <h3 className="text-2xl font-extrabold text-slate-800 mt-2">{value}</h3>
                    <div className="flex justify-between items-end">
                        <p className="text-sm font-bold text-slate-500">{title}</p>
                        <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-1 rounded-md">{subText}</span>
                    </div>
                </div>
            </motion.div>
        </Link>
    );
};

const CourseItem = ({ title, status, progress, imageColor, icon }) => (
    <motion.div
        whileHover={{ x: 5 }}
        className="group flex items-center gap-4 p-3 hover:bg-emerald-50/50 rounded-2xl transition-colors cursor-pointer border border-transparent hover:border-emerald-200"
    >
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-sm ${imageColor}`}>
            {icon}
        </div>
        <div className="flex-1">
            <div className="flex justify-between mb-1">
                <h4 className="text-sm font-bold text-slate-800">{title}</h4>
                <span className="text-xs font-bold text-emerald-600">{progress}%</span>
            </div>
            <div className="flex items-center gap-2 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <p className="text-xs text-slate-400">{status}</p>
            </div>
            <div className="w-full h-1.5 bg-emerald-100 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-full bg-gradient-to-l from-emerald-500 to-teal-500 rounded-full"
                ></motion.div>
            </div>
        </div>
    </motion.div>
);