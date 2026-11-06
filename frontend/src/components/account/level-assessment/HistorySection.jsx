import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Calendar, Award, Clock, PieChart } from "lucide-react";
import TechBadge from "./TechBadge";
import { useState } from "react";

const getScoreColor = (percentage) => {
    if (percentage >= 85) return "text-emerald-600";
    if (percentage >= 60) return "text-amber-500";
    return "text-rose-500";
};

const getProgressColor = (percentage) => {
    if (percentage >= 85) return "bg-emerald-500";
    if (percentage >= 60) return "bg-amber-500";
    return "bg-rose-500";
};

const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("fa-IR", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(date);
};

const HistorySection = ({ history, className }) => {
    const [expandedId, setExpandedId] = useState(null);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`${className} mt-12`}
        >
            <h3 className="text-xl font-semibold text-emerald-800 mb-6 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-emerald-600" />
                تاریخچه نتایج
            </h3>

            {history.length === 0 ? (
                <div className="text-center p-8 bg-emerald-50 rounded-xl text-emerald-500 border-2 border-dashed border-emerald-100">
                    هیچ نتیجه‌ای ثبت نشده است
                </div>
            ) : (
                <div className="space-y-4">
                    <AnimatePresence initial={false}>
                        {history.map((record) => {
                            const percentage = record.total > 0 ? (record.score / record.total) * 100 : 0;
                            const timeSpent = () => {
                                const duration = record.duration || 0; // مقدار پیشفرض 0 اگر duration وجود نداشت
                                const minutes = Math.floor(duration / 60);
                                const seconds = duration % 60;
                                return `${minutes} دقیقه و ${seconds} ثانیه`;
                            };

                            return (
                                <motion.article
                                    key={record.id}
                                    layout
                                    transition={{ duration: 0.2, type: "spring" }}
                                    className="group p-5 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow 
                    border-2 border-emerald-50 hover:border-emerald-100 relative overflow-hidden"
                                >
                                    <button
                                        onClick={() => setExpandedId(expandedId === record.id ? null : record.id)}
                                        className="w-full focus:outline-none"
                                        aria-expanded={expandedId === record.id}
                                        aria-controls={`details-${record.id}`}
                                    >
                                        <div className="flex items-center justify-between gap-4">
                                            {/* Right Section - Date and Tech */}
                                            <div className="flex flex-col items-start gap-3">
                                                <time className="text-sm font-medium text-emerald-600">
                                                    {formatDate(record.date)}
                                                </time>
                                                <div className="flex flex-wrap gap-2">
                                                    {record.tech.slice(0, 3).map((t) => (
                                                        <TechBadge
                                                            key={t}
                                                            tech={t}
                                                            small
                                                            className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                                                        />
                                                    ))}
                                                    {record.tech.length > 3 && (
                                                        <TechBadge
                                                            tech={`+${record.tech.length - 3}`}
                                                            small
                                                            className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                                                        />
                                                    )}
                                                </div>
                                            </div>

                                            {/* Left Section - Score and Indicator */}
                                            <div className="flex items-center gap-6">
                                                <div className="flex items-center gap-2">
                                                    <Award className={`w-6 h-6 ${getScoreColor(percentage)}`} />
                                                    <span className={`font-semibold ${getScoreColor(percentage)}`}>
                                                        {record.score}
                                                        <span className="text-emerald-500">/{record.total}</span>
                                                    </span>
                                                </div>
                                                <ChevronRight
                                                    className={`text-emerald-400 transition-transform ${expandedId === record.id ? "rotate-90" : ""
                                                        }`}
                                                />
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="mt-4 h-3 bg-emerald-100 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${percentage}%` }}
                                                className={`h-full ${getProgressColor(percentage)}`}
                                                transition={{ duration: 0.8, type: "spring" }}
                                            />
                                        </div>
                                    </button>

                                    {/* Expanded Details */}
                                    <AnimatePresence>
                                        {expandedId === record.id && (
                                            <motion.div
                                                id={`details-${record.id}`}
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="mt-4 pt-4 border-t border-emerald-100"
                                            >
                                                {/* Stats Row */}
                                                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                                                    <div className="flex items-center gap-2 text-emerald-700 p-3 bg-emerald-50 rounded-lg">
                                                        <Clock className="w-5 h-5 flex-shrink-0" />
                                                        <span className="font-medium">زمان:</span>
                                                        {timeSpent()}                                                    </div>
                                                    <div className="flex items-center gap-2 text-emerald-700 p-3 bg-emerald-50 rounded-lg">
                                                        <PieChart className="w-5 h-5 flex-shrink-0" />
                                                        <span className="font-medium">درصد موفقیت:</span>
                                                        {percentage.toFixed(1)}%
                                                    </div>
                                                </div>

                                                {/* Score Summary */}
                                                <div className="grid grid-cols-2 gap-3 mb-6">
                                                    <div className="p-3 bg-emerald-100 rounded-lg text-center">
                                                        <div className="text-sm text-emerald-700 mb-1">پاسخ صحیح</div>
                                                        <div className="text-2xl font-bold text-emerald-600">
                                                            {record.correct}
                                                        </div>
                                                    </div>
                                                    <div className="p-3 bg-rose-100 rounded-lg text-center">
                                                        <div className="text-sm text-rose-700 mb-1">پاسخ نادرست</div>
                                                        <div className="text-2xl font-bold text-rose-600">{record.wrong}</div>
                                                    </div>
                                                </div>

                                                {/* Questions Details */}
                                                <h4 className="text-base font-semibold text-emerald-800 mb-3">
                                                    جزئیات سوالات:
                                                </h4>
                                                <div className="space-y-2">
                                                    {record.details.map((question, index) => (
                                                        <div
                                                            key={question.questionId}
                                                            className={`p-3 rounded-lg flex flex-col sm:flex-row items-start sm:items-center 
                                justify-between gap-2 ${question.isCorrect
                                                                    ? "bg-emerald-50 border border-emerald-200"
                                                                    : "bg-rose-50 border border-rose-200"
                                                                }`}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm font-medium text-emerald-700">
                                                                    سوال {index + 1}:
                                                                </span>
                                                                <span className="text-sm text-emerald-600">
                                                                    {question.questionId
                                                                        .replace(/([a-z])(\d)/i, "$1 $2")
                                                                        .toUpperCase()}
                                                                </span>
                                                            </div>

                                                            <div className="flex items-center gap-3">
                                                                <span
                                                                    className={`text-sm font-medium ${question.isCorrect
                                                                        ? "text-emerald-600"
                                                                        : "text-rose-600"
                                                                        }`}
                                                                >
                                                                    {question.isCorrect ? "صحیح" : "نادرست"}
                                                                </span>
                                                                {question.answer === -1 ? (
                                                                    <span className="text-xs px-2 py-1 rounded bg-rose-500/10 text-rose-700">
                                                                        بدون پاسخ
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-xs px-2 py-1 rounded bg-emerald-500/10 text-emerald-700">
                                                                        گزینه {question.answer + 1}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.article>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}
        </motion.div>
    );
};

export default HistorySection;