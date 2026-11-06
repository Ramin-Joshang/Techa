// components/AccordionSkeleton.js
import Skeleton from 'react-loading-skeleton';

const AccordionSkeleton = () => {
    return (
        <div className="border-b border-[#D0DDD1] py-5">
            <div className="flex items-center justify-between">
                <Skeleton width="60%" height={20} />
                <Skeleton circle width={24} height={24} />
            </div>
            <div className="mt-5 pr-5 pl-10">
                <Skeleton count={3} height={16} className="mb-2" />
            </div>
        </div>
    );
};

export default AccordionSkeleton;
