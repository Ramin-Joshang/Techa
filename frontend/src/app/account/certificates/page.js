"use client";
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Award, Download, Search, Share2, Loader2,
    CheckCircle2, Clock, FileCheck, Sparkles,
    QrCode, Printer, Filter
} from 'lucide-react';
import { toast } from 'react-toastify';

// داده‌های نمونه با جزئیات بیشتر
const mockCertificates = [
    {
        id: 1,
        title: 'دوره جامع React.js & Next.js',
        instructor: 'مهرشاد براتی',
        issueDate: '۱۴۰۳/۰۳/۱۵',
        score: 98,
        duration: '۶۰ ساعت',
        code: 'CERT-RCT-2024-8842',
        status: 'issued', // issued, pending
        theme: 'blue'
    },
    {
        id: 2,
        title: 'متخصص UI/UX دیزاین',
        instructor: 'سارا ملکی',
        issueDate: '۱۴۰۳/۰۲/۲۸',
        score: null,
        duration: '۴۵ ساعت',
        code: null,
        status: 'pending',
        theme: 'purple'
    },
    {
        id: 3,
        title: 'مهارت‌های نرم و فریلنسری',
        instructor: 'علی کریمی',
        issueDate: '۱۴۰۳/۰۳/۱۰',
        score: 100,
        duration: '۲۰ ساعت',
        code: 'CERT-SFT-2024-1122',
        status: 'issued',
        theme: 'amber'
    },
    {
        id: 4,
        title: 'پایتون برای علم داده',
        instructor: 'رضا علوی',
        issueDate: '۱۴۰۳/۰۲/۲۰',
        score: null,
        duration: '۵۰ ساعت',
        code: null,
        status: 'pending',
        theme: 'green'
    },
    {
        id: 5,
        title: 'امنیت وب و هک اخلاقی',
        instructor: 'محمد حسینی',
        issueDate: '۱۴۰۳/۰۳/۱۲',
        score: 95,
        duration: '۴۰ ساعت',
        code: 'CERT-SEC-2024-9988',
        status: 'issued',
        theme: 'red'
    },
];

