import { Suspense } from 'react';
import dynamic from 'next/dynamic';

const SpotPlayerComponent = dynamic(() => import('../../../components/account/spot-player/SpotPlayer'), {
    ssr: false,
    loading: () => <p>Loading player...</p>
});

export default function SpotPlayerPage() {
    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <div className="mx-auto max-w-7xl">
                <h1 className="mb-8 text-3xl font-bold text-gray-800">Spot Player</h1>
                {/* <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-2xl"> */}
                {/* <Suspense fallback={<div className="flex h-full items-center justify-center text-white">Loading player...</div>}> */}
                <SpotPlayerComponent />
                {/* </Suspense> */}
                {/* </div> */}
            </div>
        </div>
    );
}