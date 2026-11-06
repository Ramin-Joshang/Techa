"use client"
import { BookText, Code, GraduationCap, Clock, FileText, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react';
import { SP_fetch } from '../../api/utils/api';
import { formatDuration } from '../../helper';
import { RiDatabase2Fill, RiDatabaseFill, RiHtml5Fill, RiJavascriptFill, RiReactjsFill, RiTailwindCssFill } from 'react-icons/ri';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDocs } from '../../features/main/docs/docsActions';
import DocsSkeleton from '../common/DocsSkeleton';
import DocCard from '../docs/DocCard';





const LastDocumentation = () => {



    const { loading, docs } = useSelector(state => state.docs);
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(fetchDocs({ "Take": 3 }));
    }, []);



    return (
        <section className="bg-white py-16">
            <div className="container px-5 2xl:px-20 mx-auto">
                {/* عنوان بخش */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
                        <FileText className="w-8 h-8 text-emerald-600" />
                        <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                            مستندات آموزشی
                        </span>
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        آموزش‌های متنی جامع با پوشش کامل مفاهیم برنامه‌نویسی
                    </p>
                </div>

                {/* لیست دوره‌ها */}
                {loading ? (
                    <DocsSkeleton />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 xl:gap-10 mt-10">
                        {docs.map((doc, index) => (
                            <DocCard key={index} index={index} doc={doc} />
                        ))}
                    </div>
                )}

                {/* دکمه مشاهده بیشتر */}
                <div className="text-center mt-10">
                    <Link href={`/docs`} className="px-8 w-fit py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors flex items-center gap-2 mx-auto">
                        مشاهده تمام مستندات
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 14l-7 7m0 0l-7-7m7 7V3"
                            />
                        </svg>
                    </Link>
                </div>
            </div>
        </section>
    )
}

export default LastDocumentation