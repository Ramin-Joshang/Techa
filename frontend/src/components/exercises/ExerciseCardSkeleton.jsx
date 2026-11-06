export default function ExerciseCardSkeleton() {
    return (
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="animate-pulse">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-full mt-3"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3 mt-2"></div>
                    </div>
                    <div className="bg-gray-200 rounded-full w-16 h-16"></div>
                </div>
                <div className="flex justify-between items-center mt-6">
                    <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                    <div className="text-left">
                        <div className="h-4 bg-gray-200 rounded w-12 mb-1"></div>
                        <div className="h-4 bg-gray-200 rounded w-16"></div>
                    </div>
                </div>
            </div>
        </div>
    )
};