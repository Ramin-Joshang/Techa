"use client"
import { BlogSidebar } from '../../../components/blog/BlogSidebar';
import { motion } from 'framer-motion';
import Comments from "../../../components/courses/course/Comments"
import { BookOpenText, Clock, User, Bookmark, Share2, Heart, ArrowUp } from 'lucide-react';

export default function PostPage({ params }) {
    const posts = [
        {
            id: 1,
            slug: 'react-optimization-tips',
            title: 'تکنیک‌های بهینه‌سازی React.js',
            excerpt: 'بهترین روش‌ها برای بهینه‌سازی عملکرد برنامه‌های React.js',
            content: '...محتوا کامل مقاله...',
            category: 'تکنولوژی',
            author: 'رامین جوشنگ',
            date: '1403/03/20',
            imageUrl: '/images/blog-1.png',
            likes: 30,
            saves: 12,
            shares: 5,
            comments: [
                { id: 1, user: 'کاربر۲', text: 'بسیار مفید بود!', date: '1403/03/21' }
            ]
        },
        {
            id: 2,
            slug: 'introduction-to-graphql',
            title: 'آشنایی با GraphQL',
            excerpt: 'راهنمای جامع برای استفاده از GraphQL در برنامه‌های مدرن',
            content: '...محتوا کامل مقاله...',
            category: 'تکنولوژی',
            author: 'رامین جوشنگ',
            date: '1403/04/01',
            imageUrl: '/images/blog-1.png',
            likes: 45,
            saves: 18,
            shares: 10,
            comments: [
                { id: 1, user: 'کاربر۳', text: 'خیلی آموزنده بود.', date: '1403/04/02' }
            ]
        },
        {
            id: 3,
            slug: 'best-javascript-libraries',
            title: 'بهترین کتابخانه‌های JavaScript',
            excerpt: 'معرفی کتابخانه‌های کاربردی و محبوب JavaScript',
            content: '...محتوا کامل مقاله...',
            category: 'تکنولوژی',
            author: 'رامین جوشنگ',
            date: '1403/05/10',
            imageUrl: '/images/blog-1.png',
            likes: 50,
            saves: 20,
            shares: 15,
            comments: [
                { id: 1, user: 'کاربر۴', text: 'عالی بود!', date: '1403/05/11' }
            ]
        },
        {
            id: 4,
            slug: 'advanced-software-testing-methods',
            title: 'روش‌های پیشرفته تست نرم‌افزار',
            excerpt: 'راهنمای کامل برای تست نرم‌افزار با استفاده از ابزارهای پیشرفته',
            content: '...محتوا کامل مقاله...',
            category: 'تکنولوژی',
            author: 'رامین جوشنگ',
            date: '1403/06/05',
            imageUrl: '/images/blog-1.png',
            likes: 35,
            saves: 15,
            shares: 7,
            comments: [
                { id: 1, user: 'کاربر۵', text: 'خیلی خوب توضیح داده شده بود.', date: '1403/06/06' }
            ]
        },
        {
            id: 5,
            slug: 'introduction-to-docker',
            title: 'معرفی Docker و مزایای آن',
            excerpt: 'راهنمای کامل برای استفاده از Docker در پروژه‌های نرم‌افزاری',
            content: '...محتوا کامل مقاله...',
            category: 'تکنولوژی',
            author: 'رامین جوشنگ',
            date: '1403/07/15',
            imageUrl: '/images/blog-1.png',
            likes: 40,
            saves: 17,
            shares: 8,
            comments: [
                { id: 1, user: 'کاربر۶', text: 'اطلاعات مفیدی بود.', date: '1403/07/16' }
            ]
        }
    ];

    const post = posts.find(p => p.slug === params.slug);

    return (
        <div className="pt-32">
            <div className="container px-5 xl:px-20 mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* محتوای اصلی */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ type: "spring", stiffness: 120 }}
                        className="lg:col-span-8 bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-emerald-100"
                    >
                        {/* هدر مقاله با عکس */}
                        <motion.div
                            className="relative h-[480px] overflow-hidden"
                            initial={{ y: 50 }}
                            animate={{ y: 0 }}
                        >
                            <motion.img
                                src={post.imageUrl}
                                alt={post.title}
                                className="absolute inset-0 w-full h-full object-cover"
                                initial={{ scale: 1.1 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 0.5 }}
                            />

                            <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/50 via-transparent to-transparent" />
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/30 to-transparent" />

                            <motion.div
                                className="absolute bottom-0 left-0 right-0 p-8 space-y-6"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <motion.h1
                                    className="text-4xl lg:text-5xl font-bold text-white drop-shadow-2xl leading-tight"
                                    initial={{ y: 30 }}
                                    animate={{ y: 0 }}
                                >
                                    {post.title}
                                </motion.h1>

                                <div className="flex flex-wrap items-center gap-4 text-emerald-100/90">
                                    <div className="flex items-center gap-3 bg-emerald-800/30 px-4 py-2 rounded-full backdrop-blur-sm">
                                        <User className="w-5 h-5" />
                                        <span className="font-medium">{post.author}</span>
                                    </div>
                                    <div className="flex items-center gap-3 bg-emerald-800/30 px-4 py-2 rounded-full backdrop-blur-sm">
                                        <Clock className="w-5 h-5" />
                                        <span>{post.date}</span>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>

                        {/* بدنه اصلی */}
                        <article className="prose lg:prose-xl max-w-none px-8 lg:px-16 py-12">
                            {/* نوار ابزار شناور */}
                            <motion.div
                                className="sticky top-24 mb-12 p-4 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-emerald-100 z-10"
                                initial={{ y: -20 }}
                                animate={{ y: 0 }}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <span className="bg-emerald-600 text-white px-4 py-1.5 rounded-full text-sm flex items-center gap-2">
                                            <BookOpenText className="w-4 h-4" />
                                            {post.category}
                                        </span>
                                        <div className="flex items-center gap-2 text-emerald-600">
                                            <Heart className="w-5 h-5" />
                                            <span>{post.likes}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <motion.button
                                            className="p-2 rounded-full bg-emerald-50 hover:bg-emerald-100 transition-colors group"
                                            whileHover={{ scale: 1.1 }}
                                        >
                                            <Bookmark className="w-6 h-6 text-emerald-600 group-hover:text-emerald-700" />
                                        </motion.button>
                                        <motion.button
                                            className="p-2 rounded-full bg-emerald-50 hover:bg-emerald-100 transition-colors group"
                                            whileHover={{ scale: 1.1 }}
                                        >
                                            <Share2 className="w-6 h-6 text-emerald-600 group-hover:text-emerald-700" />
                                        </motion.button>
                                    </div>
                                </div>
                            </motion.div>

                            {/* محتوای مقاله */}
                            <motion.div
                                className="space-y-8 text-emerald-900/90 leading-relaxed"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                {post.content}
                            </motion.div>

                            {/* دکمه بازگشت به بالا */}
                            <motion.button
                                className="fixed bottom-8 right-8 p-3 bg-emerald-600 text-white rounded-full shadow-lg hover:bg-emerald-700 transition-colors"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <ArrowUp className="w-6 h-6" />
                            </motion.button>

                            {/* بخش کامنت‌ها */}
                            <motion.div
                                className="mt-16 border-t border-emerald-100 pt-12"
                                initial={{ y: 20 }}
                                animate={{ y: 0 }}
                            >
                                <Comments />
                            </motion.div>
                        </article>
                    </motion.div>

                    {/* سایدبار سمت راست با افکت ویژه */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-4 lg:order-last order-last bg-white rounded-[2rem] shadow-xl border border-emerald-100 h-fit p-6 sticky top-28"
                    >
                        <BlogSidebar />
                        <motion.div
                            className="absolute -left-px top-24 w-1 h-24 bg-emerald-500 rounded-full"
                            initial={{ scaleY: 0 }}
                            animate={{ scaleY: 1 }}
                            transition={{ delay: 0.4 }}
                        />
                    </motion.div>
                </div>
            </div>
        </div>
    );
}