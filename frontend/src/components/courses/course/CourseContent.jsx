import React, { useState } from 'react';
import HeroSection from './HeroSection';
import CourseFeatures from './CourseFeatures';
import Curriculum from './Curriculum';
import TestimonialsSlider from './TestimonialsSlider';
import FAQs from './FAQs';
import VideoModal from './VideoModal';
import { ArrowLeft, Clock, Facebook, Infinity, LifeBuoy, ShieldCheck, Trophy, Twitter, User, Video } from 'lucide-react'


const CourseContent = () => {

    const courseData = {
        title: "دوره حرفه‌ای React با Next.js",
        excerpt: "تبدیل شوید به توسعه‌دهنده فول استک با پروژه‌های واقعی",
        videoPreview: "/videos/video.mp4",
        image: "/images/blog-1.png",
        rating: 4.9,
        reviews: 1286,
        instructor: {
            name: "رامین جوشنگ",
            title: "Senior Full-Stack Engineer",
            bio: "۱۰ سال سابقه توسعه اپلیکیشن‌های سازمانی - مربی رسمی Microsoft",
            avatar: "/images/teacher.jpeg",
            social: {
                twitter: "https://twitter.com/ali_karimi",
                linkedin: "https://linkedin.com/in/ali-karimi",
                github: "https://github.com/ali-karimi"
            }
        },
        details: {
            duration: "۱۲ هفته",
            effort: "۱۵-۲۰ ساعت در هفته",
            price: "۲,۹۹۰,۰۰۰ تومان",
            discountPrice: "۱,۹۹۰,۰۰۰ تومان",
            discountEnd: "۲ روز دیگر",
            certification: "گواهینامه بین‌المللی",
            access: "دسترسی مادام‌العمر",
            projects: "۶ پروژه عملی",
            quizzes: "۳۲ آزمون تعاملی"
        },
        curriculum: [
            {
                module: 1,
                title: "پایه‌های React",
                lessons: [
                    { title: "آشنایی با JSX" },
                    { title: "Components و Props" },
                    { title: "State و Lifecycle" },
                    { title: "Hooks پیشرفته" }
                ]
            },
            {
                module: 2,
                title: "Next.js پیشرفته",
                lessons: [
                    { title: "Routing و Dynamic Routes" },
                    { title: "Server-Side Rendering (SSR)" },
                    { title: "Static Site Generation (SSG)" },
                    { title: "API Routes" }
                ]
            },
            {
                module: 3,
                title: "مدیریت State",
                lessons: [
                    { title: "Context API" },
                    { title: "Redux Toolkit" },
                    { title: "Zustand" },
                    { title: "Server State با React Query" }
                ]
            },
            {
                module: 4,
                title: "تست‌نویسی",
                lessons: [
                    { title: "Unit Testing با Jest" },
                    { title: "Integration Testing" },
                    { title: "E2E Testing با Cypress" },
                    { title: "Test-Driven Development" }
                ]
            },
            {
                module: 5,
                title: "پروژه نهایی",
                lessons: [
                    { title: "طراحی پروژه" },
                    { title: "پیاده‌سازی پروژه" },
                    { title: "ارائه پروژه" }
                ]
            }
        ],
        features: [
            {
                icon: <Trophy className="w-8 h-8" />,
                title: "پروژه‌های واقعی",
                description: "۶ پروژه صنعتی برای رزومه‌سازی"
            },
            {
                icon: <ShieldCheck className="w-8 h-8" />,
                title: "گواهینامه معتبر",
                description: "مدرک بین‌المللی قابل استعلام"
            },
            {
                icon: <Infinity className="w-8 h-8" />,
                title: "دسترسی دائمی",
                description: "آپدیت‌های رایگان آینده"
            },
            {
                icon: <LifeBuoy className="w-8 h-8" />,
                title: "پشتیبانی VIP",
                description: "پاسخگویی ۲۴ ساعته"
            }
        ],
        faqs: [
            {
                question: "آیا پیش‌نیازی برای دوره لازم است؟",
                answer: "آشنایی مقدماتی با JavaScript کافی است"
            },
            {
                question: "امکان پرداخت اقساطی وجود دارد؟",
                answer: "بله، تا ۶ ماه امکان تقسیم پرداخت دارید"
            },
            {
                question: "چگونه گواهینامه دریافت کنم؟",
                answer: "پس از پایان دوره و انجام پروژه‌ها، گواهینامه صادر می‌شود"
            },
            {
                question: "آیا محتوا آپدیت می‌شود؟",
                answer: "همیشه به جدیدترین نسخه Next.js آپدیت می‌شود"
            }
        ],
        testimonials: [
            {
                name: "مریم احمدی",
                role: "توسعه دهنده فرانت‌اند",
                text: "بهترین دوره آموزشی که تاحالا دیدم. پروژه‌های واقعی باعث شدن بتونم به سرعت جذب بازار کار بشم.",
                avatar: "/images/teacher.jpeg"
            },
            {
                name: "رضا موسوی",
                role: "توسعه دهنده فول استک",
                text: "پشتیبانی عالی و محتوای به روز. تونستم ظرف ۳ ماه اولین پروژه حرفه‌ای خودم رو تحویل بدم.",
                avatar: "/images/teacher.jpeg"
            },
            {
                name: "سارا محمدی",
                role: "دانشجوی کامپیوتر",
                text: "آموزش‌ها قدم به قدم و بسیار کاربردی. حتی بدون پیش‌زمینه قوی هم میشه یاد گرفت.",
                avatar: "/images/teacher.jpeg"
            },
            {
                name: "مریم احمدی",
                role: "توسعه دهنده فرانت‌اند",
                text: "بهترین دوره آموزشی که تاحالا دیدم. پروژه‌های واقعی باعث شدن بتونم به سرعت جذب بازار کار بشم.",
                avatar: "/images/teacher.jpeg"
            },
            {
                name: "رضا موسوی",
                role: "توسعه دهنده فول استک",
                text: "پشتیبانی عالی و محتوای به روز. تونستم ظرف ۳ ماه اولین پروژه حرفه‌ای خودم رو تحویل بدم.",
                avatar: "/images/teacher.jpeg"
            },
            {
                name: "سارا محمدی",
                role: "دانشجوی کامپیوتر",
                text: "آموزش‌ها قدم به قدم و بسیار کاربردی. حتی بدون پیش‌زمینه قوی هم میشه یاد گرفت.",
                avatar: "/images/teacher.jpeg"
            }
        ]
    }



    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)


    return (
        <>
            <HeroSection data={courseData} onVideoClick={() => setIsVideoModalOpen(true)} />

            <CourseFeatures features={courseData.features} />

            <Curriculum curriculum={courseData.curriculum} />

            <TestimonialsSlider testimonials={courseData.testimonials} />

            {/* <InstructorSection instructor={courseData.instructor} /> */}

            <FAQs faqs={courseData.faqs} />

            <VideoModal isOpen={isVideoModalOpen} setIsOpen={setIsVideoModalOpen} videoUrl={courseData.videoPreview} />
        </>
    );
};

export default CourseContent;