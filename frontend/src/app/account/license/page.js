"use client";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Copy,
    Check,
    Search,
    Filter,
    Monitor,
    Smartphone,
    Laptop,
    ShieldCheck,
    AlertOctagon,
    Download,
    Key,
    Cpu,
    RefreshCw,
    HelpCircle,
    ChevronDown
} from "lucide-react";
import { toast } from "react-toastify";

// داده‌های نمونه غنی‌تر
const mockLicenses = [
    { id: 101, course: "دوره جامع React و Next.js", platform: "Windows", key: "RCT-8842-9931-ABCD", status: "active", expiry: "نامحدود", purchaseDate: "1403/03/15", icon: "react" },
    { id: 102, course: "متخصص پایتون", platform: "Android", key: "PYT-1122-3344-EFGH", status: "expiring", expiry: "5 روز", purchaseDate: "1403/01/10", icon: "python" },
    { id: 103, course: "آموزش UI/UX دیزاین", platform: "MacOS", key: "UIX-5566-7788-IJKL", status: "active", expiry: "نامحدود", purchaseDate: "1402/12/20", icon: "figma" },
    { id: 104, course: "برنامه‌نویسی فلاتر", platform: "Android", key: "FLT-9988-7766-MNOP", status: "expired", expiry: "پایان یافته", purchaseDate: "1402/10/05", icon: "flutter" },
    { id: 105, course: "دوره جامع DevOps", platform: "Windows", key: "DEV-4433-2211-QRST", status: "active", expiry: "نامحدود", purchaseDate: "1403/02/01", icon: "docker" },
];

