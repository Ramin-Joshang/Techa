'use client'
import { FiMessageSquare, FiCalendar, FiClock, FiPlus } from 'react-icons/fi'
import { Editor } from '@tinymce/tinymce-react'
import { useState } from 'react'
import Link from 'next/link'
import { motion } from "framer-motion"

const QuestionPage = ({ params }) => {
    const [answerContent, setAnswerContent] = useState('')
    const question = {
        id: params.id,
        title: 'چگونه از useState در ری اکت استفاده کنیم؟',
        content: 'من در حال یادگیری ری اکت هستم و میخواهم state مدیریت کنم...',
        course: 'ری اکت پیشرفته',
        date: '۱۴۰۳/۰۳/۲۵',
        answers: 5,
        avatar: '/images/teacher.jpeg'
    }

    const latestQuestions = [
        {
            id: 2,
            title: 'تفاوت useEffect و useLayoutEffect چیست؟',
            course: 'ری اکت پیشرفته',
            date: '۱۴۰۳/۰۳/۲۴'
        },
        // ...سوالات دیگر
    ]

    return (
        <div className="min-h-screen bg-gray-50 pt-32">
            <div className="container mx-auto px-5 xl:px-20">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* محتوای اصلی */}
                    <div className="lg:col-span-3">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            {/* هدر سوال */}
                            <div className="flex items-start gap-4 mb-6">
                                <img
                                    src={question.avatar}
                                    alt="آواتار کاربر"
                                    className="w-12 h-12 rounded-full object-cover"
                                />
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-800 mb-2">
                                        {question.title}
                                    </h1>
                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                        <span className="flex items-center gap-1">
                                            <FiCalendar />
                                            {question.date}
                                        </span>
                                        <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded">
                                            {question.course}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* متن سوال */}
                            <div className="prose max-w-none mb-8">
                                {question.content}
                            </div>

                            {/* بخش پاسخ‌ها */}
                            <div className="border-t pt-6">
                                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                    <FiMessageSquare className="text-emerald-600" />
                                    {question.answers} پاسخ
                                </h2>

                                {/* لیست پاسخ‌ها */}
                                <div className="space-y-6">
                                    {/* پاسخ نمونه */}
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <div className="flex items-start gap-3 mb-3">
                                            <img
                                                src={question.avatar}
                                                alt="آواتار کاربر"
                                                className="w-12 h-12 rounded-full object-cover"
                                            />                                            <div>
                                                <h4 className="font-semibold">کاربر نمونه</h4>
                                                <p className="text-sm text-gray-500">۱۴۰۳/۰۳/۲۵</p>
                                            </div>
                                        </div>
                                        <p className="text-gray-700">
                                            برای استفاده از useState باید ابتدا آن را ایمپورت کنید...
                                        </p>
                                    </div>
                                </div>

                                {/* فرم پاسخ */}
                                <div className="mt-8">
                                    <h3 className="text-lg font-semibold mb-4">پاسخ خود را ثبت کنید</h3>

                                    <Editor
                                        apiKey='v12ld4fyiekikay5d5tuv6j4578f6daxybv4qrm2a0oymp5j' // دریافت از tiny.ir
                                        init={{
                                            menubar: false,
                                            plugins: 'lists link',
                                            toolbar: 'bold italic | bullist numlist | link',
                                            content_style: 'body { font-family: Vazir, sans-serif; font-size: 14px; }',
                                            directionality: 'rtl'
                                        }}
                                        value={answerContent}
                                        onEditorChange={(newValue) => setAnswerContent(newValue)}
                                        className="border rounded-lg overflow-hidden"
                                    />

                                    <button className="mt-4 bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition">
                                        ارسال پاسخ
                                    </button>
                                </div>
                            </div>
                        </div>
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

export default QuestionPage