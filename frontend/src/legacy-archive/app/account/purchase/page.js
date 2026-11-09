"use client";
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Wallet, Search, Filter, Download, ArrowUpRight,
    CreditCard, Calendar, Receipt, TrendingUp, TrendingDown,
    Package, CheckCircle2, XCircle, Clock, ChevronDown
} from 'lucide-react';
import Link from 'next/link';

// داده‌های نمونه غنی‌تر
const mockPurchases = [
    {
        id: 'ORD-2024-1001',
        title: 'دوره جامع React و Next.js',
        date: '۱۴۰۳/۰۳/۱۵',
        time: '۱۴:۳۰',
        originalPrice: 2_500_000,
        discount: 500_000,
        finalPrice: 2_000_000,
        status: 'success',
        paymentMethod: 'درگاه زرین‌پال',
        link: '/courses/react'
    },
    {
        id: 'ORD-2024-1002',
        title: 'مسترکلس UI/UX دیزاین',
        date: '۱۴۰۳/۰۳/۱۰',
        time: '۰۹:۱۵',
        originalPrice: 1_800_000,
        discount: 0,
        finalPrice: 1_800_000,
        status: 'pending',
        paymentMethod: 'کارت به کارت',
        link: '/courses/ui-ux'
    },
    {
        id: 'ORD-2024-1003',
        title: 'آموزش پروژه محور Python',
        date: '۱۴۰۳/۰۲/۲۸',
        time: '۱۸:۴۵',
        originalPrice: 900_000,
        discount: 90_000,
        finalPrice: 810_000,
        status: 'failed',
        paymentMethod: 'درگاه ملت',
        link: '/courses/python'
    },
    {
        id: 'ORD-2024-1004',
        title: 'دوره DevOps پیشرفته',
        date: '۱۴۰۳/۰۲/۱۵',
        time: '۱۱:۲۰',
        originalPrice: 3_000_000,
        discount: 1_000_000,
        finalPrice: 2_000_000,
        status: 'success',
        paymentMethod: 'کیف پول',
        link: '/courses/devops'
    },
];

