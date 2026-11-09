"use client";
import React, { useEffect, useState } from 'react';
import { LeftAngleIcon, RightAngleIcon } from '../Icons/Icons';
import Image from 'next/image';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';
import 'swiper/css/navigation';

// import required modules
import { Autoplay, Navigation } from 'swiper/modules';
import { BlogCard } from '../blog/BlogCard';
import ProjectCard from '../projects/ProjectCard';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const Projects = () => {
    // const [courses, setCourses] = useState([]);
    // const [loading, setLoading] = useState(true);

    // useEffect(() => {
    //     fetch("https://pool.techa.ir/api/Course")
    //         .then((response) => response.json())
    //         .then((data) => {
    //             if (data.IsSuccess) {
    //                 setCourses(data.Data.filter(course => !course.Disabled));
    //             }
    //             setLoading(false);
    //         })
    //         .catch((error) => {
    //             console.error("Error fetching courses:", error);
    //             setLoading(false);
    //         });
    // }, []);

    const projects = [
        {
            id: 1,
            title: "سامانه خدمات شهری",
            image: "/images/project.svg",
            status: "analysis",
            requiredInterns: 3,
            currentInterns: 1,
            progress: 45,
            description:
                "سامانه مدیریت پیمانها و پیمانکاران شهری برای شهرداریها - نیاز به توسعه دهنده ماهر با آشنایی به فرآیندهای خدمات شهری - وضعیت پروژه: فاز بازطراحی و توسعه",
        },
        {
            id: 2,
            title: "پلتفرم فروش پوشاک دخترانه",
            image: "/images/project.svg",
            status: "active",
            requiredInterns: 2,
            currentInterns: 0,
            progress: 20,
            description:
                "پلتفرم تخصصی فروش پوشاک دخترانه (تونیک، مانتو و...) - ویژه توسعه دهندگان خانم علاقمند به حوزه فشن - وضعیت: فاز تحلیل و طراحی",
        },
        {
            id: 3,
            title: "سامانه مشاوره شغلی",
            image: "/images/project.svg",
            status: "active",
            requiredInterns: 2,
            currentInterns: 1,
            progress: 30,
            description:
                "سامانه راهنمایی شغلی هوشمند برای نوجوانان - نیاز به توسعه دهنده با توانایی تولید محتوای آموزشی - وضعیت: فاز تحلیل و طراحی",
        },
        {
            id: 4,
            title: "پلتفرم باشگاه مشتریان",
            image: "/images/project.svg",
            status: "analysis",
            requiredInterns: 2,
            currentInterns: 2,
            progress: 85,
            description:
                "سیستم مدیریت ارتباط با مشتریان (CRM) پیشرفته - ویژه توسعه دهندگان آقا با دانش بازاریابی - وضعیت: فاز راه‌اندازی نهایی",
        },
        {
            id: 5,
            title: "پلتفرم قطعه‌سازان صنعتی",
            image: "/images/project.svg",
            status: "active",
            requiredInterns: 3,
            currentInterns: 0,
            progress: 15,
            description:
                "اکوسیستم ارتباط تولیدکنندگان و قطعه‌سازان - نیاز به توسعه دهنده آشنا با حوزه صنعت - وضعیت: فاز تحلیل و طراحی",
        },
        {
            id: 6,
            title: "پلتفرم ارتباط صنعت و دانشگاه",
            image: "/images/project.svg",
            status: "analysis",
            requiredInterns: 4,
            currentInterns: 2,
            progress: 55,
            description:
                "سامانه همکاری دانشجویان با صنایع - نیاز به توسعه دهنده با روابط عمومی قوی - وضعیت: فاز توسعه اولیه",
        },
        {
            id: 7,
            title: "پلتفرم آنالیز قراردادها",
            image: "/images/project.svg",
            status: "active",
            requiredInterns: 2,
            currentInterns: 1,
            progress: 25,
            description:
                "سیستم هوشمند تحلیل قراردادهای حقوقی - نیاز به توسعه دهنده با توانایی فرموله کردن مفاهیم حقوقی - وضعیت: فاز تحقیق و طراحی",
        },
    ];



    return (
        <div id='projects' className="py-20">
            <div className="container mx-auto px-5 xl:px-20">
                <div className="flex flex-col md:flex-row md:justify-between items-center">
                    <div className="text-[#042A1B] text-center md:text-start">
                        <h1 className="font-extrabold text-4xl ">
                            پروژه های
                            <span className="bg-[#7AE36A] py-0.5 px-3 rounded-xl inline-block">کارآموزی</span>
                        </h1>
                        <p className="text-lg font-normal mt-3">آخرین مقالات و آموزش‌های برنامه‌نویسی</p>
                    </div>
                    <div className="mt-5 md:mt-0 flex items-center gap-5">
                        <Link
                            href="/projects"
                            className="bg-[#7AE36A] text-[#042A1B] px-6 py-2 rounded-full font-medium hover:bg-[#6acf5a] transition-all flex items-center gap-2 group"
                        >
                            مشاهده همه پروژه ها
                            <span className="bg-[#042A1B] p-1 rounded-full group-hover:-translate-x-1 transition-transform">
                                <ArrowLeft className="text-white w-5 h-5" strokeWidth={1.5} />
                            </span>
                        </Link>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-10">
                    {projects.slice(0, 4).map((project) => (
                        <ProjectCard key={project.id} project={project} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Projects;
