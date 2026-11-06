// components/DocInfoCardSkeleton.js
"use client";
import Skeleton from 'react-loading-skeleton';


const DocInfoCardSkeleton = () => {
    return (
        <div className="bg-[#D0DDD140] rounded-xl py-5 px-5">
            <Skeleton circle height={40} width={40} className="mb-4" />
            <Skeleton height={14} width="50%" className="mb-2" />
            <Skeleton height={20} width="70%" />
        </div>
    );
};

export default DocInfoCardSkeleton;
