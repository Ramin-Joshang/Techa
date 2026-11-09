"use client";
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageSquare, Plus, Search, Filter, ChevronLeft,
    Clock, CheckCircle2, AlertCircle, LayoutGrid, List, FileText, Loader2
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserTickets } from '../../../features/account/ticket/ticketsActions';

// مپ کردن وضعیت‌های عددی به استایل و متن مناسب
const statusConfig = {
    1: { label: 'باز', bg: 'bg-rose-100', text: 'text-rose-600', border: 'border-rose-200', icon: AlertCircle },
    2: { label: 'پاسخ داده شده', bg: 'bg-emerald-100', text: 'text-emerald-600', border: 'border-emerald-200', icon: CheckCircle2 },
    3: { label: 'بسته', bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200', icon: FileText },
    default: { label: 'نامشخص', bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200', icon: AlertCircle }
};

// مپ کردن دپارتمان‌های عددی به متن
const departmentMap = {
    1: 'پشتیبانی فنی',
    2: 'فروش و اشتراک',
    3: 'امور مالی',
    default: 'عمومی'
};

// تبدیل تاریخ میلادی ایزو به شمسی خوانا
const formatPersianDate = (isoString) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleDateString('fa-IR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

export default function SupportTickets() {
    const dispatch = useDispatch();

    const { user } = useSelector(state => state.auth);
    console.log(user)
    const { loading, tickets = [], error } = useSelector(state => state.tickets);

    const [viewMode, setViewMode] = useState('grid');
    const [searchTerm, setSearchTerm] = useState('');
    console.log(user)

    useEffect(() => {
        const userId = user?.Id || 1002;
        console.log(userId, "l")
        if (userId) {
            dispatch(fetchUserTickets({ "UserId": userId }));
        }
    }, [dispatch, user]);

    // فیلتر کردن بر اساس Subject و Id
    const filteredTickets = useMemo(() => {
        if (!tickets) return [];
        return tickets.filter(ticket =>
            ticket.Subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ticket.Id?.toString().includes(searchTerm)
        );
    }, [tickets, searchTerm]);

    // محاسبه آمار بر اساس اعداد Status
    const stats = useMemo(() => {
        if (!tickets) return { total: 0, waiting: 0, answered: 0, closed: 0 };
        return {
            total: tickets.length,
            waiting: tickets.filter(t => t.Status === 1).length,
            answered: tickets.filter(t => t.Status === 2).length,
            closed: tickets.filter(t => t.Status === 3).length,
        };
    }, [tickets]);

    const StatCard = ({ title, count, color, icon: Icon }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between"
        >
            <div>
                <p className="text-slate-500 text-sm mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-slate-800">{count}</h3>
            </div>
            <div className={`p-3 rounded-xl ${color}`}>
                <Icon className="w-6 h-6" />
            </div>
        </motion.div>
    );

    return (
        <div className="min-h-screen bg-slate-50/50 p-4 sm:p-8 font-sans" dir="rtl">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">مرکز پشتیبانی</h1>
                        <p className="text-slate-500 mt-1">مدیریت و پیگیری درخواست‌های شما</p>
                    </div>
                    <Link href="/account/tickets/new">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
                        >
                            <Plus className="w-5 h-5" />
                            ثبت تیکت جدید
                        </motion.button>
                    </Link>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard title="کل تیکت‌ها" count={stats.total} color="bg-blue-100 text-blue-600" icon={List} />
                    <StatCard title="در انتظار پاسخ" count={stats.waiting} color="bg-rose-100 text-rose-600" icon={Clock} />
                    <StatCard title="پاسخ داده شده" count={stats.answered} color="bg-emerald-100 text-emerald-600" icon={MessageSquare} />
                    <StatCard title="بسته شده" count={stats.closed} color="bg-slate-100 text-slate-600" icon={CheckCircle2} />
                </div>

                {/* Filters & Content */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
                        <div className="relative w-full sm:w-96">
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="جستجو در موضوع یا شناسه..."
                                className="w-full bg-slate-50 border-none rounded-xl py-3 pr-10 pl-4 text-sm focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium transition-colors">
                                <Filter className="w-4 h-4" />
                                فیلترها
                            </button>
                            <div className="h-6 w-[1px] bg-slate-200 mx-2 hidden sm:block"></div>
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2.5 rounded-xl transition-colors ${viewMode === 'grid' ? 'bg-emerald-50 text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <LayoutGrid className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2.5 rounded-xl transition-colors ${viewMode === 'list' ? 'bg-emerald-50 text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <List className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="min-h-[300px] p-5">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-full space-y-3 py-20">
                                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                                <span className="text-slate-500">در حال دریافت اطلاعات...</span>
                            </div>
                        ) : error ? (
                            <div className="flex flex-col items-center justify-center h-full py-20 text-rose-500">
                                <AlertCircle className="w-10 h-10 mb-2" />
                                <span>خطا در دریافت اطلاعات. لطفا دوباره تلاش کنید.</span>
                            </div>
                        ) : filteredTickets.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full py-20 text-slate-400">
                                <MessageSquare className="w-12 h-12 mb-3 opacity-20" />
                                <span>تیکتی یافت نشد!</span>
                            </div>
                        ) : (
                            <div className={`grid gap-5 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
                                <AnimatePresence>
                                    {filteredTickets.map((ticket, i) => {
                                        const config = statusConfig[ticket.Status] || statusConfig.default;
                                        const StatusIcon = config.icon;
                                        const departmentName = departmentMap[ticket.Department] || departmentMap.default;

                                        return (
                                            <Link key={ticket.Id} href={`/account/tickets/${ticket.Id}`}>
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                    transition={{ delay: i * 0.05 }}
                                                    whileHover={{ y: -4, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)" }}
                                                    className={`group relative bg-white p-5 rounded-2xl border transition-all duration-300 ${viewMode === 'list' ? 'flex items-center justify-between border-slate-100' : 'border-slate-200 hover:border-emerald-300'}`}
                                                >
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <div className="flex items-center gap-2">
                                                                <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${config.bg} ${config.text} flex items-center gap-1.5`}>
                                                                    <StatusIcon className="w-3 h-3" />
                                                                    {config.label}
                                                                </span>
                                                                {/* نمایش دایره قرمز اگر پیام نخوانده وجود دارد */}
                                                                {ticket.UnreadCount > 0 && (
                                                                    <span className="flex items-center justify-center w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full">
                                                                        {ticket.UnreadCount}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <span className="text-xs text-slate-400 font-mono">#{ticket.Id}</span>
                                                        </div>

                                                        <h3 className="font-bold text-slate-800 mb-2 line-clamp-1 group-hover:text-emerald-700 transition-colors">
                                                            {ticket.Subject}
                                                        </h3>

                                                        <div className="flex items-center gap-4 text-xs text-slate-500 mt-4">
                                                            <span className="flex items-center gap-1">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                                                                {departmentName}
                                                            </span>
                                                            <span>•</span>
                                                            <span>{formatPersianDate(ticket.LastMessageAt || ticket.CreatedDate)}</span>
                                                        </div>
                                                    </div>

                                                    {viewMode === 'list' && (
                                                        <ChevronLeft className="w-5 h-5 text-slate-300 mr-4 group-hover:text-emerald-500 transition-colors" />
                                                    )}
                                                </motion.div>
                                            </Link>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}