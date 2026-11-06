import React from 'react';
import Skeleton from 'react-loading-skeleton';

const SidebarSkeleton = () => {
    return (
        <>
            {[...Array(4)].map((_, index) => (
                <div key={index} className='mb-5 w-full'>
                    <div className='flex items-center justify-between py-3 px-3 lg:px-5'>
                        <div className='flex items-center gap-3'>
                            <Skeleton circle width={36} height={36} />
                            <div>
                                <Skeleton width={80} height={12} />
                                <Skeleton width={120} height={16} />
                            </div>
                        </div>
                        <Skeleton width={24} height={24} />
                    </div>
                    <div className='px-3 lg:px-5'>
                        <Skeleton count={5} height={20} className='my-2' />
                    </div>
                </div>
            ))}
        </>
    );
};

export default SidebarSkeleton;