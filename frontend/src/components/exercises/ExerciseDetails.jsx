import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Award,
    CheckCircle,
    Clock,
    ChevronLeft,
    XCircle,
    Loader2,
    TrendingUp,
    Zap,
    Flame,
    MessageSquare,
    Target,
    Star
} from "lucide-react";
import ExerciseEditor from "./ExerciseEditor";
import DueDate from "./DueDate";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import {
    fetchContentsWithExercises,
    fetchExercises,
    sendExercise,
} from "../../features/main/exercises/exercisesActions";
import { toast } from "react-toastify";
import { useParams, useRouter } from "next/navigation";
import { useDispatch } from "react-redux";

// انیمیشن‌های متغیر برای رندر زنجیره‌ای (Staggered)
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function ExerciseDetails({ exercise, onBack, slug }) {
    const [submitting, setSubmitting] = useState(false);
    const [code, setCode] = useState("");
    const MySwal = withReactContent(Swal);
    const router = useRouter();
    const { docId, lessonId } = useParams();
    const dispatch = useDispatch();

    // کانفیگ سطح دشواری
    const difficultyConfig = {
        1: { label: "آسان", color: "text-emerald-600", bg: "bg-emerald-500/10", border: "border-emerald-200", icon: <Award className="w-5 h-5" /> },
        2: { label: "متوسط", color: "text-amber-600", bg: "bg-amber-500/10", border: "border-amber-200", icon: <TrendingUp className="w-5 h-5" /> },
        3: { label: "دشوار", color: "text-orange-600", bg: "bg-orange-500/10", border: "border-orange-200", icon: <Zap className="w-5 h-5" /> },
        4: { label: "چالش‌برانگیز", color: "text-purple-600", bg: "bg-purple-500/10", border: "border-purple-200", icon: <Flame className="w-5 h-5" /> },
    };

    // کانفیگ وضعیت کاربر
    const statusConfig = {
        1: { label: "شروع نشده", color: "text-slate-600", bg: "bg-slate-100", border: "border-slate-200", icon: <Clock className="w-5 h-5" /> },
        2: { label: "در انتظار تصحیح", color: "text-blue-600", bg: "bg-blue-100", border: "border-blue-200", icon: <Loader2 className="w-5 h-5 animate-spin" /> },
        3: { label: "تکمیل شده", color: "text-emerald-600", bg: "bg-emerald-100", border: "border-emerald-200", icon: <CheckCircle className="w-5 h-5" /> },
        4: { label: "نیاز به اصلاح", color: "text-rose-600", bg: "bg-rose-100", border: "border-rose-200", icon: <XCircle className="w-5 h-5" /> },
    };

    const difficulty = difficultyConfig[exercise.Level] || difficultyConfig[1];
    const status = statusConfig[exercise.UserStatus] || statusConfig[1];

    const handleSubmit = async () => {
        if (!code) {
            toast.error("لطفاً پاسخ تمرین را وارد کنید");
            return;
        }

        const confirmResult = await MySwal.fire({
            title: "ارسال نهایی تمرین",
            text: "آیا از ارسال این تمرین مطمئن هستید؟ پس از ارسال، تا زمان بررسی مدرس امکان ویرایش وجود ندارد.",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "بله، ارسال کن",
            cancelButtonText: "انصراف",
            confirmButtonColor: "#10b981",
            cancelButtonColor: "#f43f5e",
            customClass: {
                popup: "rounded-3xl",
                confirmButton: "px-6 py-2.5 rounded-xl font-medium",
                cancelButton: "px-6 py-2.5 rounded-xl font-medium",
            },
        });

        if (!confirmResult.isConfirmed) return;

        setSubmitting(true);

        const data = {
            Id: exercise.UserExerciseProgId || 0,
            UserId: 1002, // طبق منطق قبلی شما
            ExerciseId: exercise.Id,
            Answer: code,
            Status: 2,
        };

        try {
            await dispatch(sendExercise(data)).unwrap();
            await Promise.all([
                dispatch(fetchContentsWithExercises({ Slug: slug })),
                dispatch(fetchExercises({ "@ContentId": lessonId })),
            ]);
            toast.success("تمرین با موفقیت ارسال شد و در صف بررسی قرار گرفت 🚀");
            setSubmitting(false);
            router.refresh();
            onBack();
        } catch (error) {
            console.error("Error sending exercise:", error);
            toast.error("خطا در ارسال تمرین: " + (error?.message || "مشکلی پیش آمد"));
            setSubmitting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl shadow-slate-200/50 dark:shadow-slate-900/50 overflow-hidden border border-slate-100 dark:border-slate-800"
        >
            {/* هدر جذاب */}
            <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 overflow-hidden">
                {/* افکت پس زمینه هدر */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>

                <button
                    onClick={onBack}
                    className="relative z-10 flex items-center gap-2 text-slate-300 hover:text-white transition-all bg-white/5 hover:bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10"
                >
                    <ChevronLeft className="w-5 h-5" />
                    <span className="font-medium text-sm">بازگشت به مسیر یادگیری</span>
                </button>

                <div className="flex items-center gap-3 relative z-10">
                    {/* نمایش حداکثر امتیاز (بر اساس دیتای JSON شما) */}
                    <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-sm">
                        <Target className="w-4 h-4 text-emerald-400" />
                        <span>امتیاز کل: <strong>{exercise.MaxScore || 100}</strong></span>
                    </div>

                    {/* نمایش نمره کاربر */}
                    {exercise.UserScore !== null && (
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", bounce: 0.5, delay: 0.3 }}
                            className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl px-5 py-2 flex items-center gap-3 shadow-lg shadow-emerald-500/20"
                        >
                            <div className="bg-white/20 rounded-full p-1.5">
                                <Star className="w-5 h-5 text-white fill-white" />
                            </div>
                            <div className="text-white flex items-baseline gap-1">
                                <span className="text-2xl font-black">{exercise.UserScore}</span>
                                <span className="text-xs font-medium opacity-80">نمره شما</span>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* محتوای اصلی */}
            <div className="p-6 md:p-8">
                {/* عنوان و توضیحات */}
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-slate-800 dark:text-white mb-4 tracking-tight">
                        {exercise.Title}
                    </h1>
                    <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 leading-loose text-lg">
                        {/* اینجا در صورت نیاز می‌توانید از dangerouslySetInnerHTML استفاده کنید اگر توضیحات HTML دارد */}
                        {exercise.Description}
                    </div>
                </div>

                {/* کارت‌های اطلاعاتی انیمیشن‌دار */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8"
                >
                    {/* سطح دشواری */}
                    <motion.div variants={itemVariants} className={`group flex items-center gap-4 p-5 rounded-2xl border ${difficulty.border} bg-white dark:bg-slate-800 hover:-translate-y-1 transition-transform duration-300 shadow-sm hover:shadow-md`}>
                        <div className={`p-3 rounded-xl ${difficulty.bg} ${difficulty.color} group-hover:scale-110 transition-transform`}>
                            {difficulty.icon}
                        </div>
                        <div>
                            <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">سطح دشواری</div>
                            <div className={`text-base font-bold ${difficulty.color}`}>{difficulty.label}</div>
                        </div>
                    </motion.div>

                    {/* وضعیت */}
                    <motion.div variants={itemVariants} className={`group flex items-center gap-4 p-5 rounded-2xl border ${status.border} bg-white dark:bg-slate-800 hover:-translate-y-1 transition-transform duration-300 shadow-sm hover:shadow-md`}>
                        <div className={`p-3 rounded-xl ${status.bg} ${status.color} group-hover:scale-110 transition-transform`}>
                            {status.icon}
                        </div>
                        <div>
                            <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">وضعیت فعلی</div>
                            <div className={`text-base font-bold ${status.color}`}>{status.label}</div>
                        </div>
                    </motion.div>

                    {/* مهلت (اگر وجود دارد) */}
                    {exercise.UserDueDate && (
                        <motion.div variants={itemVariants} className="group flex items-center gap-4 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:-translate-y-1 transition-transform duration-300 shadow-sm hover:shadow-md">
                            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 group-hover:scale-110 transition-transform">
                                <Clock className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">مهلت ارسال</div>
                                <div className="text-slate-700 dark:text-slate-200 font-medium">
                                    <DueDate utcDate={exercise.UserDueDate} />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </motion.div>

                {/* بازخورد مدرس */}
                <AnimatePresence>
                    {exercise.UserFeedback && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                            animate={{ opacity: 1, height: "auto", marginBottom: 32 }}
                            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                            transition={{ duration: 0.4, type: "spring", bounce: 0.2 }}
                            className="overflow-hidden"
                        >
                            <div className="relative bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-3xl p-6 sm:p-8">
                                <div className="absolute top-0 left-0 w-2 h-full bg-emerald-400 rounded-l-3xl"></div>
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm text-emerald-600 dark:text-emerald-400 shrink-0">
                                        <MessageSquare className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-400 mb-2">
                                            یادداشت مدرس برای شما
                                        </h3>
                                        <p className="text-emerald-800 dark:text-emerald-200 leading-relaxed text-base bg-white/50 dark:bg-slate-900/50 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-800/30">
                                            {exercise.UserFeedback}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ویرایشگر تمرین */}
                <div className="mt-8 bg-slate-50 dark:bg-slate-950 p-2 sm:p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-inner">
                    <ExerciseEditor
                        exercise={exercise}
                        slug={slug}
                        code={code}
                        setCode={setCode}
                        onSubmit={handleSubmit}
                        submitting={submitting}
                    />
                </div>
            </div>
        </motion.div>
    );
}
