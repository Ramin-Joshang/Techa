// components/ChapterSkeleton.js
"use client";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const ChapterSkeleton = () => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border-2 border-gray-100 mb-4">
            <Skeleton height={30} width="80%" className="mb-4" />
            <Skeleton height={20} width="60%" className="mb-2" />
            <Skeleton height={20} width="70%" className="mb-2" />
            <Skeleton height={20} width="50%" className="mb-2" />
        </div>
    );
};

export default ChapterSkeleton;
