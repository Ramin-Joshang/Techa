// components/CourseDescriptionSkeleton.js
"use client";
import Skeleton from 'react-loading-skeleton';


const DocDescriptionSkeleton = () => {
    return (
        <div className="mb-5">
            <Skeleton height={20} width="80%" className="mb-2" />
            <Skeleton count={4} height={16} className="mb-1" />
        </div>
    );
};

export default DocDescriptionSkeleton;