export default function PurchaseHistory() {
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // فرمت قیمت
    const formatPrice = (price) => new Intl.NumberFormat('fa-IR').format(price);

    // محاسبات آماری
    const stats = useMemo(() => {
        const successPurchases = mockPurchases.filter(p => p.status === 'success');
        const totalSpent = successPurchases.reduce((acc, curr) => acc + curr.finalPrice, 0);
        const totalSavings = successPurchases.reduce((acc, curr) => acc + curr.discount, 0);
        const pendingCount = mockPurchases.filter(p => p.status === 'pending').length;

        return { totalSpent, totalSavings, pendingCount };
    }, []);

    // فیلتر کردن لیست
    const filteredPurchases = mockPurchases.filter(purchase => {
        const matchesSearch = purchase.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            purchase.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === 'all' ? true : purchase.status === filter;
        return matchesSearch && matchesFilter;
    });

    // استایل وضعیت‌ها
    const getStatusStyle = (status) => {
        switch (status) {
            case 'success':
                return { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', icon: CheckCircle2, label: 'موفق' };
            case 'pending':
                return { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', icon: Clock, label: 'در انتظار' };
            case 'failed':
                return { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-200', icon: XCircle, label: 'ناموفق' };
            default:
                return { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200', icon: Clock, label: 'نامشخص' };
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 pb-20 px-4 sm:px-8 font-sans text-slate-800" dir="rtl">

            {/* Header Section */}
            <header className="pt-10 pb-8 max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8"
                >
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-2">
                            کیف پول و تراکنش‌ها
                        </h1>
                        <p className="text-slate-500 text-lg">مدیریت پرداخت‌ها و سوابق خرید دوره‌ها</p>
                    </div>

                    <button className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm">
                        <Download className="w-5 h-5" />
                        دریافت گزارش کامل (PDF)
                    </button>
                </motion.div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <StatCard
                        title="مجموع پرداختی"
                        value={`${formatPrice(stats.totalSpent)} تومان`}
                        icon={Wallet}
                        trend="up"
                        trendValue="+۱۲٪ ماه گذشته"
                        color="indigo"
                    />
                    <StatCard
                        title="سود شما از تخفیف‌ها"
                        value={`${formatPrice(stats.totalSavings)} تومان`}
                        icon={TrendingUp}
                        trend="neutral"
                        color="emerald"
                    />
                    <StatCard
                        title="سفارشات در انتظار"
                        value={`${stats.pendingCount} مورد`}
                        icon={Package}
                        trend="down"
                        color="amber"
                    />
                </div>

                {/* Filter Bar */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="جستجو بر اساس نام دوره یا شماره سفارش..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-50 border-none rounded-xl py-3 pr-10 pl-4 focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm"
                        />
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative z-10">
                            <button
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-700 transition-colors text-sm font-medium"
                            >
                                <Filter className="w-4 h-4" />
                                {filter === 'all' ? 'همه وضعیت‌ها' : filter === 'success' ? 'موفق' : filter === 'pending' ? 'در انتظار' : 'ناموفق'}
                                <ChevronDown className={`w-4 h-4 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {isFilterOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-2"
                                    >
                                        {[
                                            { id: 'all', label: 'همه تراکنش‌ها' },
                                            { id: 'success', label: 'پرداخت‌های موفق' },
                                            { id: 'pending', label: 'در انتظار پرداخت' },
                                            { id: 'failed', label: 'تراکنش‌های ناموفق' }
                                        ].map(item => (
                                            <button
                                                key={item.id}
                                                onClick={() => { setFilter(item.id); setIsFilterOpen(false); }}
                                                className={`w-full text-right px-4 py-2 text-sm hover:bg-slate-50 transition-colors ${filter === item.id ? 'text-indigo-600 font-bold' : 'text-slate-600'}`}
                                            >
                                                {item.label}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* Transactions List */}
                <motion.div layout className="space-y-4">
                    <AnimatePresence>
                        {filteredPurchases.map((purchase, index) => {
                            const statusStyle = getStatusStyle(purchase.status);
                            const StatusIcon = statusStyle.icon;

                            return (
                                <motion.div
                                    layout
                                    key={purchase.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="group bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-all duration-300 hover:border-indigo-300 relative overflow-hidden"
                                >
                                    {/* Status Bar Indicator */}
                                    <div className={`absolute right-0 top-0 bottom-0 w-1 ${statusStyle.bg.replace('bg-', 'bg-').replace('-50', '-500')}`}></div>

                                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pr-4">

                                        {/* Left Side: Info */}
                                        <div className="flex items-start gap-4 flex-1">
                                            <div className={`p-3 rounded-2xl ${statusStyle.bg} ${statusStyle.text} hidden sm:flex`}>
                                                <Receipt className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <div className="flex flex-wrap items-center gap-3 mb-1">
                                                    <h3 className="text-lg font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">
                                                        {purchase.title}
                                                    </h3>
                                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border flex items-center gap-1 ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                                                        <StatusIcon className="w-3 h-3" />
                                                        {statusStyle.label}
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-medium">
                                                    <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">{purchase.id}</span>
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {purchase.date} - {purchase.time}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <CreditCard className="w-3 h-3" />
                                                        {purchase.paymentMethod}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Side: Price & Actions */}
                                        <div className="flex items-center justify-between w-full lg:w-auto gap-8 border-t lg:border-t-0 border-slate-100 pt-4 lg:pt-0">
                                            <div className="text-left">
                                                {purchase.discount > 0 && (
                                                    <div className="text-xs text-rose-500 line-through mb-0.5">
                                                        {formatPrice(purchase.originalPrice)}
                                                    </div>
                                                )}
                                                <div className="text-xl font-bold text-slate-800 flex items-center gap-1">
                                                    {formatPrice(purchase.finalPrice)}
                                                    <span className="text-xs font-normal text-slate-500">تومان</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                {purchase.status === 'success' && (
                                                    <Link href="/account/invoice/1">
                                                        <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors" title="دانلود فاکتور">
                                                            <Receipt className="w-5 h-5" />
                                                        </button>
                                                    </Link>
                                                )}
                                                <Link href={purchase.link}>
                                                    <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-slate-800/20">
                                                        مشاهده دوره
                                                        <ArrowUpRight className="w-4 h-4" />
                                                    </button>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </motion.div>

                {/* Empty State */}
                {filteredPurchases.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-dashed border-slate-300">
                        <div className="bg-slate-50 p-4 rounded-full mb-4">
                            <Search className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-700">تراکنشی یافت نشد</h3>
                        <p className="text-slate-500 mt-1">با تغییر فیلترها دوباره تلاش کنید.</p>
                    </div>
                )}
            </header>
        </div>
    );
}

// کامپوننت کارت آمار (Stat Card Component)
const StatCard = ({ title, value, icon: Icon, trend, trendValue, color }) => {
    const colors = {
        indigo: { bg: 'bg-indigo-500', text: 'text-white', iconBg: 'bg-white/20' },
        emerald: { bg: 'bg-emerald-500', text: 'text-white', iconBg: 'bg-white/20' },
        amber: { bg: 'bg-amber-500', text: 'text-white', iconBg: 'bg-white/20' },
    };

    const theme = colors[color];

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className={`${theme.bg} rounded-3xl p-6 shadow-xl shadow-${color}-500/20 relative overflow-hidden`}
        >
            <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2"></div>

            <div className="relative z-10 flex justify-between items-start">
                <div>
                    <p className={`text-sm font-medium ${theme.text} opacity-90 mb-1`}>{title}</p>
                    <h3 className={`text-2xl font-bold ${theme.text}`}>{value}</h3>
                </div>
                <div className={`p-3 rounded-2xl ${theme.iconBg} backdrop-blur-sm`}>
                    <Icon className={`w-6 h-6 ${theme.text}`} />
                </div>
            </div>

            {trend && (
                <div className="relative z-10 mt-4 flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-lg bg-white/20 ${theme.text} font-medium flex items-center gap-1`}>
                        {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : trend === 'down' ? <TrendingDown className="w-3 h-3" /> : null}
                        {trendValue}
                    </span>
                </div>
            )}
        </motion.div>
    );
};