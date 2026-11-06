"use client";
import Skeleton from 'react-loading-skeleton';


const LessonSkeleton = () => {
    return (
        <div className="">
            <div className="flex flex-col sm:flex-row gap-5 justify-between items-center">
                <Skeleton width={300} height={40} />
                <div className="flex gap-4 items-center">
                    <Skeleton width={120} height={40} />
                </div>
            </div>
            <div className="text-[17.5px] font-normal leading-7 text-justify mt-7 grid gap-5">
                <div className="prose max-w-full">
                    <Skeleton count={10} />
                </div>
                <div className="bg-[#F3F6F3] rounded-2xl p-2">
                    <div className="px-5 flex items-center justify-between py-2">
                        <Skeleton width={100} height={24} />
                        <Skeleton width={120} height={32} />
                    </div>
                    <div className="bg-white rounded-2xl h-60">
                        <Skeleton height="100%" />
                    </div>
                </div>
            </div>
            <div className="flex gap-4 items-center mt-10 justify-between">
                <Skeleton width={80} height={40} />
                <Skeleton width={80} height={40} />
            </div>
        </div>
    );
};

export default LessonSkeleton;
