"use client"
import Image from "next/image"
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { fetchPackageBySlug } from "../../../features/main/packages/packagesActions";
import { useEffect } from "react";

export default function Package() {
    const params = useParams();
    const { slug } = params;
    const router = useRouter();
    const searchParams = useSearchParams();

    const { loading, singlePackage } = useSelector(state => state.packages);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(fetchPackageBySlug({ "Slug": slug }));
    }, [dispatch, slug]);
    console.log(singlePackage)
    // نمایش لودینگ زیبا قبل از دریافت اطلاعات
    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#f4fcf7]">
                <div className="w-16 h-16 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
                <p className="mt-4 text-emerald-700 font-medium">در حال دریافت اطلاعات...</p>
            </div>
        )
    }
    console.log(singlePackage, slug)
    return (
        // پس‌زمینه روشن با هاله بسیار محو سبز
        <div className="bg-[#f7fbf9] text-slate-800 min-h-screen pt-32 pb-24" dir="rtl">
            <div className="container mx-auto px-6 lg:px-10">
                <div className="grid lg:grid-cols-12 gap-10">

                    {/* Main Content */}
                    <div className="lg:col-span-8 space-y-16">

                        {/* Hero Section */}
                        <div>
                            {singlePackage?.ImageUrl && (
                                <div className="relative w-full h-[300px] sm:h-[450px] mb-8 rounded-3xl overflow-hidden shadow-2xl shadow-emerald-900/10 border-4 border-white">
                                    <Image
                                        src={singlePackage.ImageUrl}
                                        alt={singlePackage?.Title || "پکیج"}
                                        fill
                                        className=" hover:scale-105 transition-transform duration-700"
                                    />
                                </div>
                            )}

                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
                                {singlePackage?.Title}
                            </h1>

                            <p className="text-lg text-slate-600 leading-relaxed border-r-4 border-emerald-400 pr-4">
                                {singlePackage?.ShortDescription}
                            </p>
                        </div>

                        {/* Items (سرفصل‌ها) */}
                        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-emerald-50">
                            <h2 className="text-2xl font-bold mb-8 text-slate-800 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                                </span>
                                سرفصل‌های پکیج
                            </h2>

                            <div className="space-y-4">
                                {singlePackage?.Items?.map((item, index) => (
                                    <div
                                        key={item.Id}
                                        className="group bg-slate-50 border border-slate-100 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-emerald-200 hover:shadow-md transition-all duration-300"
                                    >
                                        <div className="flex items-center gap-4">
                                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-emerald-600 font-bold shadow-sm">
                                                {index + 1}
                                            </span>
                                            <span className="font-semibold text-slate-700 group-hover:text-emerald-700 transition-colors">{item.Title}</span>
                                        </div>
                                        <span className="bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide self-start sm:self-auto whitespace-nowrap">
                                            {["دوره", "پروژه", "آزمون", "کارآموزی", "فریلنسری"][item.ItemType - 1]}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Benefits (مزایا) */}
                        <div>
                            <h2 className="text-2xl font-bold mb-8 text-slate-800 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                </span>
                                مزایای این پکیج
                            </h2>

                            <div className="grid sm:grid-cols-2 gap-6">
                                {singlePackage?.Benefits?.map(b => (
                                    <div
                                        key={b.Id}
                                        className="bg-white border border-emerald-50 p-6 rounded-3xl shadow-sm hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-900/5 hover:border-emerald-200 transition-all duration-300"
                                    >
                                        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 mb-4">
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                        </div>
                                        <h3 className="font-bold text-lg mb-3 text-slate-800">
                                            {b.Title}
                                        </h3>
                                        <p className="text-slate-500 text-sm leading-relaxed">
                                            {b.Description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Description (توضیحات) */}
                        <div className="bg-white p-6 sm:p-10 rounded-3xl shadow-sm border border-emerald-50">
                            <h2 className="text-2xl font-bold mb-8 text-slate-800 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </span>
                                توضیحات کامل
                            </h2>

                            <div
                                className="prose prose-emerald prose-lg max-w-none prose-h1:hidden prose-headings:text-slate-800 prose-p:text-justify prose-p:text-slate-600 prose-li:text-slate-600 prose-p:leading-loose prose-a:text-emerald-600"
                                dangerouslySetInnerHTML={{ __html: singlePackage?.Description }}
                            />
                        </div>

                        {/* FAQ (سوالات متداول) */}
                        <div>
                            <h2 className="text-2xl font-bold mb-8 text-slate-800 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </span>
                                سوالات متداول
                            </h2>

                            <div className="space-y-4">
                                {singlePackage?.Faqs?.map(faq => (
                                    <details
                                        key={faq.Id}
                                        className="group bg-white border border-emerald-50 p-6 rounded-2xl shadow-sm [&_summary::-webkit-details-marker]:hidden open:border-emerald-300 open:ring-1 open:ring-emerald-300 transition-all duration-300"
                                    >
                                        <summary className="cursor-pointer font-bold text-slate-700 flex justify-between items-center outline-none">
                                            {faq.Question}
                                            <span className="transition-transform duration-300 group-open:-rotate-180 bg-slate-50 p-2 rounded-full text-emerald-600">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                            </span>
                                        </summary>
                                        <div className="mt-5 text-slate-600 text-sm leading-relaxed pr-4 border-r-2 border-emerald-200">
                                            {faq.Answer}
                                        </div>
                                    </details>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-4 relative">
                        <div className="sticky top-28 bg-white border border-emerald-100 rounded-[2rem] p-8 shadow-2xl shadow-emerald-900/5">

                            <div className="mb-8 text-center bg-emerald-50/50 p-6 rounded-2xl border border-emerald-50">
                                {singlePackage?.Price !== singlePackage?.DiscountPrice && (
                                    <div className="inline-block px-3 py-1 bg-rose-100 text-rose-600 rounded-full text-sm font-bold mb-3">
                                        تخفیف ویژه
                                    </div>
                                )}

                                <div className="text-4xl font-black text-emerald-600 mb-2">
                                    {singlePackage?.DiscountPrice?.toLocaleString()} <span className="text-lg font-medium text-slate-500">تومان</span>
                                </div>

                                {singlePackage?.Price !== singlePackage?.DiscountPrice && (
                                    <div className="line-through text-slate-400 font-medium decoration-rose-400 decoration-2">
                                        {singlePackage?.Price?.toLocaleString()}
                                    </div>
                                )}
                            </div>

                            <button className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white transition-all duration-300 py-4 rounded-xl font-bold text-lg shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transform hover:-translate-y-1">
                                ثبت نام و خرید پکیج
                            </button>

                            <div className="mt-8 pt-8 border-t border-slate-100">
                                <h4 className="font-bold text-slate-800 mb-4">شما با خرید این پکیج دریافت می‌کنید:</h4>
                                <ul className="space-y-4 text-sm font-medium text-slate-600">
                                    <li className="flex items-center gap-3">
                                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                        </span>
                                        دسترسی دائمی به محتوا
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                        </span>
                                        بروزرسانی‌های رایگان
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                        </span>
                                        پشتیبانی مستقیم مدرس
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}
