"use client";
import Skeleton from 'react-loading-skeleton';

const ExerciseCardSkeleton = () => {
    return (
        <div className="p-6 rounded-xl bg-gray-100 shadow-sm" style={{ boxShadow: "0 4px 20px -6px rgba(0, 0, 0, 0.1)" }}>
            <div className="flex items-center justify-between">
                <div className="space-y-3 w-full">
                    <div className="flex items-center gap-3">
                        <Skeleton circle={true} height={48} width={48} />
                        <Skeleton width={200} height={24} />
                    </div>

                    {/* Progress Bar Skeleton */}
                    <Skeleton width="100%" height={8} borderRadius="full" />

                    <div className="flex items-center gap-4 text-sm mt-2">
                        <Skeleton width={64} height={24} />
                        <Skeleton width={80} height={24} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExerciseCardSkeleton;
