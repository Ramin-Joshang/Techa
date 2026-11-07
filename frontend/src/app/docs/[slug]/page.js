import React from 'react';
import { notFound } from 'next/navigation';
import DocTitle from '../../../components/courses/course/CourseTitle';
import CourseTabsContainer from '../../../components/courses/course/CourseTabsContainer';
import {
  getPublishedCourseDetail,
  getCourseOutline,
  isNotFoundError,
} from '../../../lib/server';

export async function generateMetadata({ params }) {
  const courseSlug = params?.courseSlug || params?.slug || '';
  if (!courseSlug) return { title: 'مستندات تکا' };

  try {
    const course = await getPublishedCourseDetail(courseSlug);
    return {
      title: course.seo?.metaTitle || `${course.title} | مستندات تکا`,
      description: course.seo?.metaDescription || course.summary,
      keywords: course.seo?.metaKeywords || course.tags,
      robots: course.seo?.robotsNoIndex ? 'noindex, nofollow' : 'index, follow',
    };
  } catch (err) {
    if (isNotFoundError(err)) {
      return { title: 'دوره یافت نشد | تکا' };
    }
    return { title: 'مستندات آموزشی | تکا' };
  }
}

export default async function DocDetailsPage({ params }) {
  const courseSlug = params?.courseSlug || params?.slug || '';
  if (!courseSlug) {
    notFound();
  }

  let course;
  let outline;

  try {
    [course, outline] = await Promise.all([
      getPublishedCourseDetail(courseSlug),
      getCourseOutline(courseSlug),
    ]);
  } catch (err) {
    if (isNotFoundError(err)) {
      notFound();
    }
    // Network or server error - throw to trigger error boundary (never convert 500 to 404)
    throw err;
  }

  return (
    <div className="space-y-10">
      {/* Course Header & Title */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-5 xl:gap-10 pb-6 border-b border-gray-100">
        <div className="flex-1">
          <DocTitle title={course.title} />
          {course.summary && (
            <p className="text-gray-500 text-sm md:text-base mt-2 leading-relaxed">
              {course.summary}
            </p>
          )}
        </div>
      </div>

      {/* Course Tabbed Content */}
      <CourseTabsContainer course={course} outline={outline} />
    </div>
  );
}
