"use client";
import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Trophy, Clock, CheckCircle2, XCircle,
    BrainCircuit, BarChart3,
    Play, AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { fetchQuizzes } from '../../../features/main/quizzes/quizzesActions';
import LoadingSpinner from '../../../components/common/LoadingSpinner'; // فرض بر وجود این کامپوننت

// تابع تبدیل تاریخ میلادی به شمسی
const formatDate = (dateString) => {
    if (!dateString) return '---';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fa-IR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
};

export default function ExamsPage() {
    const [filter, setFilter] = useState('all');
    const [selectedExam, setSelectedExam] = useState(null);
    const dispatch = useDispatch();

    // دریافت داده‌ها از Redux
    const { loading, quizzes, error } = useSelector(state => state.quizzes);

    useEffect(() => {
        dispatch(fetchQuizzes());
    }, [dispatch]);

    // داده‌های پیش‌فرض در صورت null بودن
    const safeQuizzes = quizzes || [];

    // محاسبات آماری بر اساس داده‌های سرور
    const stats = useMemo(() => {
        if (!safeQuizzes.length) return { total: 0, passed: 0, avgScore: 0 };

        const total = safeQuizzes.length;
        const passed = safeQuizzes.filter(e => e.StatusText === 'Passed').length;

        const examsWithScore = safeQuizzes.filter(e => e.LastScore !== null);
        const avgScore = examsWithScore.length > 0
            ? Math.round(examsWithScore.reduce((acc, curr) => acc + curr.LastScore, 0) / examsWithScore.length)
            : 0;

        return { total, passed, avgScore };
    }, [safeQuizzes]);

    const filteredExams = safeQuizzes.filter(exam =>
        filter === 'all' ? true : exam.StatusText === filter
    );

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50/50">
                <LoadingSpinner className="w-12 h-12 text-indigo-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center text-rose-500 font-bold">
                خطا در دریافت اطلاعات آزمون‌ها
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50 pb-20 px-4 sm:px-8 font-sans text-slate-800" dir="rtl">
            <header className="pt-10 pb-8 max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8"
                >
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-2">
                            مرکز <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-500">آزمون‌ها</span>
                        </h1>
                        <p className="text-slate-500 text-lg">مهارت‌های خود را بسنجید و گواهینامه دریافت کنید</p>
                    </div>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <StatCard title="آزمون‌های موجود" value={stats.total} icon={BrainCircuit} color="indigo" desc="کل چالش‌ها" />
                    <StatCard title="تعداد قبولی" value={stats.passed} icon={Trophy} color="emerald" desc="موفقیت‌آمیز" />
                    <StatCard title="میانگین نمرات" value={`${stats.avgScore}%`} icon={BarChart3} color="amber" desc="عملکرد کلی" />
                </div>

                {/* Filter Bar */}
                <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm mb-8 flex flex-wrap gap-2 sticky top-4 z-10 backdrop-blur-md bg-white/90">
                    {[
                        { id: 'all', label: 'همه آزمون‌ها' },
                        { id: 'Passed', label: 'قبول شده' },
                        { id: 'Failed', label: 'مردود شده' },
                        { id: 'NotTaken', label: 'شرکت نکرده' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setFilter(tab.id)}
                            className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${filter === tab.id
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                                : 'text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Exams Grid */}
                <motion.div layout className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <AnimatePresence>
                        {filteredExams.map((exam) => (
                            <ExamCard key={exam.QuizId} exam={exam} onStart={() => setSelectedExam(exam)} />
                        ))}
                    </AnimatePresence>
                </motion.div>
            </header>

            {/* Start Exam Modal */}
            <AnimatePresence>
                {selectedExam && (
                    <StartExamModal exam={selectedExam} onClose={() => setSelectedExam(null)} />
                )}
            </AnimatePresence>
        </div>
    );
}

// --- Components ---

const StatCard = ({ title, value, icon: Icon, color, desc }) => {
    const themes = {
        indigo: { bg: 'bg-indigo-500', light: 'bg-indigo-50', text: 'text-indigo-600' },
        emerald: { bg: 'bg-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-600' },
        amber: { bg: 'bg-amber-500', light: 'bg-amber-50', text: 'text-amber-600' },
    };
    const t = themes[color];

    return (
        <motion.div whileHover={{ y: -5 }} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 flex items-center justify-between">
            <div>
                <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
                <h3 className="text-3xl font-extrabold text-slate-800">{value}</h3>
                <p className={`text-xs mt-2 font-medium ${t.text}`}>{desc}</p>
            </div>
            <div className={`p-4 rounded-2xl ${t.light}`}>
                <Icon className={`w-8 h-8 ${t.text}`} />
            </div>
        </motion.div>
    );
};

const ExamCard = ({ exam, onStart }) => {
    const isPassed = exam.StatusText === 'Passed';
    const isFailed = exam.StatusText === 'Failed';
    const isPending = exam.StatusText === 'NotTaken';

    const borderColor = isPassed ? 'border-emerald-200' : isFailed ? 'border-rose-200' : 'border-slate-200';
    const statusColor = isPassed ? 'text-emerald-600 bg-emerald-50' : isFailed ? 'text-rose-600 bg-rose-50' : 'text-slate-600 bg-slate-50';

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`bg-white flex flex-col justify-between rounded-3xl p-6 border ${borderColor} shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden group`}
        >
            <div>
                <div className="flex justify-between items-start mb-6 relative z-10">
                    <div className="flex gap-4">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold ${statusColor}`}>
                            {exam.LastScore !== null ? exam.LastScore : '?'}
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-xl font-bold text-slate-800">{exam.Title}</h3>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {exam.TimeLimit} دقیقه</span>
                                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                <span>{exam.QuestionCount} سوال</span>
                            </div>
                        </div>
                    </div>
                    {isPassed && <div className="bg-emerald-100 text-emerald-700 p-2 rounded-xl"><Trophy className="w-6 h-6" /></div>}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
                    <div className={`rounded-xl p-3 border ${isPassed ? 'bg-emerald-50 border-emerald-100' : isFailed ? 'bg-rose-50 border-rose-100' : 'bg-slate-50 border-slate-100'}`}>
                        <p className="text-xs text-slate-400 mb-1">وضعیت</p>
                        <p className={`font-bold text-sm flex items-center gap-1 ${isPassed ? 'text-emerald-600' : isFailed ? 'text-rose-600' : 'text-slate-600'}`}>
                            {isPassed ? <CheckCircle2 className="w-4 h-4" /> : isFailed ? <XCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                            {isPassed ? 'قبول شده' : isFailed ? 'مردود' : 'شرکت نکرده'}
                        </p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                        <p className="text-xs text-slate-400 mb-1">آخرین تلاش</p>
                        <p className="font-bold text-xs text-slate-700 dir-ltr text-right">
                            {formatDate(exam.LastAttemptDate)}
                        </p>
                    </div>
                </div>
            </div>

            <button
                onClick={onStart}
                className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${isPending
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/30'
                    : 'bg-white border-2 border-slate-200 text-slate-700 hover:border-indigo-500 hover:text-indigo-600'
                    }`}
            >
                {isPending ? <Play className="w-5 h-5 fill-current" /> : <RefreshCwIcon />}
                {isPending ? 'شروع آزمون' : 'آزمون مجدد'}
            </button>
        </motion.div>
    );
};

const RefreshCwIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M8 16H3v5" /></svg>
);

const StartExamModal = ({ exam, onClose }) => (
    <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
    >
        <motion.div
            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
            className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}
        >
            <div className="bg-indigo-600 p-6 text-white text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                <BrainCircuit className="w-16 h-16 mx-auto mb-4 relative z-10" />
                <h2 className="text-2xl font-bold relative z-10">{exam.Title}</h2>
            </div>

            <div className="p-8">
                <div className="grid grid-cols-3 gap-4 mb-8 text-center">
                    <div>
                        <div className="text-indigo-600 font-bold text-xl">{exam.TimeLimit}</div>
                        <div className="text-xs text-slate-500">دقیقه زمان</div>
                    </div>
                    <div className="border-x border-slate-100">
                        <div className="text-indigo-600 font-bold text-xl">{exam.QuestionCount}</div>
                        <div className="text-xs text-slate-500">تعداد سوال</div>
                    </div>
                    <div>
                        <div className="text-emerald-600 font-bold text-xl">%{exam.PassScore}</div>
                        <div className="text-xs text-slate-500">نمره قبولی</div>
                    </div>
                </div>

                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-8 flex gap-3 text-sm text-amber-800">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p>در حین آزمون از رفرش کردن صفحه خودداری کنید. آزمون نمره منفی ندارد.</p>
                </div>

                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors">
                        انصراف
                    </button>
                    <Link href={`/account/quiz/${exam.QuizId}`} className="flex-1">
                        <button className="w-full py-3.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 transition-all">
                            شروع آزمون
                        </button>
                    </Link>
                </div>
            </div>
        </motion.div>
    </motion.div>
);
