"use client";
import { useEffect, useState, useMemo, useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
    ChevronRight, Clock, AlertCircle, Hash, User,
    Paperclip, Send, MoreVertical, ShieldCheck, Loader2, Reply, X, Calendar
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'next/navigation';
import { fetchUserTicketById, addTicketReply } from '../../../../features/account/ticket/ticketsActions';

// --- Mappings ---
const statusConfig = {
    1: { label: 'باز', bg: 'bg-rose-50', text: 'text-rose-600', dot: 'bg-rose-500' },
    2: { label: 'پاسخ داده شده', bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-500' },
    3: { label: 'بسته شده', bg: 'bg-slate-100', text: 'text-slate-500', dot: 'bg-slate-400' },
};

const priorityMap = {
    1: { label: 'کم', color: 'text-blue-500' },
    2: { label: 'متوسط', color: 'text-amber-500' },
    3: { label: 'بالا', color: 'text-rose-500' },
};

export default function TicketDetail() {
    const dispatch = useDispatch();
    const { id } = useParams();
    const ticketId = Number(id);
    const scrollRef = useRef(null);

    // Redux State
    const { singleTicket, loading, replyLoading } = useSelector(state => state.tickets);
    const { user } = useSelector(state => state.auth);

    // Local State
    const [replyText, setReplyText] = useState('');
    const [replyTo, setReplyTo] = useState(null);

    // دریافت اطلاعات اولیه
    useEffect(() => {
        const userId = user?.Id || user?.id;
        if (userId && ticketId) {
            dispatch(fetchUserTicketById({ UserId: userId, TicketId: ticketId }));
        }
    }, [dispatch, user, ticketId]);

    // اسکرول خودکار به آخرین پیام
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [singleTicket]);

    // پارس کردن پیام‌ها از JSON String
    const messages = useMemo(() => {
        if (!singleTicket?.messages) return [];
        try {
            return typeof singleTicket.messages === 'string'
                ? JSON.parse(singleTicket.messages)
                : singleTicket.messages;
        } catch (e) {
            console.error("Parsing error:", e);
            return [];
        }
    }, [singleTicket]);

    // ارسال پاسخ
    const handleSend = async () => {
        if (!replyText.trim() && !replyTo) return;

        const payload = {
            TicketId: ticketId,
            SenderId: user?.Id || user?.id,
            MessageText: replyText,
            MessageType: 0, // 0 = پیام مشتری
            AttachmentId: null,
            IsInternal: false,
            RepliedToMessageId: replyTo ? replyTo.id : null
        };

        const result = await dispatch(addTicketReply(payload));
        if (result.meta.requestStatus === 'fulfilled') {
            setReplyText('');
            setReplyTo(null);
            // رفرش لیست پیام‌ها
            dispatch(fetchUserTicketById({ UserId: user?.Id || user?.id, TicketId: ticketId }));
        }
    };

    if (loading && !singleTicket) {
        return (
            <div className="h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
                    <p className="text-slate-500 animate-pulse">در حال بارگذاری گفتگو...</p>
                </div>
            </div>
        );
    }

    const currentStatus = statusConfig[singleTicket?.status] || statusConfig[1];

    return (
        <div className="min-h-screen bg-[#F4F7FE] p-4 lg:p-6 font-sans" dir="rtl">
            <div className="max-w-6xl mx-auto h-[90vh] flex flex-col gap-4">

                {/* --- Breadcrumb & Actions --- */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-2">
                    <div className="flex items-center gap-2 text-sm">
                        <Link href="/account/tickets" className="text-slate-400 hover:text-emerald-600 transition-colors">تیکت‌های من</Link>
                        <ChevronRight className="w-4 h-4 text-slate-300" />
                        <span className="font-bold text-slate-700">تیکت شماره #{singleTicket?.id}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${currentStatus.bg} ${currentStatus.text}`}>
                            <span className={`w-2 h-2 rounded-full ${currentStatus.dot}`}></span>
                            وضعیت: {currentStatus.label}
                        </div>
                    </div>
                </div>

                <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">

                    {/* --- Main Chat Card --- */}
                    <div className="flex-1 bg-white rounded-[2rem] border border-slate-200/60 shadow-xl shadow-slate-200/40 flex flex-col overflow-hidden">

                        {/* Chat Header */}
                        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white/80 backdrop-blur-md">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500">
                                    <Hash className="w-6 h-6" />
                                </div>
                                <div>
                                    <h1 className="font-extrabold text-slate-800 text-lg line-clamp-1">{singleTicket?.subject}</h1>
                                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(singleTicket?.createdDate).toLocaleDateString('fa-IR')}</span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(singleTicket?.lastMessageAt).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                </div>
                            </div>
                            <button className="p-2.5 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors">
                                <MoreVertical className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-6 space-y-8 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-slate-50/30"
                        >
                            {messages.map((msg, idx) => {
                                const isMe = msg.senderId === (user?.Id || user?.id);
                                const repliedMsg = msg.repliedToMessageId ? messages.find(m => m.id === msg.repliedToMessageId) : null;

                                return (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, x: isMe ? -20 : 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className={`flex ${isMe ? 'justify-start' : 'justify-end'} group`}
                                    >
                                        <div className={`flex gap-3 max-w-[80%] ${isMe ? 'flex-row' : 'flex-row-reverse'}`}>
                                            <div className={`w-10 h-10 rounded-2xl shrink-0 flex items-center justify-center shadow-sm ${isMe ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}>
                                                {isMe ? <User className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                                            </div>

                                            <div className={`flex flex-col ${isMe ? 'items-start' : 'items-end'}`}>
                                                <div className="flex items-center gap-2 mb-1.5 px-1">
                                                    <span className="text-xs font-bold text-slate-700">{msg.senderName}</span>
                                                    <span className="text-[10px] text-slate-400">
                                                        {new Date(msg.createdDate).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>

                                                <div className={`relative p-4 rounded-3xl text-sm leading-relaxed ${isMe
                                                    ? 'bg-emerald-600 text-white rounded-tr-none shadow-emerald-200'
                                                    : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none shadow-slate-100'
                                                    } ${msg.isInternal ? 'border-2 border-dashed border-amber-400 bg-amber-50 text-amber-900' : 'shadow-lg'}`}>

                                                    {/* ریپلای شده */}
                                                    {repliedMsg && (
                                                        <div className={`mb-3 p-3 rounded-2xl text-[11px] border-r-4 ${isMe ? 'bg-emerald-700/40 border-emerald-300 text-emerald-50' : 'bg-slate-100 border-slate-400 text-slate-500'}`}>
                                                            <p className="font-bold mb-1 opacity-80">{repliedMsg.senderName}</p>
                                                            <p className="line-clamp-2 italic opacity-90">{repliedMsg.messageText.replace(/<[^>]*>?/gm, '')}</p>
                                                        </div>
                                                    )}

                                                    <div className="prose prose-sm max-w-none prose-p:leading-relaxed" dangerouslySetInnerHTML={{ __html: msg.messageText }} />

                                                    {/* دکمه ریپلای */}
                                                    <button
                                                        onClick={() => setReplyTo(msg)}
                                                        className={`absolute top-0 ${isMe ? '-left-10' : '-right-10'} opacity-0 group-hover:opacity-100 transition-all p-2 bg-white shadow-md rounded-full text-slate-400 hover:text-emerald-600 hover:scale-110`}
                                                    >
                                                        <Reply className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Reply Input Area */}
                        <div className="p-5 bg-white border-t border-slate-100">
                            <AnimatePresence>
                                {replyTo && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0, y: 10 }}
                                        animate={{ height: 'auto', opacity: 1, y: 0 }}
                                        exit={{ height: 0, opacity: 0, y: 10 }}
                                        className="mb-3 bg-slate-50 border border-slate-200 p-3 rounded-2xl flex justify-between items-center"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-1 h-8 bg-emerald-500 rounded-full"></div>
                                            <div className="text-xs">
                                                <p className="text-slate-400">در پاسخ به <span className="font-bold text-slate-700">{replyTo.senderName}</span></p>
                                                <p className="text-slate-600 line-clamp-1 mt-0.5 italic">{replyTo.messageText.replace(/<[^>]*>?/gm, '')}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => setReplyTo(null)} className="p-1.5 hover:bg-slate-200 rounded-full text-slate-400 transition-colors">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="flex flex-col border border-slate-200 rounded-[1.5rem] overflow-hidden focus-within:ring-4 focus-within:ring-emerald-500/5 focus-within:border-emerald-500/30 transition-all bg-white shadow-inner">
                                <Editor
                                    apiKey='v12ld4fyiekikay5d5tuv6j4578f6daxybv4qrm2a0oymp5j'
                                    value={replyText}
                                    onEditorChange={setReplyText}
                                    init={{
                                        height: 140,
                                        menubar: false,
                                        plugins: 'lists link autoresize',
                                        toolbar: 'bold italic | bullist numlist | link',
                                        directionality: 'rtl',
                                        placeholder: 'پاسخ خود را اینجا بنویسید...',
                                        content_style: 'body { font-family:Tahoma, Arial; font-size:14px; direction:rtl; padding: 10px; }',
                                        statusbar: false,
                                    }}
                                />
                                <div className="p-3 bg-slate-50/50 flex justify-between items-center border-t border-slate-100">
                                    <div className="flex items-center gap-1">
                                        <button className="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all">
                                            <Paperclip className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <button
                                        onClick={handleSend}
                                        disabled={replyLoading || (!replyText.trim() && !replyTo)}
                                        className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white px-8 py-2.5 rounded-xl text-sm font-extrabold flex items-center gap-2 shadow-lg shadow-emerald-200 transition-all active:scale-95"
                                    >
                                        {replyLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                        ارسال پاسخ
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- Sidebar (Info & Stats) --- */}
                    <div className="hidden xl:flex w-80 flex-col gap-5">
                        <div className="bg-white p-6 rounded-[2rem] border border-slate-200/60 shadow-sm space-y-6">
                            <h3 className="font-extrabold text-slate-800 flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-emerald-600" />
                                جزئیات درخواست
                            </h3>

                            <div className="space-y-4">
                                <SidebarRow label="اولویت" icon={AlertCircle}>
                                    <span className={`font-bold ${priorityMap[singleTicket?.priority]?.color}`}>
                                        {priorityMap[singleTicket?.priority]?.label}
                                    </span>
                                </SidebarRow>
                                <SidebarRow label="دپارتمان" icon={User}>
                                    <span className="text-slate-700">{singleTicket?.department === 1 ? 'فنی' : 'مالی'}</span>
                                </SidebarRow>
                                <SidebarRow label="مشتری" icon={User}>
                                    <span className="text-slate-700">{singleTicket?.customerFullName}</span>
                                </SidebarRow>
                            </div>

                            <button className="w-full py-3 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-2xl text-xs font-bold transition-colors">
                                درخواست بستن تیکت
                            </button>
                        </div>

                        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-[2rem] text-white shadow-lg shadow-emerald-200">
                            <h4 className="font-bold mb-2">راهنمایی سریع</h4>
                            <p className="text-[11px] leading-relaxed opacity-90">
                                میانگین زمان پاسخگویی در این دپارتمان کمتر از ۲ ساعت است. صبور باشید کارشناسان ما در حال بررسی هستند.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// کامپوننت کمکی سایدبار
const SidebarRow = ({ label, icon: Icon, children }) => (
    <div className="flex items-center justify-between text-xs border-b border-slate-50 pb-3 last:border-0">
        <div className="flex items-center gap-2 text-slate-400">
            <Icon className="w-4 h-4" />
            <span>{label}</span>
        </div>
        {children}
    </div>
);