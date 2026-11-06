'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import CourseContent from "../../../components/courses/course/CourseContent"
import Exercises from '../../../components/courses/course/Exercises'
import Comments from '../../../components/courses/course/Comments'
import TabButtons from '../../../components/courses/course/TabButtons'
import TabButtonsSkeleton from '../../../components/courses/course/TabButtonsSkeleton'
import TabContent from '../../../components/courses/course/TabContent'
import DocTitleSkeleton from '../../../components/courses/course/CourseTitleSkeleton'
import DocTitle from '../../../components/courses/course/CourseTitle'


const CoursePage = () => {
    const router = useRouter();

    const [loading, setLoading] = useState(false)
    const searchParams = useSearchParams();
    const tabParam = searchParams.get("tab");
    const initialTabIndex = tabParam ? parseInt(tabParam) : 0;
    const [activeTab, setActiveTab] = useState(initialTabIndex);

    const tabContent = [
        {
            id: 0,
            title: "اطلاعات دوره",
            content: <CourseContent />,
        },
        {
            id: 1,
            title: "تمرین‌ها",
            content: <Exercises />,
        },
        {
            id: 2,
            title: "نظرات کاربران",
            content: <Comments />,
        },
    ];


    // تابع برای تغییر تب و به‌روزرسانی URL
    const handleTabChange = (index) => {
        setActiveTab(index);
        router.push(`${window.location.pathname}?tab=${index}`, undefined, {
            shallow: true,
        });
    };


    // تعریف انیمیشن‌ها برای تب‌ها
    const tabVariants = {
        initial: {
            opacity: 0,
            x: 50,
        },
        animate: {
            opacity: 1,
            x: 0,
        },
        exit: {
            opacity: 0,
            x: -50,
        },
    };

    return (
        <div>
            {/* عنوان و تب‌ها */}
            <div className="flex flex-col md:flex-row gap-5 gap-y-7 justify-between items-center">
                {loading ? (
                    <DocTitleSkeleton />
                ) : (
                    // <CourseTitle title={courseDetails?.Title} />
                    <DocTitle title={"React پروژه محور"} />
                )}
                {loading ? (
                    <TabButtonsSkeleton />
                ) : (
                    <TabButtons
                        tabs={tabContent}
                        activeTab={activeTab}
                        onTabChange={handleTabChange}
                    />
                )}
            </div>

            {/* محتوای تب‌ها */}
            {!loading && (
                <TabContent
                    activeTab={activeTab}
                    tabs={tabContent}
                    variants={tabVariants}
                />
            )}
        </div>
    )
}

export default CoursePage