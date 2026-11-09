"use client"
import Link from 'next/link';
import { useParams } from 'next/navigation';
import React from 'react';
import { RiQuestionAnswerLine } from 'react-icons/ri';
import { useDispatch } from 'react-redux';
import { addToCart } from "../../features/cart/cartSlice";
const Sidebar = () => {

    const dispatch = useDispatch()

    const { id } = useParams

    const course = {
        title: "دوره ی برنامه نویسی با جاوا اسکریپت",
        image: "/images/blog-1.png",
        price: 1490000,
        originalPrice: 1990000,
        discount: 25,
        videoCount: 42,
        duration: "28",
        level: "متوسط",
        status: "در حال برگزاری",
        lastUpdate: "1402/10/15",
        instructor: {
            name: "رامین جوشنگ",
            avatar: "/images/teacher.jpeg",
            resume: "/instructors/ramin-joshang"
        },
        relatedCourses: [
            {
                title: "آموزش React.js پیشرفته",
                price: 1290000,
                thumbnail: "/images/blog-1.png"
            },
            {
                title: "آموزش Node.js جامع",
                price: 1590000,
                thumbnail: "/images/blog-1.png"
            },
            {
                title: "آموزش TypeScript از صفر",
                price: 990000,
                thumbnail: "/images/blog-1.png"
            }
        ]
    };

    return (
        <div className="sticky top-32 lg:col-span-4 grid-cols-12 overflow-y-auto space-y-6 scrollbar-hide">
            {/* بخش قیمت و ثبت نام */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-emerald-50 relative overflow-hidden">
                <div className="absolute -top-8 -right-8 w-24 h-24 bg-emerald-100/30 rounded-full" />
                <div className="space-y-5 mb-6">
                    <div className="flex flex-col gap-2">
                        {course.discount && (
                            <div className="flex items-center gap-3">
                                <span className="px-3 py-1 bg-red-500 text-white rounded-full text-sm font-dana">
                                    {course.discount}% تخفیف ویژه
                                </span>
                                <span className="line-through text-gray-400 text-lg">
                                    {course.originalPrice.toLocaleString()} تومان
                                </span>
                            </div>
                        )}
                        <div className="flex items-end gap-2">
                            <h3 className="text-3xl font-bold text-emerald-600 font-dana">
                                {course.price.toLocaleString()}
                            </h3>
                            <span className="text-gray-500 mb-1">تومان</span>
                        </div>
                    </div>
                    <button className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl font-dana-medium shadow-lg shadow-emerald-100 transition-all flex items-center justify-center gap-2"
                        onClick={() => dispatch(addToCart(course))}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        ثبت نام در دوره
                    </button>
                </div>

                {/* اطلاعات آماری دوره */}
                <div className="space-y-4 border-t border-emerald-50 pt-6">
                    <div className="flex items-center justify-between p-3 bg-emerald-50/50 rounded-lg">
                        <div className="flex items-center gap-2 text-gray-600">
                            <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            <span>تعداد ویدیوها</span>
                        </div>
                        <span className="font-dana-medium text-emerald-600">{course.videoCount}+ درس</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-amber-50/50 rounded-lg">
                        <div className="flex items-center gap-2 text-gray-600">
                            <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>مدت زمان</span>
                        </div>
                        <span className="font-dana-medium text-amber-600">{course.duration} ساعت آموزش</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-blue-50/50 rounded-lg">
                        <div className="flex items-center gap-2 text-gray-600">
                            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                            <span>سطح دوره</span>
                        </div>
                        <span className="font-dana-medium text-blue-600">{course.level}</span>
                    </div>
                </div>

                {/* وضعیت و بروزرسانی */}
                <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-cyan-50 rounded-xl border border-emerald-100">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-500">وضعیت دوره:</span>
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-600 rounded-md text-sm font-dana">
                            {course.status}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">آخرین بروزرسانی:</span>
                        <span className="text-sm font-dana text-gray-600">{course.lastUpdate}</span>
                    </div>
                </div>
            </div>

            {/* بخش مدرس */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-emerald-50 group">
                <h3 className="text-lg font-dana-bold text-gray-800 mb-4">مدرس دوره</h3>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <img
                            src={course.instructor.avatar}
                            alt={course.instructor.name}
                            className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-md"
                        />
                        <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-6 h-6 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 14l9-5-9-5-9 5 9 5z" />
                                <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                            </svg>
                        </div>
                    </div>
                    <div className="flex-1">
                        <h4 className="font-dana-medium text-gray-800">{course.instructor.name}</h4>
                        <a
                            href={course.instructor.resume}
                            className="mt-1 inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 transition-colors text-sm"
                        >
                            <span>مشاهده رزومه حرفه‌ای</span>
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>

            <Link href={`${id}/questions`} className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-dana-medium shadow-lg shadow-orange-100 transition-all flex items-center justify-center gap-2">
                <RiQuestionAnswerLine />
                بخش پرسش و پاسخ دوره
            </Link>

            {/* اشتراک گذاری دوره */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-emerald-50">
                <h3 className="text-lg font-dana-bold text-gray-800 mb-4">اشتراک گذاری دوره</h3>
                <div className="grid grid-cols-2 gap-3">
                    <button className="flex items-center justify-center gap-2 p-3 rounded-xl bg-[#1877F2] hover:bg-[#166FE5] text-white transition-colors">
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                        <span className="font-dana">فیسبوک</span>
                    </button>
                    <button className="flex items-center justify-center gap-2 p-3 rounded-xl bg-[#1DA1F2] hover:bg-[#1A91DA] text-white transition-colors">
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                        </svg>
                        <span className="font-dana">توییتر</span>
                    </button>
                </div>
            </div>

            {/* دوره های مرتبط */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-emerald-50">
                <h3 className="text-lg font-dana-bold text-gray-800 mb-4">دوره‌های پیشنهادی</h3>
                <div className="space-y-4">
                    {course.relatedCourses.map((related, index) => (
                        <div key={index} className="group flex items-center gap-4 p-3 hover:bg-emerald-50 rounded-xl transition-colors cursor-pointer">
                            <img
                                src={related.thumbnail}
                                alt={related.title}
                                className="w-16 h-16 rounded-xl object-cover border-2 border-white shadow-sm group-hover:border-emerald-100 transition-all"
                            />
                            <div className="flex-1">
                                <h4 className="font-dana-medium text-gray-800 group-hover:text-emerald-600 transition-colors">
                                    {related.title}
                                </h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-emerald-600 font-dana">
                                        {related.price.toLocaleString()} تومان
                                    </span>
                                    {related.discount && (
                                        <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                                            {related.discount}% تخفیف
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Sidebar;