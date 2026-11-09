"use client";
import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Hash, FileText, Layout, Layers, Code2,
    Bookmark, ChevronLeft, Database, FileCode, Terminal,
    CheckCircle2, Target, Cpu
} from 'lucide-react';
import { fetchUserCourses, fetchUserCoursesDashboard } from '../../../features/account/userCourses/UserCoursesActions';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';

export default function Exercises() {
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const dispatch = useDispatch();

    const { loading, courses, summary } = useSelector((state) => state.userCourses);

    useEffect(() => {
        // شناسه کاربر (در آینده داینامیک شود)
        dispatch(fetchUserCourses({ FilterType: 0 }));
        dispatch(fetchUserCoursesDashboard({}));
    }, [dispatch]);

    // --- توابع کمکی ---

    const getIcon = (iconName) => {
        const lowerName = iconName?.toLowerCase() || '';
        if (lowerName.includes('sql') || lowerName.includes('database')) return Database;
        if (lowerName.includes('react') || lowerName.includes('next')) return Code2;
        if (lowerName.includes('js') || lowerName.includes('javascript') || lowerName.includes('node')) return FileCode;
        if (lowerName.includes('css') || lowerName.includes('tailwind') || lowerName.includes('design')) return Layout;
        if (lowerName.includes('git') || lowerName.includes('bash')) return Terminal;
        return Layers;
    };

    const getThemeByCourseId = (id) => {
        const themes = ['indigo', 'emerald', 'violet', 'amber', 'rose', 'cyan'];
        const index = id ? id % themes.length : 0;
        return themes[index];
    };

    const getThemeStyles = (themeName) => {
        const styles = {
            indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200', gradient: 'from-indigo-500 to-purple-600' },
            emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', gradient: 'from-emerald-400 to-teal-500' },
            violet: { bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-200', gradient: 'from-violet-500 to-fuchsia-600' },
            amber: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', gradient: 'from-amber-400 to-orange-500' },
            rose: { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-200', gradient: 'from-rose-400 to-red-500' },
            cyan: { bg: 'bg-cyan-50', text: 'text-cyan-600', border: 'border-cyan-200', gradient: 'from-cyan-400 to-blue-500' },
        };
        return styles[themeName] || styles.indigo;
    };

    const filteredExercises = useMemo(() => {
        if (!courses || !Array.isArray(courses)) return [];

        return courses.filter(course => {
            const matchesFilter =
                filter === 'all' ? true :
                    filter === 'completed' ? course.ProgressPercent === 100 :
                        filter === 'reading' ? course.ProgressPercent < 100 : true;

            const matchesSearch =
                course.CourseTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                course.Summary?.toLowerCase().includes(searchQuery.toLowerCase());

            return matchesFilter && matchesSearch;
        });
    }, [courses, filter, searchQuery]);


    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800" dir="rtl">

            {/* --- Hero Section --- */}
            <div className="bg-white border-b border-slate-200 pb-12 px-4 sm:px-8 pt-8">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                    >
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                                    <Code2 className="w-3 h-3" />
                                    چالش‌های کدنویسی
                                </span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                                لیست <span className="text-emerald-600">تمرینات من</span>
                            </h1>
                            <p className="text-slate-500 mt-2 text-lg">مهارت‌های خود را با حل تمرین‌های واقعی به چالش بکشید.</p>
                        </div>

                        {/* Search Box */}
                        <div className="w-full md:w-auto relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-200"></div>
                            <div className="relative bg-white rounded-xl shadow-sm border border-slate-200 flex items-center p-1 focus-within:ring-2 focus-within:ring-emerald-100 focus-within:border-emerald-400 transition-all">
                                <Search className="w-5 h-5 text-slate-400 mr-3" />
                                <input
                                    type="text"
                                    placeholder="جستجوی تمرین..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full md:w-64 bg-transparent border-none focus:ring-0 text-sm py-2 px-2 placeholder:text-slate-400"
                                />
                            </div>
                        </div>
                    </motion.div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
                        {[
                            { label: 'تمرین‌های من', value: summary?.TotalEnrolledCourses || 0, icon: Target },
                            { label: 'حل شده', value: summary?.TotalCompletedCourses || 0, icon: CheckCircle2 },
                            { label: 'تسک‌های پاس شده', value: summary?.TotalChaptersRead || 0, icon: Terminal },
                            { label: 'کل مراحل', value: summary?.TotalChaptersCount || 0, icon: Layers },
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-slate-50 border border-slate-200/60 p-4 rounded-2xl flex flex-col items-center sm:items-start text-center sm:text-right hover:bg-white hover:shadow-md transition-all duration-300"
                            >
                                <stat.icon className="w-6 h-6 text-slate-400 mb-2 sm:mb-0 sm:absolute sm:left-4 sm:top-4" />
                                <span className="text-2xl font-bold text-slate-800">{stat.value}</span>
                                <span className="text-xs text-slate-500 font-medium">{stat.label}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* --- Main Content --- */}
            <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-8 pb-20">

                {/* Filters */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                        {[
                            { id: 'all', label: 'همه تمرینات' },
                            { id: 'reading', label: 'در حال حل' },
                            { id: 'completed', label: 'تکمیل شده' }
                        ].map((btn) => (
                            <button
                                key={btn.id}
                                onClick={() => setFilter(btn.id)}
                                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${filter === btn.id
                                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                                    }`}
                            >
                                {btn.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <Cpu className="w-10 h-10 text-emerald-500 animate-pulse" />
                        <span className="text-slate-500 text-sm">در حال بارگذاری تمرینات...</span>
                    </div>
                )}

                {/* Grid */}
                {!loading && (
                    <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {filteredExercises.map((exercise) => {
                                const themeName = getThemeByCourseId(exercise.CourseId);
                                const theme = getThemeStyles(themeName);
                                const IconComponent = getIcon(exercise.Icon);
                                const isCompleted = exercise.ProgressPercent === 100;

                                return (
                                    <motion.div
                                        layout
                                        key={exercise.CourseId}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        whileHover={{ y: -5 }}
                                        className="group bg-white rounded-3xl border border-slate-200 overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 flex flex-col h-full"
                                    >
                                        {/* Card Header */}
                                        <div className="p-6 pb-4">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${theme.bg} ${theme.text} ${theme.border} border shadow-sm`}>
                                                    <IconComponent className="w-7 h-7" />
                                                </div>
                                                <div className="flex flex-col items-end gap-2">
                                                    {exercise.LastUpdateDate ? (
                                                        <span className="text-[10px] text-slate-400 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                                                            آخرین تلاش: {new Date(exercise.LastUpdateDate).toLocaleDateString('fa-IR')}
                                                        </span>
                                                    ) : (
                                                        <span className="text-[10px] text-slate-400 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                                                            شروع نشده
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-emerald-600 transition-colors">
                                                {exercise.CourseTitle}
                                            </h3>
                                            <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 h-10">
                                                {exercise.Summary}
                                            </p>
                                        </div>

                                        {/* Progress & Meta */}
                                        <div className="p-6 pt-0 mt-auto">
                                            <div className="mb-4">
                                                <div className="flex justify-between text-xs font-medium text-slate-500 mb-1.5">
                                                    <span>روند حل تمرین</span>
                                                    <span className={theme.text}>{exercise.ProgressPercent}%</span>
                                                </div>
                                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${exercise.ProgressPercent}%` }}
                                                        transition={{ duration: 1, ease: "easeOut" }}
                                                        className={`h-full rounded-full bg-gradient-to-r ${theme.gradient}`}
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                    <Hash className="w-3.5 h-3.5" />
                                                    <span>{exercise.LessonProgress} مرحله</span>
                                                </div>

                                                <Link href={`/account/exercises/${exercise.CourseId}`}
                                                    className={`flex items-center gap-1 text-sm font-bold transition-transform group-hover:translate-x-[-4px] ${theme.text}`}
                                                >
                                                    {isCompleted ? 'بررسی پاسخ' : 'ادامه حل تمرین'}
                                                    <ChevronLeft className="w-4 h-4 mt-0.5" />
                                                </Link>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </motion.div>
                )}

                {!loading && filteredExercises.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
                            <Code2 className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-700">تمرینی یافت نشد</h3>
                        <p className="text-slate-500 text-sm mt-1">با فیلترهای دیگر جستجو کنید یا یک تمرین جدید را شروع کنید.</p>
                    </div>
                )}
            </div>
        </div>
    );
}