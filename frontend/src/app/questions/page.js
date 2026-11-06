"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    MessageCircle,
    Search,
    Plus,
    CheckCircle2,
    TrendingUp,
    MessageSquare,
    User,
    Calendar
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { fetchAllQuestions, fetchLatestQuestions } from "../../features/main/questions/questionsActions";
// نام اکشن و ردیوسر را طبق پروژه خودت چک کن

export default function Questions() {
    const dispatch = useDispatch();
    const { loading, allQuestions: questions, latestQuestions, error } = useSelector((state) => state.questions);
    const [searchTerm, setSearchTerm] = useState("");
    const params = useParams();
    console.log("moz")
    useEffect(() => {
        dispatch(fetchAllQuestions());
        dispatch(fetchLatestQuestions({ TopCount: 5 }));
    }, [dispatch]);

    // ۱. منطق جستجو (فیلتر بر اساس عنوان)
    const filteredQuestions = useMemo(() => {
        if (!questions) return [];
        return questions.filter(q =>
            q.Title.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [questions, searchTerm]);



    if (loading) return (
        <div className="max-w-7xl mx-auto p-8 text-center">
            <div className="animate-spin w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-500">در حال فراخوانی سوالات...</p>
        </div>
    );

    if (error) return <div className="text-center p-10 text-red-500">خطا: {error}</div>;

    return (
        <div className="pt-32">
            <div className="container mx-auto px-5 xl:px-20">

                {/* هدر و باکس جستجو */}
                <div className="flex flex-col lg:flex-row justify-between items-center mb-10 gap-6">
                    <div className="w-full lg:w-2/3 relative">
                        <input
                            type="text"
                            placeholder="چیزی یادت رفته؟ اینجا بین سوالات بقیه جستجو کن..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white border-none rounded-2xl py-4 pr-12 pl-4 focus:ring-2 focus:ring-green-500 transition-all outline-none shadow-sm text-gray-700"
                        />
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={22} />
                    </div>

                    {/* <Link
                        href={`/docs/${q.DocId}/${q.SessionId}/questions/ask`}
                        className="w-full lg:w-auto flex items-center justify-center gap-2 bg-[#2ECC71] hover:bg-[#27ae60] text-white px-8 py-4 rounded-2xl transition-all shadow-lg shadow-green-100 font-bold whitespace-nowrap">
                        <Plus size={24} />
                        <span>می‌خواهم سوال بپرسم</span>
                    </Link> */}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* ستون اصلی: لیست سوالات (سمت راست در RTL) */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-xl font-black text-gray-800 flex items-center gap-2">
                                <MessageSquare className="text-green-600" />
                                پرسش‌های این جلسه ({filteredQuestions.length})
                            </h2>
                        </div>

                        {filteredQuestions.length > 0 ? (
                            filteredQuestions.map((q) => (
                                <div key={q.Id} className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all">
                                    {/* نوار رنگی بالای کارت */}
                                    <div className="h-1.5 w-full bg-gradient-to-l from-green-500 to-indigo-500"></div>

                                    <div className="p-6 md:p-8">
                                        {/* اطلاعات نویسنده */}
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                                <User size={24} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900">{q.UserName}</h4>
                                                <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                                                    <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(q.CreatedAt).toLocaleDateString('fa-IR')}</span>
                                                    {q.SessionTitle && <span className="bg-green-50 text-green-600 px-2 py-0.5 rounded">جلسه: {q.SessionTitle}</span>}
                                                </div>
                                            </div>
                                            {q.IsApproved && <CheckCircle2 size={20} className="text-green-500 mr-auto" />}
                                        </div>

                                        {/* بدنه سوال */}
                                        <h3 className="text-xl md:text-2xl font-black text-gray-800 mb-4 leading-relaxed hover:text-green-600 transition-colors">
                                            <Link href={`/docs/${q.DocId}/${q.SessionId}/questions/${q.Id}`}>{q.Title}</Link>
                                        </h3>



                                        {/* دکمه‌ها و آمار */}
                                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                                            <div className="flex items-center gap-2 text-green-600 font-bold bg-green-50/50 px-4 py-2 rounded-xl">
                                                <MessageCircle size={20} />
                                                <span>{q.AnswersCount} پاسخ ثبت شده</span>
                                            </div>

                                            <Link
                                                href={`/docs/${q.DocId}/${q.SessionId}/questions/${q.Id}`}
                                                className="bg-gray-900 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
                                            >
                                                مشاهده و ارسال پاسخ
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="bg-white rounded-3xl p-20 text-center border border-dashed border-gray-200">
                                <p className="text-gray-400 font-medium text-lg">سوالی با این عنوان پیدا نکردیم :(</p>
                            </div>
                        )}
                    </div>

                    {/* سایدبار: آخرین سوالات (سمت چپ در RTL) */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm sticky top-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                                <TrendingUp className="text-orange-500" size={20} />
                                آخرین پرسش‌های مطرح شده
                            </h3>

                            <div className="space-y-5">
                                {latestQuestions.map((lq) => (
                                    <Link
                                        key={lq.Id}
                                        href={`/docs/${lq.DocId}/${lq.SessionId}/questions/${lq.Id}`}
                                        className="group block p-3 rounded-2xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100"
                                    >
                                        <h4 className="text-sm font-bold text-gray-700 group-hover:text-green-600 transition-colors mb-2 line-clamp-1">
                                            {lq.Title}
                                        </h4>
                                        <div className="flex justify-between items-center text-[11px]">
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-400 flex items-center gap-1 italic">
                                                    <User size={10} /> {lq.UserName}
                                                </span>
                                                <span className="flex items-center gap-1 text-gray-400 italic"><Calendar size={12} /> {new Date(lq.CreatedAt).toLocaleDateString('fa-IR')}</span>
                                            </div>

                                            <span className="bg-white shadow-sm border border-gray-50 text-green-500 px-2 py-1 rounded-md font-bold">
                                                {lq.AnswersCount} پاسخ
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>

                            <div className="mt-8 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                                <p className="text-xs text-indigo-700 leading-6 text-justify">
                                    💡 <b>نکته:</b> قبل از پرسیدن سوال جدید، حتماً از کادر جستجو بالا استفاده کنید. احتمالاً پاسخ شما قبلاً داده شده است.
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}