'use client'
import { motion } from 'framer-motion'
import { FiMessageSquare, FiCalendar } from 'react-icons/fi'
import Link from 'next/link'

const QuestionList = ({ questions }) => {
    return (
        <div className="space-y-4">
            {questions.map((question, index) => (
                <motion.div
                    key={question.Id}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                >
                    <Link href={`/questions/${question.Id}`} className="block">
                        <div className="flex items-start gap-4">
                            <img
                                src={question.Avatar}
                                alt="آواتار کاربر"
                                className="w-10 h-10 rounded-full object-cover"
                            />
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-800 mb-2">{question.Title}</h3>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <span className="flex items-center gap-1">
                                        <FiMessageSquare />
                                        {question.AnswersCount} پاسخ
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <FiCalendar />
                                        {question.CreatedAt}
                                    </span>
                                    <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded">
                                        {question.CourseTitle}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Link>
                </motion.div>
            ))}
        </div>
    )
}

export default QuestionList