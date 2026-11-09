import { motion } from "framer-motion";
import {
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    TrendingUp,
    Zap,
    Flame,
    Award,
    ChevronLeft,
} from "lucide-react";

export default function ExerciseCard({ exercise, index, onClick }) {
    // وضعیت تمرین
    const getStatusConfig = () => {
        switch (exercise.UserStatus) {
            case 2: // در انتظار تصحیح
                return {
                    bg: "bg-gradient-to-br from-amber-50 to-orange-50/70",
                    border: "border-amber-200/50",
                    text: "text-amber-700",
                    icon: <Clock className="w-4 h-4" />,
                    label: "در انتظار تصحیح",
                };
            case 3: // تکمیل شده
                return {
                    bg: "bg-gradient-to-br from-emerald-50 to-green-50/70",
                    border: "border-emerald-200/50",
                    text: "text-emerald-700",
                    icon: <CheckCircle className="w-4 h-4" />,
                    label: "تکمیل شده",
                };
            case 4: // نیاز به اصلاح
                return {
                    bg: "bg-gradient-to-br from-red-50 to-rose-50/70",
                    border: "border-red-200/50",
                    text: "text-red-700",
                    icon: <XCircle className="w-4 h-4" />,
                    label: "نیاز به اصلاح",
                };
            default: // تکمیل نشده
                return {
                    bg: "bg-gradient-to-br from-gray-50 to-slate-50/70",
                    border: "border-gray-200/50",
                    text: "text-gray-600",
                    icon: <AlertCircle className="w-4 h-4" />,
                    label: "شروع نشده",
                };
        }
    };

    // سطح دشواری
    const getDifficultyConfig = () => {
        switch (exercise.Level) {
            case 2: // متوسط
                return {
                    color: "text-blue-600",
                    bg: "bg-blue-100/80",
                    icon: <TrendingUp className="w-4 h-4" />,
                    label: "متوسط",
                };
            case 3: // دشوار
                return {
                    color: "text-orange-600",
                    bg: "bg-orange-100/80",
                    icon: <Zap className="w-4 h-4" />,
                    label: "دشوار",
                };
            case 4: // چالش برانگیز
                return {
                    color: "text-purple-600",
                    bg: "bg-purple-100/80",
                    icon: <Flame className="w-4 h-4" />,
                    label: "چالش برانگیز",
                };
            default: // آسان
                return {
                    color: "text-green-600",
                    bg: "bg-green-100/80",
                    icon: <Award className="w-4 h-4" />,
                    label: "آسان",
                };
        }
    };

    const status = getStatusConfig();
    const difficulty = getDifficultyConfig();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                delay: index * 0.08,
                type: "spring",
                stiffness: 80,
                damping: 15,
            }}
            whileHover={{
                y: -6,
                scale: 1.02,
                transition: { duration: 0.2 },
            }}
            className={`group relative rounded-2xl p-5 border-2 backdrop-blur-sm cursor-pointer overflow-hidden
        ${status.bg} ${status.border}
        shadow-lg hover:shadow-xl transition-all duration-300`}
            onClick={onClick}
        >
            {/* گرادینت پس‌زمینه متحرک */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />

            {/* الگوی نقطه‌چین در گوشه */}
            <div className="absolute top-0 left-0 w-24 h-24 opacity-5 pointer-events-none">
                <svg viewBox="0 0 100 100" className="w-full h-full text-gray-800">
                    <circle cx="20" cy="20" r="4" fill="currentColor" />
                    <circle cx="40" cy="40" r="4" fill="currentColor" />
                    <circle cx="60" cy="60" r="4" fill="currentColor" />
                    <circle cx="80" cy="80" r="4" fill="currentColor" />
                </svg>
            </div>

            {/* محتوای اصلی */}
            <div className="relative z-10">
                {/* ردیف بالا: سطح دشواری و امتیاز */}
                <div className="flex items-start justify-between mb-3">
                    {/* برچسب دشواری */}
                    <div
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
              ${difficulty.bg} ${difficulty.color} backdrop-blur-sm border border-white/30 shadow-sm`}
                    >
                        {difficulty.icon}
                        <span>{difficulty.label}</span>
                    </div>

                    {/* امتیاز کاربر (در صورت وجود) */}
                    {exercise.UserScore != null && (
                        <div className="relative">
                            <div className="bg-gradient-to-br from-emerald-400 to-green-500 text-white font-bold rounded-xl px-3 py-1.5 text-sm shadow-md flex items-center gap-1">
                                <span>{exercise.UserScore}</span>
                                <span className="text-xs opacity-80">از ۱۰۰</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* عنوان و توضیحات */}
                <div className="mb-4">
                    <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1 group-hover:text-gray-900 transition-colors">
                        {exercise.Title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                        {exercise.Description}
                    </p>
                </div>

                {/* بخش پایین: وضعیت و دکمه اقدام */}
                <div className="flex items-center justify-between mt-4">
                    {/* وضعیت با آیکون */}
                    <div
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
              bg-white/80 backdrop-blur-sm border ${status.border} ${status.text}`}
                    >
                        {status.icon}
                        <span>{status.label}</span>
                    </div>

                    {/* دکمه ادامه / مشاهده (نمایش در hover) */}
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        whileHover={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700"
                    >
                        <span>مشاهده تمرین</span>
                        <ChevronLeft className="w-4 h-4" />
                    </motion.div>
                </div>

                {/* نوار پیشرفت امتیاز (اگر امتیاز داشته باشد) */}
                {exercise.UserScore != null && (
                    <div className="mt-4 pt-3 border-t border-white/50">
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                            <span>پیشرفت شما</span>
                            <span className="font-medium">{exercise.UserScore}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200/70 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${exercise.UserScore}%` }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                className="h-full bg-gradient-to-r from-emerald-400 to-green-500 rounded-full"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* افکت hover روی کل کارت (مرز درخشان) */}
            <div
                className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-emerald-200/50
          transition-colors duration-300 pointer-events-none"
            />
        </motion.div>
    );
}