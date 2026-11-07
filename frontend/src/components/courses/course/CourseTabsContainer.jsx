'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Clock, ChevronLeft } from 'lucide-react';
import DocInfo from '../../docs/doc/DocInfo';
import TabButtons from './TabButtons';

export default function CourseTabsContainer({ course, outline }) {
  const [activeTab, setActiveTab] = useState(0);

  const chapters = outline?.chapters || [];

  const tabContent = [
    {
      id: 0,
      title: 'اطلاعات دوره',
      content: <DocInfo docDetails={course} />,
    },
    {
      id: 1,
      title: 'سرفصل‌ها و جلسات',
      content: (
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <h2 className="text-xl md:text-2xl font-black text-[#042A1B] flex items-center gap-2">
              <span className="w-2 h-7 bg-emerald-500 rounded-full inline-block" />
              سرفصل‌های آموزشی دوره
            </h2>
            <span className="text-sm font-semibold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
              {chapters.length} فصل • {course?.stats?.totalLessons || 0} جلسه
            </span>
          </div>

          {chapters.length > 0 ? (
            <div className="space-y-4">
              {chapters.map((chapter, chIdx) => (
                <div key={chapter.id || chIdx} className="border border-gray-100 rounded-2xl p-5 bg-gray-50/50">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-base md:text-lg text-gray-900 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 text-xs flex items-center justify-center font-bold">
                        {chIdx + 1}
                      </span>
                      {chapter.title}
                    </h3>
                    <span className="text-xs text-gray-400 font-medium">
                      {(chapter.lessons || []).length} درس
                    </span>
                  </div>

                  {chapter.summary && (
                    <p className="text-sm text-gray-500 mb-4 leading-relaxed pr-8">
                      {chapter.summary}
                    </p>
                  )}

                  <div className="space-y-2 pr-2">
                    {(chapter.lessons || []).map((lesson, lIdx) => (
                      <Link
                        key={lesson.id || lIdx}
                        href={`/docs/${course.slug}/${lesson.slug}`}
                        className="flex items-center justify-between p-3 rounded-xl bg-white border border-gray-100 hover:border-emerald-300 hover:shadow-sm transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <BookOpen className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
                          <span className="text-sm font-semibold text-gray-800 group-hover:text-emerald-700 transition-colors">
                            {lesson.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1 text-xs text-gray-400 font-mono" dir="ltr">
                            <Clock className="w-3.5 h-3.5" />
                            {lesson.readingTimeMinutes} min
                          </span>
                          <ChevronLeft className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400 text-sm">
              سرفصلی برای این دوره ثبت نشده است.
            </div>
          )}
        </div>
      ),
    },
  ];

  const tabVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  };

  return (
    <div className="space-y-8">
      {/* Tab Navigation Header */}
      <div className="flex justify-start">
        <TabButtons
          tabs={tabContent}
          activeTab={activeTab}
          onTabChange={(index) => setActiveTab(index)}
        />
      </div>

      {/* Tab Content Body */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          variants={tabVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.2 }}
        >
          {tabContent[activeTab]?.content}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
