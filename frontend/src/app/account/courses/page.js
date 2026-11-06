"use client";
import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Book, Search, Filter, Hash, ArrowLeft,
    FileText, Zap, Layout, Layers, Box, Code2,
    Bookmark, ChevronLeft, Sparkles, Database, FileCode
} from 'lucide-react';
import { fetchUserCourses, fetchUserCoursesDashboard } from '../../../features/account/userCourses/UserCoursesActions';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';

export default function DocumentationDashboard() {
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const dispatch = useDispatch();

    // دریافت داده‌ها از ریداکس
    const { loading, courses, summary } = useSelector((state) => state.userCourses);

    useEffect(() => {
        // userId را باید داینامیک کنید، فعلا طبق کد شما 9 گذاشتم
        dispatch(fetchUserCourses({ FilterType: 0 }));
        dispatch(fetchUserCoursesDashboard());
    }, [dispatch]);

    // --- توابع کمکی برای تبدیل داده‌های بک‌اند به فرمت UI ---

    // 1. تابع انتخاب آیکون بر اساس نام رشته‌ای که از سرور می‌آید
    const getIcon = (iconName) => {
        const lowerName = iconName?.toLowerCase() || '';
        if (lowerName.includes('sql') || lowerName.includes('database')) return Database;
        if (lowerName.includes('react')) return Code2; // یا یک آیکون اتم اگر دارید
        if (lowerName.includes('javascript') || lowerName.includes('js')) return FileCode;
        if (lowerName.includes('css') || lowerName.includes('tailwind')) return Layout;
        if (lowerName.includes('git')) return Hash;
        // آیکون پیش‌فرض
        return Layers;
    };

    // 2. تابع انتخاب تم رنگی بر اساس ID دوره (برای تنوع بصری)
    const getThemeByCourseId = (id) => {
        const themes = ['cyan', 'slate', 'sky', 'blue', 'orange', 'pink'];
        // استفاده از باقیمانده تقسیم برای انتخاب چرخشی رنگ‌ها
        const index = id ? id % themes.length : 0;
        return themes[index];
    };

    // 3. استایل‌های رنگی (مشابه کد قبلی)
    const getThemeStyles = (themeName) => {
        const styles = {
            cyan: { bg: 'bg-cyan-50', text: 'text-cyan-600', border: 'border-cyan-200', gradient: 'from-cyan-400 to-blue-500' },
            slate: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300', gradient: 'from-slate-700 to-black' },
            sky: { bg: 'bg-sky-50', text: 'text-sky-600', border: 'border-sky-200', gradient: 'from-sky-400 to-cyan-400' },
            blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', gradient: 'from-blue-500 to-indigo-600' },
            orange: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200', gradient: 'from-orange-400 to-red-500' },
            pink: { bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-200', gradient: 'from-pink-400 to-rose-500' },
        };
        return styles[themeName] || styles.slate;
    };

    // آماده‌سازی لیست دوره‌ها با فیلتر و جستجو
    const filteredCourses = useMemo(() => {
        if (!courses || !Array.isArray(courses)) return [];

        return courses.filter(course => {
            // فیلتر وضعیت
            const matchesFilter =
                filter === 'all' ? true :
                    filter === 'completed' ? course.ProgressPercent === 100 :
                        filter === 'reading' ? course.ProgressPercent < 100 : true;

            // فیلتر جستجو
            const matchesSearch =
                course.CourseTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                course.Summary?.toLowerCase().includes(searchQuery.toLowerCase());

            return matchesFilter && matchesSearch;
        });
    }, [courses, filter, searchQuery]);


    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800 " dir="rtl">

            {/* --- Hero Section --- */}
            <div className="bg-white border-b border-slate-200  pb-12 px-4 sm:px-8">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                    >
                        <div>
                            {/* <div className="flex items-center gap-2 mb-2">
                                <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                                    <Sparkles className="w-3 h-3" />
                                    مستندات و دوره‌ها
                                </span>
                            </div> */}
                            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                                داشبورد <span className="text-indigo-600">یادگیری من</span>
                            </h1>
                            <p className="text-slate-500 mt-2 text-lg">مسیر پیشرفت و دوره‌های فعال شما</p>
                        </div>

                        {/* Search Box */}
                        <div className="w-full md:w-auto relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-200"></div>
                            <div className="relative bg-white rounded-xl shadow-sm border border-slate-200 flex items-center p-1 focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-400 transition-all">
                                <Search className="w-5 h-5 text-slate-400 mr-3" />
                                <input
                                    type="text"
                                    placeholder="جستجو در دوره‌ها..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full md:w-64 bg-transparent border-none focus:ring-0 text-sm py-2 px-2 placeholder:text-slate-400"
                                />
                            </div>
                        </div>
                    </motion.div>

                    {/* Stats Row (از آبجکت summary پر می‌شود) */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
                        {[
                            { label: 'دوره‌های من', value: summary?.TotalEnrolledCourses || 0, icon: Book },
                            { label: 'تکمیل شده', value: summary?.TotalCompletedCourses || 0, icon: Bookmark },
                            { label: 'درس‌های خوانده شده', value: summary?.TotalChaptersRead || 0, icon: FileText },
                            { label: 'کل سرفصل‌ها', value: summary?.TotalChaptersCount || 0, icon: Layers },
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
            <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-8">

                {/* Filters */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                        {['all', 'reading', 'completed'].map((t) => (
                            <button
                                key={t}
                                onClick={() => setFilter(t)}
                                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${filter === t
                                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                                    }`}
                            >
                                {t === 'all' && 'همه دوره‌ها'}
                                {t === 'reading' && 'در حال مطالعه'}
                                {t === 'completed' && 'تکمیل شده'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center py-20">
                        <span className="text-slate-500">در حال دریافت اطلاعات...</span>
                    </div>
                )}

                {/* Grid */}
                {!loading && (
                    <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {filteredCourses.map((course) => {
                                // محاسبه تم و آیکون برای هر آیتم
                                const themeName = getThemeByCourseId(course.CourseId);
                                const theme = getThemeStyles(themeName);
                                const IconComponent = getIcon(course.Icon);
                                const isCompleted = course.ProgressPercent === 100;

                                return (
                                    <motion.div
                                        layout
                                        key={course.CourseId}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        whileHover={{ y: -5 }}
                                        className="group bg-white rounded-3xl border border-slate-200 overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 flex flex-col h-full"
                                    >
                                        {/* Card Header */}
                                        <div className="p-6 pb-4">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${theme.bg} ${theme.text} ${theme.border} border`}>
                                                    <IconComponent className="w-7 h-7" />
                                                </div>
                                                <div className="flex flex-col items-end gap-2">
                                                    {course.LastUpdateDate ? (
                                                        <span className="text-[10px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md">
                                                            آخرین فعالیت: {new Date(course.LastUpdateDate).toLocaleDateString('fa-IR')}
                                                        </span>
                                                    ) : (
                                                        <span className="text-[10px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md">
                                                            شروع نشده
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">
                                                {course.CourseTitle}
                                            </h3>
                                            <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">
                                                {course.Summary}
                                            </p>
                                        </div>

                                        {/* Progress & Meta */}
                                        <div className="p-6 pt-0 mt-auto">
                                            {/* Progress Bar */}
                                            <div className="mb-4">
                                                <div className="flex justify-between text-xs font-medium text-slate-500 mb-1.5">
                                                    <span>پیشرفت دوره</span>
                                                    <span className={theme.text}>{course.ProgressPercent}%</span>
                                                </div>
                                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${course.ProgressPercent}%` }}
                                                        transition={{ duration: 1, ease: "easeOut" }}
                                                        className={`h-full rounded-full bg-gradient-to-r ${theme.gradient}`}
                                                    />
                                                </div>
                                            </div>

                                            {/* Footer Info */}
                                            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                    <FileText className="w-3.5 h-3.5" />
                                                    {/* نمایش LessonProgress که از سرور میاد مثلا 0 / 72 */}
                                                    <span>{course.LessonProgress} درس</span>
                                                </div>

                                                <Link href={`/docs/${course.CourseId}`}
                                                    className={`flex items-center gap-1 text-sm font-bold transition-transform group-hover:translate-x-[-4px] ${theme.text}`}
                                                >
                                                    {isCompleted ? 'مرور مجدد' : 'ادامه یادگیری'}
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

                {!loading && filteredCourses.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
                            <Search className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-700">دوره ای یافت نشد</h3>
                        <p className="text-slate-500 text-sm mt-1">با فیلترهای دیگر امتحان کنید یا در دوره‌ای ثبت نام کنید.</p>
                    </div>
                )}
            </div>
        </div>
    );
}