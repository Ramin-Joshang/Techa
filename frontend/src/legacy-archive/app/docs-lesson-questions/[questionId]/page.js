"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useRouter } from "next/navigation";
import { Editor } from "@tinymce/tinymce-react";
import {
    MessageSquare,
    User,
    Calendar,
    ChevronRight,
    Send,
    CheckCircle2,
    CornerDownLeft
} from "lucide-react";
import { toast } from "react-toastify";
import { addAnswer, fetchQuestionDetails } from "../../../../../../features/main/questions/questionsActions";
// مسیر اکشن‌های خود را جایگزین کنید

export default function QuestionDetails() {
    const { questionId } = useParams();
    const dispatch = useDispatch();
    const router = useRouter();

    const { singleQuestion: question, loading } = useSelector((state) => state.questions);
    const [answerContent, setAnswerContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    console.log(question)
    useEffect(() => {
        if (questionId) {
            dispatch(fetchQuestionDetails({ QuestionId: questionId }));
        }
    }, [dispatch, questionId]);

    const handleSendAnswer = async () => {
        if (!answerContent.trim() || answerContent.length < 5) {
            return toast.error("متن پاسخ نباید خالی باشد");
        }

        setIsSubmitting(true);
        try {
            await dispatch(addAnswer({
                QuestionId: Number(questionId),
                UserId: 1002, // طبق درخواست شما
                Content: answerContent
            })).unwrap();

            toast.success("پاسخ شما با موفقیت ثبت شد");
            setAnswerContent(""); // پاک کردن ادیتور
            dispatch(fetchQuestionDetails({ QuestionId: questionId })); // بروزرسانی لیست
        } catch (err) {
            toast.error(err || "خطا در ثبت پاسخ");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="p-20 text-center animate-pulse">در حال بارگذاری جزئیات...</div>;
    if (!question) return <div className="p-20 text-center">سوال مورد نظر یافت نشد.</div>;

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-8 font-sans bg-[#fbfcfd]" dir="rtl">

            {/* دکمه بازگشت */}
            <button
                onClick={() => router.back()}
                className="flex items-center gap-1 text-gray-500 hover:text-emerald-600 mb-6 transition-colors"
            >
                <ChevronRight size={20} />
                <span>بازگشت به لیست سوالات</span>
            </button>

            {/* بخش سوال اصلی */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-10">
                <div className="h-2 w-full bg-emerald-500"></div>
                <div className="p-6 md:p-10">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-2xl border border-emerald-100">
                            {question.AskUserName?.charAt(0)}
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-1">{question.Title}</h1>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                                <span className="flex items-center gap-1"><User size={14} /> {question.AskUserName}</span>
                                <span className="flex items-center gap-1"><Calendar size={14} /> {new Intl.DateTimeFormat('fa-IR').format(new Date(question.CreatedAt))}</span>
                                {question.SessionTitle && (
                                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs italic">جلسه: {question.SessionTitle}</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div
                        className="prose prose-emerald max-w-none text-gray-700 leading-8 bg-gray-50/50 p-6 rounded-2xl border border-gray-50"
                        dangerouslySetInnerHTML={{ __html: question.Content }}
                    />
                </div>
            </div>

            {/* لیست پاسخ‌ها */}
            <div className="space-y-6 mb-12">
                <h2 className="flex items-center gap-2 text-xl font-bold text-gray-800 mr-2">
                    <MessageSquare className="text-blue-500" size={24} />
                    پاسخ‌ها ({JSON.parse(question.Answers)?.length || 0})
                </h2>

                {JSON.parse(question.Answers)?.map((ans, index) => (
                    <div key={ans.Id} className="relative flex gap-4 mr-2 md:mr-8">
                        <div className="hidden md:flex flex-col items-center">
                            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold border border-blue-100 z-10">
                                {ans.AnswerUserName?.charAt(0)}
                            </div>
                            <div className="w-0.5 h-full bg-gray-100 -mt-1"></div>
                        </div>

                        <div className="flex-1 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative">
                            <div className="flex justify-between items-center mb-4">
                                <span className="font-bold text-gray-800 text-sm flex items-center gap-2">
                                    {ans.AnswerUserName}
                                    {ans.IsTeacher && <CheckCircle2 size={16} className="text-blue-500" title="مدرس دوره" />}
                                </span>
                                <span className="text-[11px] text-gray-400">{new Intl.DateTimeFormat('fa-IR').format(new Date(ans.CreatedAt))}</span>
                            </div>
                            <div
                                className="prose prose-sm max-w-none text-gray-700"
                                dangerouslySetInnerHTML={{ __html: ans.Content }}
                            />
                        </div>
                    </div>
                ))}

                {(!question.Answers || question.Answers.length === 0) && (
                    <p className="text-center text-gray-400 py-10 bg-gray-50 rounded-2xl border-2 border-dashed">هنوز پاسخی برای این سوال ثبت نشده است.</p>
                )}
            </div>

            {/* فرم ثبت پاسخ */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border-2 border-emerald-100 shadow-xl shadow-emerald-50/50 relative overflow-hidden">
                <div className="flex items-center gap-2 mb-6">
                    <CornerDownLeft className="text-emerald-500" />
                    <h3 className="text-lg font-black text-gray-800">پاسخ خود را بنویسید</h3>
                </div>

                <div className="rounded-2xl overflow-hidden border border-gray-200">
                    <Editor
                        apiKey='v12ld4fyiekikay5d5tuv6j4578f6daxybv4qrm2a0oymp5j'
                        init={{
                            height: 250,
                            menubar: false,
                            plugins: 'lists link code',
                            toolbar: 'bold italic | bullist numlist | link code | undo redo',
                            content_style: 'body { font-family: Vazir, sans-serif; font-size: 14px; direction: rtl; }',
                            directionality: 'rtl',
                            placeholder: 'راهنمایی یا پاسخ شما...'
                        }}
                        value={answerContent}
                        onEditorChange={(newValue) => setAnswerContent(newValue)}
                    />
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        onClick={handleSendAnswer}
                        disabled={isSubmitting}
                        className={`flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-200 ${isSubmitting ? 'opacity-50' : ''}`}
                    >
                        {isSubmitting ? "در حال ارسال..." : (
                            <>
                                <span>ارسال پاسخ</span>
                                <Send size={18} className="rotate-180" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}