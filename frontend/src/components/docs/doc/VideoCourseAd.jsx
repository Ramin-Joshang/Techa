import Link from "next/link";

const VideoCourseAd = ({ courseId, title }) => {

    return (
        <div className="bg-green-50 rounded-lg p-6 mb-8 border border-green-100 mt-5">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex-1">
                    <h3 className="text-xl font-bold text-green-800 mb-2">
                        آموزش ویدئویی حرفه‌ای 👨💻
                    </h3>
                    <p className="text-green-700 mb-4">
                        برای دسترسی به دوره آموزشی {title} با کیفیت HD، آموزش‌های تعاملی
                        و دریافت مدرک معتبر، دوره ویدیویی ما رو تهیه کنید!
                    </p>
                </div>
                <Link
                    href={`/courses/${courseId}`}
                    className="bg-green-600 hover:bg-green-700 text-white text-sm px-6 py-3 rounded-lg font-medium transition-colors whitespace-nowrap"
                >
                    مشاهده دوره ویدیویی
                </Link>
            </div>
        </div>
    );
}

export default VideoCourseAd;