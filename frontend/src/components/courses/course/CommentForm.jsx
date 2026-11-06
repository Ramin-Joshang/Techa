"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Send } from 'lucide-react';
import { toast } from 'react-toastify';

const CommentForm = ({ handleAddComment }) => {
    const [newComment, setNewComment] = useState({
        userName: "", // نکته: در API واقعی معمولا نام کاربر از توکن گرفته می‌شود نه اینپوت
        rating: 0,
        comment: "",
    });
    const [hoverRating, setHoverRating] = useState(0);

    const handleSubmit = () => {
        // نام کاربری معمولاً اتوماتیک سمت سرور پر می‌شود، اما اگر فرم لاگین ندارید اینجا نگه داشتم
        if (newComment.comment && newComment.rating > 0) {
            handleAddComment(newComment, () => setNewComment({ userName: "", rating: 0, comment: "" }));
        } else {
            toast.warn("لطفاً امتیاز و متن نظر را وارد کنید.");
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-sm border border-slate-100 p-6 md:p-8 rounded-3xl shadow-xl shadow-slate-200/50 mb-12"
        >
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <span className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
                    <Send size={20} />
                </span>
                دیدگاه خود را ثبت کنید
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">
                {/* بخش نام را حذف کردم چون در API فیلد UserId وجود دارد و نام از سمت سرور هندل می‌شود. 
                    اما اگر کاربر مهمان است، اینپوت زیر را نگه دارید */}
                {/* 
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-600">نام کامل</label>
                    <input ... />
                </div> 
                */}

                {/* Interactive Star Rating */}
                <div className="space-y-2 col-span-2 md:col-span-1">
                    <label className="text-sm font-medium text-slate-600">امتیاز شما</label>
                    <div className="flex gap-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 h-[50px] items-center" onMouseLeave={() => setHoverRating(0)}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                onClick={() => setNewComment({ ...newComment, rating: star })}
                                onMouseEnter={() => setHoverRating(star)}
                                className="focus:outline-none transition-transform hover:scale-110"
                            >
                                <Star
                                    size={24}
                                    className={`transition-colors duration-200 ${star <= (hoverRating || newComment.rating)
                                        ? "fill-amber-400 text-amber-400 drop-shadow-sm"
                                        : "text-slate-300"
                                        }`}
                                />
                            </button>
                        ))}
                        <span className="mr-auto text-sm text-slate-400 font-medium">
                            {hoverRating || newComment.rating ? (hoverRating || newComment.rating) + " از 5" : "انتخاب کنید"}
                        </span>
                    </div>
                </div>
            </div>

            {/* Textarea */}
            <div className="space-y-2 mb-6">
                <label className="text-sm font-medium text-slate-600">متن نظر</label>
                <textarea
                    value={newComment.comment}
                    onChange={(e) => setNewComment({ ...newComment, comment: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-400 min-h-[120px] resize-none"
                    placeholder="تجربه خود را با ما در میان بگذارید..."
                ></textarea>
            </div>

            {/* Button */}
            <div className="flex justify-end">
                <button
                    onClick={handleSubmit}
                    className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/40 hover:-translate-y-1 transition-all flex items-center gap-2"
                >
                    ارسال نظر
                    <Send size={18} className="rotate-180" />
                </button>
            </div>
        </motion.div>
    );
};

export default CommentForm;