'use client'
import { motion } from 'framer-motion'
import { FiSearch, FiInfo, FiClock, FiPlus, FiBook } from 'react-icons/fi'
import QuestionList from '../../../../components/questions/QuestionList'
import Link from 'next/link'

const Questions = () => {
    const questions = [
        {
            id: 1,
            title: 'چگونه از useState در ری اکت استفاده کنیم؟',
            course: 'ری اکت پیشرفته',
            date: '۱۴۰۳/۰۳/۲۵',
            answers: 5,
            avatar: '/images/teacher.jpeg'
        },
        {
            id: 2,
            title: 'تفاوت بین state و props چیست؟',
            course: 'مبانی ری اکت',
            date: '۱۴۰۳/۰۴/۰۱',
            answers: 3,
            avatar: '/images/teacher.jpeg'
        },
        {
            id: 3,
            title: 'کاربرد هوک useEffect چیست؟',
            course: 'ری اکت پیشرفته',
            date: '۱۴۰۳/۰۴/۱۰',
            answers: 8,
            avatar: '/images/teacher.jpeg'
        },
        {
            id: 4,
            title: 'چگونه از Context API در ری اکت استفاده کنیم؟',
            course: 'ری اکت متوسط',
            date: '۱۴۰۳/۰۴/۱۵',
            answers: 6,
            avatar: '/images/teacher.jpeg'
        },
        {
            id: 5,
            title: 'معرفی ری اکت و مزایای آن',
            course: 'مبانی ری اکت',
            date: '۱۴۰۳/۰۴/۲۰',
            answers: 10,
            avatar: '/images/teacher.jpeg'
        },
        {
            id: 6,
            title: 'چگونه از Redux برای مدیریت وضعیت استفاده کنیم؟',
            course: 'ری اکت پیشرفته',
            date: '۱۴۰۳/۰۴/۲۵',
            answers: 4,
            avatar: '/images/teacher.jpeg'
        },
        {
            id: 7,
            title: 'چگونه یک فرم کنترل‌شده در ری اکت ایجاد کنیم؟',
            course: 'ری اکت متوسط',
            date: '۱۴۰۳/۰۵/۰۵',
            answers: 7,
            avatar: '/images/teacher.jpeg'
        },
        {
            id: 8,
            title: 'ساختار و استفاده از کامپوننت‌ها در ری اکت',
            course: 'مبانی ری اکت',
            date: '۱۴۰۳/۰۵/۱۰',
            answers: 5,
            avatar: '/images/teacher.jpeg'
        },
        {
            id: 9,
            title: 'چگونه از Fragment در ری اکت استفاده کنیم؟',
            course: 'ری اکت متوسط',
            date: '۱۴۰۳/۰۵/۱۵',
            answers: 2,
            avatar: '/images/teacher.jpeg'
        },
        {
            id: 10,
            title: 'روش‌های بهینه‌سازی عملکرد در ری اکت',
            course: 'ری اکت پیشرفته',
            date: '۱۴۰۳/۰۵/۲۰',
            answers: 6,
            avatar: '/images/teacher.jpeg'
        }
    ];

    const courses = [
        { id: 1, title: 'مبانی ری اکت', count: 4 },
        { id: 2, title: 'ری اکت متوسط', count: 3 },
        { id: 3, title: 'ری اکت پیشرفته', count: 4 },
    ]

    const latestQuestions = questions.slice(-6) // آخرین ۵ سوال

    return (
        <div className="min-h-screen bg-gray-50 pt-32">
            <div className="container mx-auto px-5 xl:px-20">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* بخش اصلی */}
                    <div className="lg:col-span-3">
                        {/* هدر و جستجو */}
                        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-emerald-800 mb-1">
                                    سوالات و پاسخ‌ها
                                </h1>
                                <p className="text-gray-600">
                                    {questions.length} سوال ثبت شده
                                </p>
                            </div>

                            <Link
                                href="questions/ask"
                                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 transition-all"
                            >
                                <FiPlus className="text-lg" />
                                ایجاد سوال جدید
                            </Link>
                        </div>

                        {/* نکته مهم */}
                        <motion.div
                            initial={{ scale: 0.98 }}
                            animate={{ scale: 1 }}
                            className="bg-emerald-50 border-r-4 border-emerald-500 p-4 rounded-lg mb-8"
                        >
                            <div className="flex items-start gap-2">
                                <FiInfo className="text-emerald-600 mt-1" />
                                <p className="text-emerald-800 text-sm">
                                    قبل از پرسش سوال جدید، از منوی سمت راست آخرین سوالات را بررسی کنید.
                                </p>
                            </div>
                        </motion.div>

                        {/* لیست سوالات */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            <QuestionList questions={questions} />
                        </motion.div>
                    </div>

                    {/* سایدبار پیشرفته */}
                    <div className="lg:col-span-1 space-y-6">


                        {/* آخرین سوالات */}
                        <div className="bg-white p-4 rounded-xl shadow-sm sticky top-24">
                            <h2 className="text-lg font-semibold text-emerald-800 mb-4 flex items-center gap-2">
                                <FiClock className="text-emerald-600" />
                                آخرین پرسش‌ها
                            </h2>

                            <div className="space-y-3">
                                {latestQuestions.map((question, index) => (
                                    <motion.div
                                        key={question.id}
                                        initial={{ x: 20 }}
                                        animate={{ x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <a
                                            href={`/questions/${question.id}`}
                                            className="block p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
                                        >
                                            <p className="text-sm font-medium text-gray-800 mb-1 line-clamp-2">
                                                {question.title}
                                            </p>
                                            <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                                                <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded">
                                                    {question.course}
                                                </span>
                                                <span>۲ روز پیش</span>
                                            </div>
                                        </a>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* فیلتر بر اساس دوره */}
                        {/* <div className="bg-white p-4 rounded-xl shadow-sm">
                            <h2 className="text-lg font-semibold text-emerald-800 mb-4 flex items-center gap-2">
                                <FiBook className="text-emerald-600" />
                                دسته‌بندی دوره‌ها
                            </h2>

                            <div className="space-y-2">
                                {courses.map((course) => (
                                    <a
                                        key={course.id}
                                        href={`/courses/${course.id}`}
                                        className="flex justify-between items-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <span className="text-sm text-gray-800">{course.title}</span>
                                        <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full">
                                            {course.count}
                                        </span>
                                    </a>
                                ))}
                            </div>
                        </div> */}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Questions