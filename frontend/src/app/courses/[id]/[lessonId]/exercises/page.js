"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import ExerciseCard from "../../../../../components/courses/course/ExerciseCard";
import ExerciseInstructions from "../../../../../components/courses/course/ExerciseInstructions";
import ExerciseDetails from "../../../../../components/courses/course/ExerciseDetails";
import ExerciseCardSkeleton from "../../../../../components/courses/course/ExerciseCardSkeleton"

export default function ExercisePage({ params }) {
  const router = useRouter(); // ایجاد نمونه روتینگ
  const [exercises, setExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [loading, setLoading] = useState(true);
  const skeletons = [...Array(exercises.length ? exercises.length : 4)];

  const fakeExercises = [
    {
      id: 1,
      title: "تمرین اول: چاپ Hello World",
      description: "برنامه‌ای بنویسید که عبارت Hello World را در خروجی چاپ کند.",
      difficulty: "آسان",
      deadline: "۱۴۰۳/۰۳/۱۵",
      status: "completed",
    },
    {
      id: 2,
      title: "تمرین دوم: محاسبه جمع اعداد",
      description: "تابعی بنویسید که مجموع اعداد از ۱ تا N را محاسبه کند.",
      difficulty: "متوسط",
      deadline: "۱۴۰۳/۰۳/۲۰",
      status: "pending",
    },


    {
      id: 3,
      title: "تمرین پنجم: طراحی الگوریتم مرتب‌سازی",
      description: "یک الگوریتم برای مرتب‌سازی آرایه‌ها طراحی کنید.",
      difficulty: "دشوار",
      deadline: "۱۴۰۳/۰۳/۳۰",
      status: "rejected",
    },
    {
      id: 4,
      title: "تمرین ششم: تحلیل الگوریتم جستجو",
      description: "تحلیل زمان اجرا برای الگوریتم جستجوی دودویی انجام دهید.",
      difficulty: "متوسط",
      deadline: "۱۴۰۳/۰۴/۰۵",
      status: "unfinished",
    },
  ];


  useEffect(() => {
    setTimeout(() => {
      setExercises(fakeExercises);
      setLoading(false);
    }, 500);
  }, []);

  return (
    <div className="container mx-auto">
      <div className="grid grid-cols-1 gap-8">
        {/* لیست تمرینات */}
        <div className="lg:col-span-1 space-y-4">
          {/* دکمه برگشت به لیست سرفصل‌ها */}

          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold mb-4">تمرینات جلسه</h2>
            <button
              onClick={() => router.push(`/courses/${params.id}?tab=1`)}
              className="mb-6 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors flex items-center gap-2"
            >
              بازگشت
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
            {
              loading ? (
                skeletons.map((_, index) => (
                  <ExerciseCardSkeleton key={index} />
                ))
              ) : (
                exercises.map((exercise, index) => (
                  <ExerciseCard
                    key={exercise.id}
                    exercise={exercise}
                    index={index}
                    onClick={() => setSelectedExercise(exercise)}
                    isSelected={selectedExercise?.id === exercise.id}
                  />
                ))
              )
            }

          </div>
        </div>

        {/* جزئیات تمرین و دستورالعمل‌ها */}
        <div className="lg:col-span-2">
          {selectedExercise ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-xl p-6 shadow-lg relative"
            >

              <button
                onClick={() => setSelectedExercise(null)}
                className="p-1.5 absolute left-5 top-5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x">
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>


              <ExerciseDetails exercise={selectedExercise} />
            </motion.div>
          ) : (
            <ExerciseInstructions />
          )}
        </div>
      </div>
    </div>
  );
}