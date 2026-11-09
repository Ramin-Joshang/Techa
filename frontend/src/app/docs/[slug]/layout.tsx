import React from 'react';
import { getCourseOutline, getPublishedCourseDetail } from '../../../lib/server';
import CourseSidebar from '../../../components/docs/CourseSidebar';
import { notFound } from 'next/navigation';

interface CourseLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    slug: string;
  }>;
}

export default async function CourseLayout({ children, params }: CourseLayoutProps) {
  const resolvedParams = await params;
  const courseSlug = resolvedParams?.slug || '';

  if (!courseSlug) {
    notFound();
  }

  const [course, outline] = await Promise.all([
    getPublishedCourseDetail(courseSlug).catch(() => null),
    getCourseOutline(courseSlug).catch(() => null),
  ]);

  if (!course || !outline) {
    notFound();
  }

  return (
    <div className="w-full bg-gray-50/40 min-h-screen py-8 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-start gap-8">
          {/* Sidebar */}
          <CourseSidebar
            outline={outline}
            courseSlug={courseSlug}
            courseTitle={course.title}
          />

          {/* Main Content (Overview or Lesson) */}
          <div className="flex-1 w-full min-w-0 bg-white rounded-2xl border border-gray-200/90 p-6 sm:p-10 shadow-xs">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
