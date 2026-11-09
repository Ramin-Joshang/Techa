"use client";
import { useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { motion } from 'framer-motion';
import { Send, Paperclip, HelpCircle, FileText, ChevronRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { addTicket } from '../../../../features/account/ticket/ticketsActions'; // مسیر اکشن خود را چک کنید

export default function NewTicket() {
    const dispatch = useDispatch();
    const router = useRouter();
    const { user } = useSelector(state => state.auth);
    const [loading, setLoading] = useState(false);

    const [ticketData, setTicketData] = useState({
        subject: '',
        department: 1, // 1: فنی، 2: مالی، 3: آموزش
        priority: 2,   // 1: کم، 2: متوسط، 3: بالا
        initialMessage: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!ticketData.subject || !ticketData.initialMessage) {
            alert("لطفاً موضوع و متن درخواست را وارد کنید.");
            return;
        }

        setLoading(true);

        const payload = {
            Subject: ticketData.subject,
            CustomerId: user?.Id || user?.id,
            Department: Number(ticketData.department),
            Priority: Number(ticketData.priority),
            InitialMessage: ticketData.initialMessage,
            MessageType: 0, // 0 برای پیام کاربر
            AttachmentId: null, // در صورت پیاده‌سازی آپلود، ID فایل اینجا قرار می‌گیرد
            AssignedToUserId: null
        };

        const result = await dispatch(addTicket(payload));

        setLoading(false);

        if (result.meta.requestStatus === 'fulfilled') {
            // هدایت به صفحه لیست تیکت‌ها یا مشاهده تیکت ثبت شده
            router.push('/account/tickets');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 p-4 sm:p-8 font-sans" dir="rtl">
            <div className="max-w-6xl mx-auto">

                {/* Back Button */}
                <Link href="/account/tickets" className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-600 mb-6 transition-colors">
                    <ChevronRight className="w-4 h-4" />
                    بازگشت به لیست تیکت‌ها
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Main Form Area */}
                    <div className="lg:col-span-2 space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200"
                        >
                            <h1 className="text-2xl font-bold text-slate-800 mb-1">ثبت درخواست جدید</h1>
                            <p className="text-slate-500 text-sm mb-8">لطفا جزئیات مشکل خود را با دقت وارد کنید تا سریع‌تر پاسخ بگیرید.</p>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Subject Input */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">موضوع تیکت</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="مثلاً: خطا در هنگام خرید دوره..."
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                        value={ticketData.subject}
                                        onChange={e => setTicketData({ ...ticketData, subject: e.target.value })}
                                    />
                                </div>

                                {/* Selectors */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">دپارتمان مربوطه</label>
                                        <div className="relative">
                                            <select
                                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none appearance-none transition-all cursor-pointer"
                                                value={ticketData.department}
                                                onChange={e => setTicketData({ ...ticketData, department: e.target.value })}
                                            >
                                                <option value={1}>پشتیبانی فنی</option>
                                                <option value={2}>امور مالی و فروش</option>
                                                <option value={3}>سوالات آموزشی</option>
                                            </select>
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                                <ChevronRight className="w-4 h-4 text-slate-400 rotate-90" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">میزان اهمیت</label>
                                        <div className="relative">
                                            <select
                                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none appearance-none transition-all cursor-pointer"
                                                value={ticketData.priority}
                                                onChange={e => setTicketData({ ...ticketData, priority: e.target.value })}
                                            >
                                                <option value={1}>معمولی (کم)</option>
                                                <option value={2}>متوسط</option>
                                                <option value={3}>خیلی مهم (اضطراری)</option>
                                            </select>
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                                <ChevronRight className="w-4 h-4 text-slate-400 rotate-90" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Editor */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">شرح درخواست</label>
                                    <div className="rounded-xl overflow-hidden border border-slate-200">
                                        <Editor
                                            apiKey='v12ld4fyiekikay5d5tuv6j4578f6daxybv4qrm2a0oymp5j'
                                            init={{
                                                height: 300,
                                                menubar: false,
                                                plugins: 'lists link wordcount',
                                                toolbar: 'undo redo | bold italic | bullist numlist | link | removeformat',
                                                content_style: 'body { font-family:Tahoma, Arial; font-size:14px; direction: rtl; }',
                                                directionality: 'rtl',
                                                placeholder: 'جزئیات مشکل خود را اینجا بنویسید...',
                                                statusbar: false,
                                            }}
                                            onEditorChange={(content) => setTicketData({ ...ticketData, initialMessage: content })}
                                        />
                                    </div>
                                </div>

                                {/* Attachment Zone (UI Only) */}
                                <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:bg-slate-50 hover:border-emerald-300 transition-colors cursor-pointer group">
                                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                        <Paperclip className="w-5 h-5" />
                                    </div>
                                    <p className="text-sm text-slate-600 font-medium">فایل‌ها را اینجا بکشید و رها کنید</p>
                                    <p className="text-xs text-slate-400 mt-1">یا برای انتخاب کلیک کنید (حداکثر ۵ مگابایت)</p>
                                </div>

                                {/* Actions */}
                                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                    <Link href="/account/tickets">
                                        <button type="button" className="px-6 py-3 rounded-xl text-slate-600 hover:bg-slate-100 font-medium transition-colors">
                                            انصراف
                                        </button>
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-8 py-3 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 transition-all flex items-center gap-2 disabled:bg-slate-300 disabled:shadow-none"
                                    >
                                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                        ارسال تیکت
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>

                    {/* Sidebar */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-6"
                    >
                        <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                    <HelpCircle className="w-5 h-5" />
                                </div>
                                <h3 className="font-bold text-blue-900">نکات مهم</h3>
                            </div>
                            <ul className="space-y-3 text-sm text-blue-800/80 leading-relaxed list-disc list-inside">
                                <li>قبل از ارسال تیکت، بخش سوالات متداول را مطالعه کنید.</li>
                                <li>برای مشکلات فنی، حتما اسکرین‌شات ضمیمه کنید.</li>
                                <li>پاسخگویی معمولا بین ۱ تا ۴ ساعت کاری زمان می‌برد.</li>
                            </ul>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-slate-400" />
                                مقالات پیشنهادی
                            </h3>
                            <div className="space-y-3">
                                {['نحوه دریافت لایسنس', 'مشکل در پخش ویدیو', 'قوانین بازگشت وجه'].map((item, i) => (
                                    <a key={i} href="#" className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 text-sm transition-colors group">
                                        <span>{item}</span>
                                        <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}