export default function LicenseManager() {
    const [filter, setFilter] = useState("all"); // all, active, expired
    const [searchQuery, setSearchQuery] = useState("");
    const [copiedId, setCopiedId] = useState(null);

    // محاسبات آماری
    const stats = useMemo(() => {
        const total = mockLicenses.length;
        const active = mockLicenses.filter(l => l.status === "active").length;
        const expiring = mockLicenses.filter(l => l.status === "expiring").length;
        return { total, active, expiring };
    }, []);

    // فیلتر کردن داده‌ها
    const filteredLicenses = mockLicenses.filter(license => {
        const matchesSearch = license.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
            license.key.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesFilter =
            filter === "all" ? true :
                filter === "active" ? (license.status === "active" || license.status === "expiring") :
                    filter === "expired" ? license.status === "expired" : true;

        return matchesSearch && matchesFilter;
    });

    const handleCopy = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        toast.success("لایسنس کپی شد");
        setTimeout(() => setCopiedId(null), 2000);
    };

    const getPlatformIcon = (platform) => {
        switch (platform) {
            case "Windows": return <Monitor className="w-5 h-5" />;
            case "Android": return <Smartphone className="w-5 h-5" />;
            case "MacOS": return <Laptop className="w-5 h-5" />;
            default: return <Cpu className="w-5 h-5" />;
        }
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
                            مدیریت <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">لایسنس‌ها</span>
                        </h1>
                        <p className="text-slate-500 text-lg">دسترسی‌های فعال و کلیدهای نرم‌افزار شما</p>
                    </div>

                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl font-medium transition-all shadow-sm">
                            <Download className="w-5 h-5 text-emerald-600" />
                            <span className="hidden sm:inline">دانلود پلیر اختصاصی</span>
                        </button>
                    </div>
                </motion.div>

                {/* --- Stats Cards --- */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
                    <StatCard
                        title="لایسنس‌های فعال"
                        value={stats.active}
                        icon={ShieldCheck}
                        color="emerald"
                        desc="دسترسی مجاز"
                    />
                    <StatCard
                        title="در حال انقضا"
                        value={stats.expiring}
                        icon={AlertOctagon}
                        color="amber"
                        desc="نیاز به تمدید"
                    />
                    <StatCard
                        title="کل دوره‌ها"
                        value={stats.total}
                        icon={Cpu}
                        color="indigo"
                        desc="ثبت شده در حساب"
                    />
                </div>

                {/* --- Filters & Search --- */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4 justify-between items-center sticky top-4 z-20 backdrop-blur-xl bg-white/80">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="جستجو در دوره‌ها یا کد لایسنس..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-50 border-none rounded-xl py-3 pr-10 pl-4 focus:ring-2 focus:ring-emerald-500/20 transition-all text-sm"
                        />
                    </div>

                    <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto">
                        {['all', 'active', 'expired'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setFilter(tab)}
                                className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-medium transition-all ${filter === tab
                                        ? 'bg-white text-emerald-700 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                {tab === 'all' && 'همه'}
                                {tab === 'active' && 'فعال'}
                                {tab === 'expired' && 'منقضی'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* --- List Content --- */}
                <motion.div layout className="space-y-4">
                    <AnimatePresence>
                        {filteredLicenses.length > 0 ? (
                            filteredLicenses.map((license, index) => (
                                <LicenseCard
                                    key={license.id}
                                    license={license}
                                    index={index}
                                    onCopy={handleCopy}
                                    copiedId={copiedId}
                                    getPlatformIcon={getPlatformIcon}
                                />
                            ))
                        ) : (
                            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
                                <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                <h3 className="text-lg font-bold text-slate-700">موردی یافت نشد</h3>
                                <p className="text-slate-500">با تغییر فیلترها دوباره تلاش کنید.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* --- Help Section --- */}
                <div className="mt-12 bg-indigo-50 rounded-3xl p-8 border border-indigo-100 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-100 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-indigo-900 mb-2 flex items-center gap-2">
                                <HelpCircle className="w-6 h-6" />
                                راهنمای فعال‌سازی
                            </h3>
                            <p className="text-indigo-700/80 mb-6 leading-relaxed">
                                برای استفاده از دوره‌ها، ابتدا پلیر اختصاصی را دانلود کرده و نصب نمایید. سپس لایسنس مربوطه را کپی کرده و در بخش فعال‌سازی نرم‌افزار وارد کنید. هر لایسنس تنها برای یک دستگاه قابل استفاده است.
                            </p>
                            <div className="flex gap-3">
                                <button className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors">
                                    آموزش تصویری
                                </button>
                                <button className="px-5 py-2.5 bg-white text-indigo-700 border border-indigo-200 rounded-xl text-sm font-medium hover:bg-indigo-50 transition-colors">
                                    تماس با پشتیبانی
                                </button>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                            <div className="bg-white p-4 rounded-2xl shadow-sm border border-indigo-100 text-center w-32">
                                <div className="text-2xl font-bold text-indigo-600 mb-1">1</div>
                                <div className="text-xs text-indigo-800 font-medium">دانلود پلیر</div>
                            </div>
                            <div className="bg-white p-4 rounded-2xl shadow-sm border border-indigo-100 text-center w-32">
                                <div className="text-2xl font-bold text-indigo-600 mb-1">2</div>
                                <div className="text-xs text-indigo-800 font-medium">کپی لایسنس</div>
                            </div>
                            <div className="bg-white p-4 rounded-2xl shadow-sm border border-indigo-100 text-center w-32">
                                <div className="text-2xl font-bold text-indigo-600 mb-1">3</div>
                                <div className="text-xs text-indigo-800 font-medium">فعال‌سازی</div>
                            </div>
                            <div className="bg-white p-4 rounded-2xl shadow-sm border border-indigo-100 text-center w-32">
                                <div className="text-2xl font-bold text-indigo-600 mb-1">4</div>
                                <div className="text-xs text-indigo-800 font-medium">شروع یادگیری</div>
                            </div>
                        </div>
                    </div>
                </div>

            </header>
        </div>
    );
}

// --- Sub Components ---

const StatCard = ({ title, value, icon: Icon, color, desc }) => {
    const colors = {
        emerald: { bg: 'bg-emerald-500', text: 'text-emerald-500', light: 'bg-emerald-50' },
        amber: { bg: 'bg-amber-500', text: 'text-amber-500', light: 'bg-amber-50' },
        indigo: { bg: 'bg-indigo-500', text: 'text-indigo-500', light: 'bg-indigo-50' },
    };
    const theme = colors[color];

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="bg-white p-6 rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100 relative overflow-hidden"
        >
            <div className={`absolute top-0 right-0 w-24 h-24 ${theme.light} rounded-bl-full -mr-4 -mt-4 opacity-50`}></div>
            <div className="relative z-10 flex justify-between items-start">
                <div>
                    <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
                    <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
                    <p className={`text-xs mt-2 font-medium ${theme.text} flex items-center gap-1`}>
                        <RefreshCw className="w-3 h-3" />
                        {desc}
                    </p>
                </div>
                <div className={`p-3 rounded-2xl ${theme.light}`}>
                    <Icon className={`w-6 h-6 ${theme.text}`} />
                </div>
            </div>
        </motion.div>
    );
};

const LicenseCard = ({ license, index, onCopy, copiedId, getPlatformIcon }) => {
    const isCopied = copiedId === license.id;
    const isActive = license.status === "active";
    const isExpiring = license.status === "expiring";

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`group bg-white rounded-2xl border p-1 transition-all duration-300 hover:shadow-lg ${isActive ? 'border-slate-200 hover:border-emerald-300' : 'border-slate-200 opacity-80'}`}
        >
            <div className="flex flex-col lg:flex-row items-stretch gap-4 p-4 lg:p-2 rounded-xl">

                {/* Course Info */}
                <div className="flex items-center gap-4 flex-1">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                        {getPlatformIcon(license.platform)}
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-slate-800 text-lg group-hover:text-emerald-700 transition-colors">
                                {license.course}
                            </h3>
                            {isExpiring && (
                                <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold animate-pulse">
                                    به زودی
                                </span>
                            )}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
                            <span className="flex items-center gap-1">
                                <Monitor className="w-3 h-3" />
                                {license.platform}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                            <span>خرید: {license.purchaseDate}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                            <span>اعتبار: {license.expiry}</span>
                        </div>
                    </div>
                </div>

                {/* License Key & Actions */}
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto bg-slate-50 lg:bg-transparent rounded-xl p-3 lg:p-0">
                    <div className="flex flex-col items-center sm:items-end gap-1 w-full sm:w-auto">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">License Key</span>
                        <div className="font-mono text-slate-700 bg-white lg:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 text-sm tracking-wide select-all w-full text-center sm:text-right">
                            {license.key}
                        </div>
                    </div>

                    <button
                        onClick={() => onCopy(license.key, license.id)}
                        className={`w-full sm:w-auto h-12 px-6 rounded-xl flex items-center justify-center gap-2 font-medium transition-all active:scale-95 ${isCopied
                                ? 'bg-emerald-600 text-white shadow-emerald-500/30'
                                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-emerald-300'
                            }`}
                    >
                        {isCopied ? (
                            <>
                                <Check className="w-5 h-5" />
                                <span className="lg:hidden">کپی شد</span>
                            </>
                        ) : (
                            <>
                                <Copy className="w-5 h-5" />
                                <span className="lg:hidden">کپی لایسنس</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Status Indicator Bar */}
            <div className={`h-1 mx-4 rounded-full mb-2 ${isActive ? 'bg-emerald-500' :
                    isExpiring ? 'bg-amber-500' :
                        'bg-slate-300'
                }`}></div>
        </motion.div>
    );
};