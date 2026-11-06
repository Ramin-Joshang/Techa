// components/TabButtonsSkeleton.js
"use client";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const TabButtonsSkeleton = () => {
    return (
        <div className="flex gap-2">
            <Skeleton height={50} width={300} />
            {/* <Skeleton height={40} width={100} borderRadius={20} />
            <Skeleton height={40} width={100} borderRadius={20} />
            <Skeleton height={40} width={100} borderRadius={20} /> */}
        </div>
    );
};

export default TabButtonsSkeleton;
