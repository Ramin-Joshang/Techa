"use client";

import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useParams, useRouter } from "next/navigation";
import { Editor } from "@tinymce/tinymce-react";
import {
    Send,
    HelpCircle,
    ChevronRight,
    AlertCircle,
    Layout,
    BookOpen
} from "lucide-react";
import { toast } from "react-toastify";
import { addQuestion } from "../../../../../../features/main/questions/questionsActions";

export default function AskQuestion() {
    const dispatch = useDispatch();
    const router = useRouter();
    const params = useParams();

    // مقادیر اولیه
    const docId = params.docId || 19;
    const sessionId = params.lessonId;
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title.trim() || title.length < 5) {
            return toast.error("عنوان سوال باید حداقل ۵ کاراکتر باشد");
        }

        if (!content.trim() || content.length < 10) {
            return toast.error("توضیحات سوال خیلی کوتاه است");
        }

        setIsSubmitting(true);

        const payload = {
            DocId: Number(docId),
            SessionId: sessionId ? Number(sessionId) : null,
            UserId: 1002, // طبق درخواست شما ثابت گذاشته شد
            Title: title,
            Content: content,
        };

        try {
            await dispatch(addQuestion(payload)).unwrap();
            toast.success("سوال شما با موفقیت ثبت شد و پس از تایید نمایش داده می‌شود");
            router.push(`/docs/${docId}/${sessionId}/questions`); // بازگشت به صفحه قبل
        } catch (err) {
            toast.error(err?.message || "خطایی در ثبت سوال رخ داد");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="px-5">
            {/* هدر صفحه */}
            <button
                onClick={() => router.back()}
                className="flex items-center gap-1 text-gray-500 hover:text-emerald-600 transition-colors mb-6 text-sm"
            >
                <ChevronRight size={20} />
                <span>بازگشت</span>
            </button>

            <div className="flex items-center gap-3 mb-8 text-gray-800">
                <div className="bg-emerald-100 p-3 rounded-2xl text-emerald-600">
                    <HelpCircle size={32} />
                </div>
                <div>
                    <h1 className="text-2xl font-black">پرسش سوال جدید</h1>
                    <p className="text-gray-500 text-sm mt-1">مشکل خود را مطرح کنید تا اساتید یا سایر دانشجویان به شما کمک کنند.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* فرم اصلی */}
                <div className="lg:col-span-3">
                    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm">

                        {/* فیلد عنوان */}
                        <div className="space-y-2">
                            <label className="font-bold text-gray-700 flex items-center gap-2">
                                عنوان سوال
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="مثال: چطور مشکل لود نشدن فونت را حل کنم؟"
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all text-gray-800"
                            />
                        </div>



                        {/* ادیتور TinyMCE */}
                        <div className="space-y-2">
                            <label className="font-bold text-gray-700 flex items-center gap-2">
                                توضیحات کامل
                                <span className="text-red-500">*</span>
                            </label>
                            <div className="rounded-xl overflow-hidden border border-gray-200 shadow-inner">
                                <Editor
                                    apiKey='v12ld4fyiekikay5d5tuv6j4578f6daxybv4qrm2a0oymp5j'
                                    init={{
                                        height: 350,
                                        menubar: false,
                                        plugins: 'lists link code codesample',
                                        toolbar: 'bold italic | bullist numlist | codesample link | undo redo',
                                        content_style: 'body { font-family: Vazir, sans-serif; font-size: 14px; line-height: 1.6; }',
                                        directionality: 'rtl',
                                        placeholder: 'کدها یا توضیحات تکمیلی خود را اینجا بنویسید...',
                                        skin: 'oxide',
                                    }}
                                    value={content}
                                    onEditorChange={(newValue) => setContent(newValue)}
                                />
                            </div>
                        </div>

                        {/* دکمه ارسال */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full md:w-auto flex items-center justify-center gap-2 bg-[#2ECC71] hover:bg-[#27ae60] text-white px-10 py-4 rounded-2xl transition-all font-bold shadow-lg shadow-emerald-100 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {isSubmitting ? (
                                    <span className="animate-pulse">در حال ارسال...</span>
                                ) : (
                                    <>
                                        <Send size={20} className="rotate-180" />
                                        <span>انتشار سوال</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* سایدبار راهنما */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100">
                        <div className="flex items-center gap-2 text-amber-700 font-bold mb-3 text-sm">
                            <AlertCircle size={18} />
                            راهنمای پرسش
                        </div>
                        <ul className="text-xs text-amber-800 space-y-3 leading-6 list-disc list-inside">
                            <li>عنوان سوال را شفاف بنویسید.</li>
                            <li>اگر کد دارید، از بخش Codesample در ادیتور استفاده کنید.</li>
                            <li>قبل از پرسیدن، سوالات مشابه را جستجو کنید.</li>
                            <li>ادب و احترام را رعایت فرمایید.</li>
                        </ul>
                    </div>

                    <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
                        <div className="flex items-center gap-2 text-blue-700 font-bold mb-2 text-sm">
                            <BookOpen size={18} />
                            امتیاز یادگیری
                        </div>
                        <p className="text-[11px] text-blue-800 leading-5">
                            با پرسیدن سوالات دقیق و پاسخ به بقیه، سطح کاربری شما ارتقا پیدا می‌کند.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}