"use client";
import { useState } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, FileCode2, BookOpen, Trophy, Clock,
    ChevronLeft, CheckCircle2, AlertCircle, Timer,
    ArrowUpRight, BarChart3, Star, Calendar, User, Zap
} from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement,
    LineElement, Title, Tooltip, Legend, Filler
} from 'chart.js';

// ثبت کامپوننت‌های نمودار
ChartJS.register(
    CategoryScale, LinearScale, PointElement, LineElement,
    Title, Tooltip, Legend, Filler
);

export default function CourseDetailsRedesigned() {
    const [activeTab, setActiveTab] = useState('exercises');
    const [hoveredExercise, setHoveredExercise] = useState(null);

    // --- داده‌های ساختگی (Mock Data) ---
    const courseInfo = {
        title: 'مسیر متخصص ری‌اکت و نکست',
        instructor: 'مهندس عباسی',
        progress: 68,
        totalLessons: 45,
        completedLessons: 30,
        averageGrade: 18.5,
        nextDeadline: '۲ روز دیگر',
        lastActivity: '۲ ساعت پیش'
    };

    const exercises = [
        { id: 1, title: 'طراحی کامپوننت‌های اتمیک', module: 'فصل ۱: مفاهیم پایه', status: 'completed', grade: 20, feedback: 'بسیار عالی و تمیز کدنویسی شده.', date: '۱۴۰۲/۱۰/۱۲', difficulty: 'easy' },
        { id: 2, title: 'پیاده‌سازی هوک‌های سفارشی', module: 'فصل ۲: هوک‌ها', status: 'completed', grade: 17.5, feedback: 'نکاتی در مورد useMemo رعایت نشده بود.', date: '۱۴۰۲/۱۰/۲۰', difficulty: 'medium' },
        { id: 3, title: 'اتصال به API با React Query', module: 'فصل ۳: مدیریت سرور', status: 'pending', grade: null, feedback: null, date: '۱۴۰۲/۱۱/۰۵', difficulty: 'hard' },
        { id: 4, title: 'سیستم احراز هویت (Auth)', module: 'فصل ۴: امنیت', status: 'locked', grade: null, feedback: null, date: '۱۴۰۲/۱۱/۱۵', difficulty: 'hard' },
    ];

    const syllabus = [
        { id: 1, title: 'مفاهیم عمیق جاوااسکریپت', duration: '۴ ساعت', sessions: 8, status: 'completed' },
        { id: 2, title: 'معماری کامپوننت‌ها در ری‌اکت', duration: '۶ ساعت', sessions: 12, status: 'completed' },
        { id: 3, title: 'مدیریت وضعیت (Redux & Zustand)', duration: '۵ ساعت', sessions: 10, status: 'in-progress' },
        { id: 4, title: 'SSR و SSG در Next.js', duration: '۸ ساعت', sessions: 15, status: 'locked' },
    ];

    // تنظیمات نمودار
    const chartData = {
        labels: ['هفته ۱', 'هفته ۲', 'هفته ۳', 'هفته ۴', 'هفته ۵', 'هفته ۶'],
        datasets: [{
            label: 'عملکرد شما',
            data: [12, 19, 15, 18, 17, 20],
            borderColor: '#10b981', // Emerald 500
            backgroundColor: (context) => {
                const ctx = context.chart.ctx;
                const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                gradient.addColorStop(0, 'rgba(16, 185, 129, 0.4)');
                gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
                return gradient;
            },
            tension: 0.4,
            fill: true,
            pointBackgroundColor: '#fff',
            pointBorderColor: '#10b981',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#1e293b',
                titleFont: { family: 'inherit' },
                bodyFont: { family: 'inherit' },
                padding: 10,
                cornerRadius: 8,
                displayColors: false,
            }
        },
        scales: {
            y: { grid: { color: '#f1f5f9' }, border: { display: false }, ticks: { font: { family: 'inherit' } } },
            x: { grid: { display: false }, border: { display: false }, ticks: { font: { family: 'inherit' } } }
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans p-4 md:p-8" dir="rtl">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* --- Header Section (Bento Grid Style) --- */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    {/* Course Main Info */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className="md:col-span-8 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-cyan-500" />
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
                                    <FileCode2 className="w-4 h-4" />
                                    <span>دوره جامع فرانت‌اند</span>
                                </div>
                                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                                    {courseInfo.title}
                                </h1>
                            </div>
                            <div className="bg-slate-50 border border-slate-100 px-4 py-2 rounded-xl flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold text-lg">
                                    {courseInfo.averageGrade}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs text-slate-500">میانگین نمرات</span>
                                    <span className="text-sm font-bold text-emerald-600">عالی</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-6 mt-8">
                            <StatBadge icon={User} label="مدرس" value={courseInfo.instructor} />
                            <StatBadge icon={BookOpen} label="تعداد دروس" value={`${courseInfo.completedLessons} / ${courseInfo.totalLessons}`} />
                            <StatBadge icon={Clock} label="آخرین فعالیت" value={courseInfo.lastActivity} />
                        </div>
                    </motion.div>

                    {/* Progress Circle Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                        className="md:col-span-4 bg-slate-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none" />

                        <div className="flex justify-between items-center z-10">
                            <h3 className="font-semibold text-lg">درصد پیشرفت</h3>
                            <div className="p-2 bg-white/10 rounded-lg">
                                <BarChart3 className="w-5 h-5 text-emerald-400" />
                            </div>
                        </div>

                        <div className="flex items-end gap-2 mt-4 z-10">
                            <span className="text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-t from-emerald-400 to-white">
                                {courseInfo.progress}%
                            </span>
                        </div>

                        <div className="w-full bg-white/10 h-2 rounded-full mt-4 overflow-hidden z-10">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${courseInfo.progress}%` }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className="h-full bg-emerald-500"
                            />
                        </div>
                        <p className="text-slate-400 text-sm mt-3 z-10">فقط ۴ فصل تا دریافت مدرک باقیست!</p>
                    </motion.div>
                </div>

                {/* --- Tabs & Content --- */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Sidebar / Tabs */}
                    <div className="lg:col-span-3 space-y-4">
                        <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-sm sticky top-8">
                            {[
                                { id: 'exercises', label: 'تمرینات و چالش‌ها', icon: FileCode2 },
                                { id: 'syllabus', label: 'سرفصل‌های دوره', icon: LayoutDashboard },
                                { id: 'grades', label: 'ریز نمرات و آمار', icon: Trophy },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 font-medium text-sm mb-1 last:mb-0
                                        ${activeTab === tab.id
                                            ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
                                >
                                    <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-emerald-400' : 'text-slate-400'}`} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Mini Widget */}
                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-100">
                            <div className="flex items-center gap-2 text-amber-700 font-bold mb-2">
                                <Timer className="w-5 h-5" />
                                <span>ددلاین بعدی</span>
                            </div>
                            <p className="text-amber-900/80 text-sm leading-relaxed">
                                تمرین فصل ۳ (API) باید تا <span className="font-bold">{courseInfo.nextDeadline}</span> ارسال شود.
                            </p>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-9">
                        <AnimatePresence mode="wait">

                            {/* --- TAB: EXERCISES --- */}
                            {activeTab === 'exercises' && (
                                <motion.div
                                    key="exercises"
                                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                                    className="space-y-4"
                                >
                                    {exercises.map((ex, i) => (
                                        <motion.div
                                            key={ex.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            onMouseEnter={() => setHoveredExercise(ex.id)}
                                            onMouseLeave={() => setHoveredExercise(null)}
                                            className={`bg-white rounded-2xl p-5 border transition-all duration-300 relative overflow-hidden
                                                ${ex.status === 'locked' ? 'border-slate-100 opacity-70 bg-slate-50' : 'border-slate-200 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-500/5'}
                                            `}
                                        >
                                            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between relative z-10">
                                                {/* Left: Icon & Info */}
                                                <div className="flex items-start gap-4">
                                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border
                                                        ${ex.status === 'completed' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                                                            ex.status === 'pending' ? 'bg-amber-50 border-amber-100 text-amber-600' :
                                                                'bg-slate-100 border-slate-200 text-slate-400'}
                                                    `}>
                                                        {ex.status === 'completed' ? <CheckCircle2 className="w-6 h-6" /> :
                                                            ex.status === 'pending' ? <Clock className="w-6 h-6" /> : <Zap className="w-6 h-6" />}
                                                    </div>
                                                    <div>
                                                        <h4 className={`font-bold text-lg mb-1 ${ex.status === 'locked' ? 'text-slate-500' : 'text-slate-800'}`}>
                                                            {ex.title}
                                                        </h4>
                                                        <div className="flex items-center gap-3 text-xs text-slate-500">
                                                            <span className="bg-slate-100 px-2 py-0.5 rounded-md">{ex.module}</span>
                                                            <span>•</span>
                                                            <span>{ex.date}</span>
                                                            {ex.difficulty && (
                                                                <>
                                                                    <span>•</span>
                                                                    <span className={`
                                                                        ${ex.difficulty === 'hard' ? 'text-rose-500' :
                                                                            ex.difficulty === 'medium' ? 'text-amber-500' : 'text-emerald-500'}
                                                                    `}>
                                                                        {ex.difficulty === 'hard' ? 'دشوار' : ex.difficulty === 'medium' ? 'متوسط' : 'آسان'}
                                                                    </span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Right: Grade & Action */}
                                                <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                                                    {ex.grade && (
                                                        <div className="text-center px-4">
                                                            <div className="text-xl font-black text-emerald-600">{ex.grade}</div>
                                                            <div className="text-[10px] text-slate-400">نمره نهایی</div>
                                                        </div>
                                                    )}

                                                    <button className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all
                                                        ${ex.status === 'completed'
                                                            ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                            : ex.status === 'locked'
                                                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                                                : 'bg-slate-900 text-white hover:bg-emerald-600 shadow-lg shadow-slate-900/20'}
                                                    `}>
                                                        {ex.status === 'completed' ? 'مشاهده بازخورد' : ex.status === 'locked' ? 'قفل شده' : 'شروع تمرین'}
                                                        {ex.status !== 'locked' && <ChevronLeft className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Feedback Expand (Visual Hint) */}
                                            {ex.feedback && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: hoveredExercise === ex.id ? 'auto' : 0, opacity: hoveredExercise === ex.id ? 1 : 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="mt-4 pt-4 border-t border-slate-100 text-sm text-slate-600 bg-emerald-50/50 p-3 rounded-xl">
                                                        <span className="font-bold text-emerald-700">نظر مدرس: </span>
                                                        {ex.feedback}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </motion.div>
                                    ))}
                                </motion.div>
                            )}

                            {/* --- TAB: SYLLABUS --- */}
                            {activeTab === 'syllabus' && (
                                <motion.div
                                    key="syllabus"
                                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                                    className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm"
                                >
                                    <div className="relative border-r-2 border-slate-100 mr-4 space-y-12 py-2">
                                        {syllabus.map((chapter, index) => (
                                            <div key={chapter.id} className="relative pr-8 group">
                                                {/* Dot on Timeline */}
                                                <div className={`absolute -right-[9px] top-1 w-4 h-4 rounded-full border-2 transition-colors duration-300 z-10
                                                    ${chapter.status === 'completed' ? 'bg-emerald-500 border-emerald-200' :
                                                        chapter.status === 'in-progress' ? 'bg-white border-emerald-500 animate-pulse' :
                                                            'bg-white border-slate-300'}
                                                `} />

                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl transition-all hover:bg-slate-50">
                                                    <div>
                                                        <h3 className={`text-lg font-bold mb-1 ${chapter.status === 'locked' ? 'text-slate-400' : 'text-slate-800'}`}>
                                                            {chapter.title}
                                                        </h3>
                                                        <p className="text-sm text-slate-500 flex items-center gap-3">
                                                            <span>{chapter.sessions} جلسه</span>
                                                            <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                                            <span>{chapter.duration}</span>
                                                        </p>
                                                    </div>

                                                    <div className="">
                                                        {chapter.status === 'completed' && <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">تکمیل شده</span>}
                                                        {chapter.status === 'in-progress' && <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">در حال مشاهده</span>}
                                                        {chapter.status === 'locked' && <span className="text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full">قفل</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* --- TAB: GRADES --- */}
                            {activeTab === 'grades' && (
                                <motion.div
                                    key="grades"
                                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                                    className="space-y-6"
                                >
                                    {/* Charts Container */}
                                    <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm">
                                        <div className="flex items-center justify-between mb-8">
                                            <h3 className="font-bold text-xl text-slate-800 flex items-center gap-2">
                                                <ArrowUpRight className="w-6 h-6 text-emerald-500" />
                                                نمودار پیشرفت نمرات
                                            </h3>
                                            <select className="bg-slate-50 border border-slate-200 text-sm rounded-lg px-3 py-1 focus:outline-none">
                                                <option>۳۰ روز گذشته</option>
                                                <option>کل دوره</option>
                                            </select>
                                        </div>
                                        <div className="h-[300px] w-full">
                                            <Line data={chartData} options={chartOptions} />
                                        </div>
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <GradeCard label="بالاترین نمره" value="20" color="emerald" icon={Star} />
                                        <GradeCard label="پایین‌ترین نمره" value="17.5" color="rose" icon={AlertCircle} />
                                        <GradeCard label="میانگین کل" value="18.5" color="indigo" icon={BarChart3} />
                                        <GradeCard label="تمرینات باقیمانده" value="5" color="amber" icon={LayoutDashboard} />
                                    </div>
                                </motion.div>
                            )}

                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- کامپوننت‌های کمکی ---

const StatBadge = ({ icon: Icon, label, value }) => (
    <div className="flex items-center gap-3">
        <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
            <Icon className="w-5 h-5 text-slate-400" />
        </div>
        <div>
            <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">{label}</p>
            <p className="text-sm font-bold text-slate-700 mt-0.5">{value}</p>
        </div>
    </div>
);

const GradeCard = ({ label, value, color, icon: Icon }) => {
    const colors = {
        emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
        rose: "bg-rose-50 text-rose-600 border-rose-100",
        indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
        amber: "bg-amber-50 text-amber-600 border-amber-100",
    };

    return (
        <div className={`p-5 rounded-2xl border flex flex-col items-center justify-center text-center gap-3 ${colors[color]}`}>
            <Icon className="w-6 h-6 opacity-80" />
            <div>
                <div className="text-2xl font-black">{value}</div>
                <div className="text-xs opacity-80 font-medium mt-1">{label}</div>
            </div>
        </div>
    );
};