export default function CertificatesPage() {
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [requestingId, setRequestingId] = useState(null);

    // محاسبات آماری
    const stats = useMemo(() => {
        const total = mockCertificates.length;
        const issued = mockCertificates.filter(c => c.status === 'issued').length;
        const pending = total - issued;
        return { total, issued, pending };
    }, []);

    // فیلتر کردن لیست
    const filteredList = mockCertificates.filter(cert => {
        const matchesSearch = cert.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filter === 'all' ? true : cert.status === filter;
        return matchesSearch && matchesFilter;
    });

    // شبیه‌سازی درخواست مدرک
    const handleRequest = (id) => {
        setRequestingId(id);
        setTimeout(() => {
            toast.success('درخواست شما با موفقیت ثبت شد و در حال بررسی است.');
            setRequestingId(null);
        }, 2000);
    };

    const handleShare = (code) => {
        navigator.clipboard.writeText(`https://toplearn.com/verify/${code}`);
        toast.info('لینک اعتبارسنجی مدرک کپی شد.');
    };

    return (
        <div className="min-h-screen bg-slate-50/50 pb-20 px-4 sm:px-8 font-sans text-slate-800" dir="rtl">

            {/* --- Header Section --- */}
            <header className="pt-10 pb-8 max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8"
                >
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-2">
                            گواهینامه‌های <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">افتخار</span>
                        </h1>
                        <p className="text-slate-500 text-lg">سوابق تحصیلی و مدارک رسمی شما</p>
                    </div>

                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl font-medium transition-all shadow-sm">
                            <Printer className="w-5 h-5 text-slate-500" />
                            <span className="hidden sm:inline">چاپ لیست</span>
                        </button>
                    </div>
                </motion.div>

                {/* --- Stats Cards --- */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
                    <StatCard
                        title="کل مدارک دریافتی"
                        value={stats.total}
                        icon={Award}
                        color="indigo"
                        bg="bg-indigo-50"
                        iconColor="text-indigo-600"
                    />
                    <StatCard
                        title="صادر شده"
                        value={stats.issued}
                        icon={FileCheck}
                        color="emerald"
                        bg="bg-emerald-50"
                        iconColor="text-emerald-600"
                    />
                    <StatCard
                        title="در حال پردازش"
                        value={stats.pending}
                        icon={Clock}
                        color="amber"
                        bg="bg-amber-50"
                        iconColor="text-amber-600"
                    />
                </div>

                {/* --- Controls --- */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-8 flex flex-col md:flex-row gap-4 justify-between items-center sticky top-4 z-20 backdrop-blur-xl bg-white/90">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="جستجو در مدارک..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-50 border-none rounded-xl py-3 pr-10 pl-4 focus:ring-2 focus:ring-amber-500/20 transition-all text-sm"
                        />
                    </div>

                    <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto">
                        {[
                            { id: 'all', label: 'همه مدارک' },
                            { id: 'issued', label: 'صادر شده' },
                            { id: 'pending', label: 'در انتظار' }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setFilter(tab.id)}
                                className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-medium transition-all ${filter === tab.id
                                        ? 'bg-white text-slate-800 shadow-sm font-bold'
                                        : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* --- Certificates Grid --- */}
                <motion.div layout className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <AnimatePresence>
                        {filteredList.map((cert) => (
                            <CertificateCard
                                key={cert.id}
                                cert={cert}
                                onRequest={handleRequest}
                                requestingId={requestingId}
                                onShare={handleShare}
                            />
                        ))}
                    </AnimatePresence>
                </motion.div>

                {filteredList.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300 mt-6">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-700">مدرکی یافت نشد</h3>
                        <p className="text-slate-500">لطفا فیلترها را تغییر دهید.</p>
                    </div>
                )}
            </header>
        </div>
    );
}

// --- Sub Components ---

const StatCard = ({ title, value, icon: Icon, bg, iconColor }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="bg-white p-6 rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100 flex items-center justify-between"
    >
        <div>
            <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
            <h3 className="text-3xl font-extrabold text-slate-800">{value}</h3>
        </div>
        <div className={`p-4 rounded-2xl ${bg}`}>
            <Icon className={`w-7 h-7 ${iconColor}`} />
        </div>
    </motion.div>
);

const CertificateCard = ({ cert, onRequest, requestingId, onShare }) => {
    const isIssued = cert.status === 'issued';
    const isProcessing = requestingId === cert.id;

    // انتخاب گرادینت بر اساس تم
    const getGradient = () => {
        const gradients = {
            blue: 'from-blue-500 to-cyan-400',
            purple: 'from-purple-500 to-indigo-500',
            amber: 'from-amber-400 to-orange-500',
            green: 'from-emerald-400 to-teal-500',
            red: 'from-rose-400 to-red-500',
        };
        return gradients[cert.theme] || 'from-slate-500 to-slate-700';
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileHover={{ y: -5 }}
            className="group relative bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300"
        >
            {/* Top Decoration */}
            <div className={`h-2 w-full bg-gradient-to-r ${isIssued ? getGradient() : 'from-slate-300 to-slate-400'}`}></div>

            <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex gap-4">
                        {/* Certificate Icon / Thumbnail */}
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner ${isIssued ? 'bg-slate-50' : 'bg-slate-50 grayscale'}`}>
                            {isIssued ? (
                                <Award className="w-8 h-8 text-amber-500 drop-shadow-sm" />
                            ) : (
                                <Clock className="w-8 h-8 text-slate-400" />
                            )}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-800 mb-1 line-clamp-1">{cert.title}</h3>
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <span>مدرس: {cert.instructor}</span>
                                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                <span>{cert.duration}</span>
                            </div>
                        </div>
                    </div>
                    {isIssued && (
                        <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            معتبر
                        </div>
                    )}
                </div>

                {/* Certificate Details (Grid) */}
                <div className="bg-slate-50 rounded-2xl p-4 grid grid-cols-2 gap-y-4 gap-x-2 mb-6 border border-slate-100 relative overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                        style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                    </div>

                    <DetailItem label="تاریخ صدور" value={cert.issueDate} />
                    <DetailItem label="نمره نهایی" value={cert.score ? `${cert.score}/100` : '---'} />
                    <div className="col-span-2 border-t border-slate-200 pt-3 mt-1">
                        <p className="text-[10px] text-slate-400 mb-1">کد اعتبارسنجی</p>
                        <div className="flex justify-between items-center font-mono text-xs text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                            {cert.code || 'در انتظار صدور...'}
                            {isIssued && <QrCode className="w-4 h-4 text-slate-400" />}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    {isIssued ? (
                        <>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`flex-1 bg-gradient-to-r ${getGradient()} text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2`}
                            >
                                <Download className="w-4 h-4" />
                                دانلود PDF
                            </motion.button>
                            <motion.button
                                onClick={() => onShare(cert.code)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-4 py-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors"
                            >
                                <Share2 className="w-5 h-5" />
                            </motion.button>
                        </>
                    ) : (
                        <motion.button
                            onClick={() => onRequest(cert.id)}
                            disabled={isProcessing}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full bg-slate-800 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isProcessing ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Sparkles className="w-5 h-5" />
                            )}
                            {isProcessing ? 'در حال پردازش...' : 'درخواست صدور مدرک'}
                        </motion.button>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

const DetailItem = ({ label, value }) => (
    <div>
        <p className="text-[10px] text-slate-400 mb-0.5">{label}</p>
        <p className="text-sm font-bold text-slate-700">{value}</p>
    </div>
);