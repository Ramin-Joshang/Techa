"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Reply, User, MoreHorizontal, ShieldCheck } from 'lucide-react';

const CommentItem = ({ comment, index, handleAddReply }) => {
    const [isReplying, setIsReplying] = useState(false);
    const [replyText, setReplyText] = useState("");

    const renderStars = (rating) => {
        if (!rating) return null; // اگر امتیازی نیست (مثل ریپلای‌ها) نمایش نده
        return (
            <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                    <Star
                        key={i}
                        size={14}
                        className={`${i < Math.floor(rating) ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"
                            }`}
                    />
                ))}
            </div>
        );
    };

    const submitReply = () => {
        if (replyText.trim()) {
            handleAddReply(comment.id, replyText); // comment.id اینجا همان ParentId برای پاسخ می‌شود
            setReplyText("");
            setIsReplying(false);
        }
    };

    // تابع فرمت تاریخ
    const formatDate = (dateString) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleDateString("fa-IR", {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="group"
        >
            {/* کارت اصلی نظر */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-emerald-100 transition-all duration-300 relative overflow-hidden">
                <div className="flex items-start gap-4">
                    {/* آواتار */}
                    <div className="relative shrink-0">
                        <img
                            src={comment.userAvatar}
                            alt={comment.userName}
                            className="w-14 h-14 rounded-2xl object-cover shadow-sm ring-2 ring-white"
                            onError={(e) => { e.target.src = "https://i.pravatar.cc/150?u=default" }} // فال‌بک تصویر
                        />
                        <div className="absolute -bottom-2 -right-2 bg-emerald-50 text-emerald-600 rounded-lg p-1 border border-white shadow-sm">
                            <User size={12} />
                        </div>
                    </div>

                    {/* محتوا */}
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h4 className="font-bold text-slate-800 text-lg leading-tight flex items-center gap-2">
                                    {comment.userName}
                                </h4>
                                <span className="text-xs text-slate-400 mt-1 block font-medium">
                                    {formatDate(comment.date)}
                                </span>
                            </div>
                            {comment.rating > 0 && (
                                <div className="flex flex-col items-end gap-1">
                                    {renderStars(comment.rating)}
                                    <span className="text-xs font-bold text-slate-300 bg-slate-50 px-2 py-0.5 rounded-full">
                                        {comment.rating}
                                    </span>
                                </div>
                            )}
                        </div>

                        <p className="text-slate-600 leading-7 text-justify text-sm md:text-base mt-3">
                            {comment.comment}
                        </p>

                        {/* دکمه‌ها */}
                        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-50">
                            <button
                                onClick={() => setIsReplying(!isReplying)}
                                className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-600 transition-colors bg-slate-50 hover:bg-emerald-50 px-3 py-1.5 rounded-lg"
                            >
                                <Reply size={14} className="scale-x-[-1]" />
                                {isReplying ? "لغو پاسخ" : "پاسخ دهید"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* فرم پاسخ (Collapse) */}
            <AnimatePresence>
                {isReplying && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden pr-8 md:pr-16 mt-2"
                    >
                        <div className="flex gap-3 items-start relative">
                            <div className="absolute -right-6 top-[-20px] w-6 h-12 border-b-2 border-r-2 border-slate-200 rounded-br-xl -z-10"></div>
                            <textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                className="w-full bg-slate-50 border border-emerald-200 focus:border-emerald-400 rounded-xl p-3 text-sm focus:ring-0 outline-none transition-colors resize-none"
                                rows="3"
                                placeholder="پاسخ خود را بنویسید..."
                                autoFocus
                            />
                            <button
                                onClick={submitReply}
                                className="bg-emerald-500 text-white p-3 rounded-xl hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20"
                            >
                                <Reply size={18} className="rotate-180" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* لیست پاسخ‌ها (Threaded) */}
            {comment.replies && comment.replies.length > 0 && (
                <div className="relative mr-8 md:mr-10 mt-4 space-y-4">
                    <div className="absolute -right-5 top-[-20px] bottom-6 w-0.5 bg-gradient-to-b from-slate-200 to-transparent"></div>

                    {comment.replies.map((reply) => (
                        <motion.div
                            key={reply.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-slate-50/80 p-5 rounded-2xl border border-slate-100 relative"
                        >
                            <div className="absolute -right-5 top-6 w-5 h-0.5 bg-slate-200"></div>

                            <div className="flex items-start gap-3">
                                <img
                                    src={reply.userAvatar}
                                    alt={reply.userName}
                                    className="w-10 h-10 rounded-full object-cover ring-2 ring-white border border-slate-100"
                                    onError={(e) => { e.target.src = "https://i.pravatar.cc/150?u=default" }}
                                />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h5 className="font-bold text-slate-700 text-sm">{reply.userName}</h5>
                                        {/* تشخیص ادمین بودن بر اساس نام یا داده‌های دیگر - چون فیلد Role در جیسون نبود فرضی هندل شد */}
                                        {reply.userName.includes("پشتیبانی") && (
                                            <span className="bg-blue-100 text-blue-600 text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                                                <ShieldCheck size={10} />
                                                مدیر
                                            </span>
                                        )}
                                        <span className="text-[10px] text-slate-400 mr-auto">
                                            {formatDate(reply.date)}
                                        </span>
                                    </div>
                                    <p className="text-slate-600 text-sm leading-6">{reply.comment}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    );
};

export default CommentItem;