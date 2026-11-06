"use client"
import { useEffect, useState } from "react";
import ChapterItem from "../../../../../components/courses/course/ChapterItem";
import ChapterSkeleton from "../../../../../components/courses/course/ChapterSkeleton";
import { useParams } from "next/navigation";

// export const metadata = {
//     title: "تکا | دوره های ما",
//     description: "تکا",
// };




export default function Layout({ children }) {

    const [chapters, setChapters] = useState([]);
    const [loading, setLoading] = useState(true);
    const params = useParams();


    useEffect(() => {
        const fetchChapters = async () => {
            // شبیه‌سازی دریافت داده از API با داده‌های ساختگی
            await new Promise((resolve) => setTimeout(resolve, 500));
            const fakeChapters = [
                {
                    Id: 1,
                    Title: "فصل اول: مبانی برنامه‌نویسی",
                    Sessions: [
                        {
                            Id: 101,
                            Title: "جلسه ۱: آشنایی با برنامه‌نویسی",
                            HasExercises: true,
                            Duration: "۳۰ دقیقه",
                            Description: "مقدمه‌ای بر مفاهیم برنامه‌نویسی",
                        },
                        {
                            Id: 102,
                            Title: "جلسه ۲: متغیرها و انواع داده",
                            HasExercises: true,
                            Duration: "۴۵ دقیقه",
                            Description: "بررسی متغیرها و انواع داده در جاوااسکریپت",
                        },
                        {
                            Id: 103,
                            Title: "جلسه ۳: عملگرها",
                            HasExercises: true,
                            Duration: "۴۰ دقیقه",
                            Description: "معرفی عملگرهای ریاضی و منطقی",
                        },
                    ],
                },
                {
                    Id: 2,
                    Title: "فصل دوم: توابع و دامنه‌ها",
                    Sessions: [
                        {
                            Id: 201,
                            Title: "جلسه ۱: تعریف توابع",
                            HasExercises: true,
                            Duration: "۵۰ دقیقه",
                            Description: "نحوه تعریف و استفاده از توابع",
                        },
                        {
                            Id: 202,
                            Title: "دامنه متغیرها",
                            HasExercises: true,
                            Duration: "۳۵ دقیقه",
                            Description: "مفهوم دامنه و نحوه دسترسی به متغیرها",
                        },
                        {
                            Id: 203,
                            Title: "توابع بازگشتی",
                            HasExercises: true,
                            Duration: "۴۵ دقیقه",
                            Description: "بررسی توابع بازگشتی و کاربردهای آن",
                        },
                        {
                            Id: 204,
                            Title: "توابع ناشناس",
                            HasExercises: true,
                            Duration: "۳۰ دقیقه",
                            Description: "معرفی توابع ناشناس و کاربردهای آن",
                        },
                    ],
                },
            ];
            setChapters(fakeChapters);
            setLoading(false);
        };
        fetchChapters();
    }, []);

    return (
        <div >
            <div className="container px-5 xl:px-20 mx-auto">
                <div className='grid grid-cols-12 gap-5'>
                    <div className="col-span-4 space-y-5">
                        {loading ? (
                            [...Array(2)].map((_, index) => (
                                <ChapterSkeleton key={index} />
                            ))
                        ) : (
                            chapters.map((chapter, index) => (
                                <ChapterItem key={chapter.Id} chapter={chapter} index={index}
                                    selectedSessionId={params.lessonId} />
                            ))
                        )}
                    </div>
                    <main className="col-span-8">{children}</main>
                </div>
            </div>
        </div>
    );
}
