"use client";
import { motion } from "framer-motion";
import { PlayCircle, CheckCircle, AlertCircle } from "lucide-react";

const SessionItem = ({ session, sessionIndex, isSelected, onClick }) => {
    const getBadgeStatus = () => {
        switch (session.ExerciseStatus) {
            case 1: return "not_started";
            case 2: return "pending";
            case 3: return "completed";
            case 4: return "rejected";
        }
    };

    const SessionBadge = ({ status }) => {
        switch (status) {
            case "completed":
                return (
                    <div className="flex items-center gap-2 text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full">
                        <CheckCircle size={16} />
                        <span className="text-sm font-medium hidden md:inline-block">تکمیل شده</span>
                    </div>
                );
            case "pending":
                return (
                    <div className="flex items-center gap-2 text-amber-600 bg-amber-100 px-3 py-1 rounded-full">
                        <AlertCircle size={16} />
                        <span className="text-sm font-medium hidden md:inline-block">در انتظار بررسی</span>
                    </div>
                );
            case "rejected":
                return (
                    <div className="flex items-center gap-2 text-red-600 bg-red-100 px-3 py-1 rounded-full">
                        <AlertCircle size={16} />
                        <span className="text-sm font-medium hidden md:inline-block">نیاز به اصلاح</span>
                    </div>
                );
            default:
                return (
                    <div className="flex items-center gap-2 text-sky-600 bg-sky-100 px-3 py-1 rounded-full">
                        <span className="text-sm font-medium hidden md:inline-block">شروع تمرین</span>
                        <PlayCircle size={16} />
                    </div>
                );
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: sessionIndex * 0.1 }}
            className={`group cursor-pointer bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow border-2 ${isSelected
                ? "border-emerald-500 bg-emerald-50"
                : "border-gray-100 hover:border-emerald-100"
                }`}
            onClick={onClick}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${isSelected
                            ? "bg-emerald-500 text-white"
                            : "bg-emerald-50 text-emerald-500"
                            }`}
                    >
                        <PlayCircle size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-medium text-gray-800">{session.Title}</h3>
                    </div>
                </div>
                <div className="min-w-fit">
                    <SessionBadge status={getBadgeStatus()} />
                </div>
            </div>
        </motion.div>
    );
};

export default SessionItem;
