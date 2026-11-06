"use client";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import DocTitle from "../../../components/courses/course/CourseTitle";
import DocInfo from "../../../components/docs/doc/DocInfo";
import DocTitleSkeleton from "../../../components/courses/course/CourseTitleSkeleton";
// import VideoCourseAd from "../../../components/docs/doc/VideoCourseAd";
import VideoCourseAdEnd from "../../../components/docs/doc/VideoCourseAdEnd";
import { SP_fetch } from "../../../api/utils/api";

import CourseContent from "../../../components/courses/course/CourseContent";
import Exercises from "../../../components/courses/course/Exercises";
import Comments from "../../../components/courses/course/Comments";
import TabButtons from "../../../components/courses/course/TabButtons";
import TabButtonsSkeleton from "../../../components/courses/course/TabButtonsSkeleton";
import TabContent from "../../../components/courses/course/TabContent";
import { useDispatch, useSelector } from "react-redux";
import { fetchDocById } from "../../../features/main/docs/docsActions";
import { fetchExerciseProgress } from "../../../features/main/exercises/exercisesActions";
import { fetchReviews } from "../../../features/main/reviews/reviewsActions";

export default function DocDetailsPage() {
  const params = useParams();
  const { slug } = params;
  const router = useRouter();
  const searchParams = useSearchParams();

  const tabParam = searchParams.get("tab");
  const initialTabIndex = tabParam ? parseInt(tabParam) : 0;
  const [activeTab, setActiveTab] = useState(initialTabIndex);

  const { loading, singleDoc: doc } = useSelector((state) => state.docs);
  const { userExerciseProgress } = useSelector((state) => state.exercises);
  const { reviews } = useSelector((state) => state.reviews);
  const dispatch = useDispatch();
  console.log(doc)
  // گرفتن شناسه مستند (در صورت وجود)
  const docId = doc?.Id;

  // مرحله اول: دریافت اطلاعات مستند بر اساس Slug (هنگام لود شدن کامپوننت)
  useEffect(() => {
    if (slug) {
      dispatch(fetchDocById({ Slug: slug }));
    }
  }, [slug, dispatch]);

  // مرحله دوم: دریافت اطلاعات وابسته به Id مستند (صبر میکند تا docId مقدار بگیرد)
  useEffect(() => {
    if (docId) {
      console.log(docId)
      // دقت کنید: اگر در بک‌اند فیلد برای مستندات DocId است، CourseId را اصلاح کنید 
      // من بر اساس کد خودتان CourseId نوشتم
      dispatch(fetchExerciseProgress({ UserId: 9, CourseId: docId }));
      dispatch(fetchReviews({ DocId: docId }));
    }
  }, [docId, dispatch]);


  // تب‌ها (استفاده از متغیر docId که از state خوانده شده است)
  const tabContent = [
    {
      id: 0,
      title: "اطلاعات دوره",
      content: <DocInfo docDetails={doc} />,
    },
    {
      id: 1,
      title: "تمرین‌ها",
      content: <Exercises docId={docId} data={userExerciseProgress} />,
    },
    {
      id: 2,
      title: "نظرات کاربران",
      content: <Comments docId={docId} reviews={reviews} />,
    },
  ];

  // تغییر تب
  const handleTabChange = (index) => {
    setActiveTab(index);
    router.push(`${window.location.pathname}?tab=${index}`, { shallow: true });
  };

  // انیمیشن
  const tabVariants = {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };

  return (
    <div className="space-y-10">
      {/* عنوان و تبلیغ اول */}
      <div className="flex flex-col xl:flex-row justify-between items-center gap-5 xl:gap-10">
        {/* عنوان دوره */}
        <div className="flex-1">
          {loading && !doc ? (
            <DocTitleSkeleton />
          ) : (
            <DocTitle title={doc?.Title} />
          )}
        </div>

        {/* دکمه‌های تب */}
        <div>
          {loading && !doc ? (
            <TabButtonsSkeleton />
          ) : (
            <TabButtons
              tabs={tabContent}
              activeTab={activeTab}
              onTabChange={handleTabChange}
            />
          )}
        </div>
      </div>

      {/* محتوای تب‌ها */}
      {(!loading || doc) && (
        <TabContent
          activeTab={activeTab}
          tabs={tabContent}
          variants={tabVariants}
        />
      )}

      {/* {(!loading || doc) && docId && (
        <VideoCourseAdEnd doc={doc} />
      )} */}
    </div>
  );
}
