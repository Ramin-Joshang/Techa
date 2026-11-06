// components/CommentSkeleton.js
"use client";
import Skeleton from 'react-loading-skeleton';


const CommentSkeleton = () => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center mb-4">
                <Skeleton circle height={48} width={48} />
                <div className="mr-4">
                    <Skeleton height={20} width={100} />
                    <Skeleton height={14} width={80} />
                </div>
            </div>
            <Skeleton height={16} width={150} className="mb-4" />
            <Skeleton count={3} height={12} className="mb-2" />
        </div>
    );
};

export default CommentSkeleton;
