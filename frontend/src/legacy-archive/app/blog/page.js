"use client"
import { BlogCard } from '../../components/blog/BlogCard';
import { Pagination } from '../../components/blog/Pagination';
import { SearchAndFilter } from '../../components/blog/SearchAndFilter';
import { motion } from 'framer-motion';

export default function BlogPage() {
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

    return (
        <div className="pt-32">
            <div className="container px-5 xl:px-20 mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}

                >
                    <div className="text-center mb-16">
                        <h1 className="text-5xl font-bold text-emerald-900 mb-4">
                            وبلاگ تخصصی
                        </h1>
                        <p className="text-emerald-600 text-lg">آخرین مقالات و آموزش‌های برنامه‌نویسی</p>
                    </div>

                    <SearchAndFilter />

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
                        {posts.map((post, index) => (
                            <BlogCard
                                key={post.id}
                                post={post}
                                index={index}
                            />
                        ))}
                    </div>

                    <Pagination totalPages={Math.ceil(posts.length / 4)} />
                </motion.div>
            </div>
        </div>
    );
}