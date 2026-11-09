'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';

const LICENSE_KEY = '67fe68c6db3f948941f8483b19165770a2739018b7fc651d2f18485175c0eb8a55a29a4685f1a2c7acd338130120f19912521ed6abd4c6be85fe003f399e811e24828a0764bf64bac9f53794';

export default function SpotPlayer() {
    const [isReady, setIsReady] = useState(false);
    const playerRef = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => {
        let player;

        const initializePlayer = async () => {
            try {
                // 1. دریافت کوکی
                const res = await fetch('/api/spotx');
                if (!res.ok) throw new Error('Failed to fetch cookie');

                // 2. ایجاد پلیر
                player = new window.SpotPlayer(
                    containerRef.current,
                    '/api/spotx',
                    false
                );

                // 3. تنظیم سایز اولیه
                updateSize();
                window.addEventListener('resize', updateSize);

                // 4. باز کردن پلیر
                await player.Open(LICENSE_KEY);
                setIsReady(true);

            } catch (error) {
                console.error('Player Error:', error);
            }
        };

        const updateSize = () => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                containerRef.current.style.height = `${rect.width * 9 / 16}px`;
            }
        };

        if (window.SpotPlayer) {
            initializePlayer();
        } else {
            window.spotPlayerInit = initializePlayer;
        }

        return () => {
            window.removeEventListener('resize', updateSize);
            if (player) player.Hide();
        };
    }, []);

    return (
        <>
            <Script
                src="https://app.spotplayer.ir/assets/js/app-api.js"
                strategy="afterInteractive"
                onLoad={() => window.spotPlayerInit?.()}
                onError={(e) => console.error('Script failed to load', e)}
            />

            <div
                ref={containerRef}
                className="w-full bg-black relative"
                style={{ height: '0', paddingBottom: '56.25%' }} // 16:9 aspect ratio
            >
                {!isReady && (
                    <div className="absolute inset-0 flex items-center justify-center text-white">
                        <div className="animate-spin h-8 w-8 border-4 border-t-transparent rounded-full"></div>
                    </div>
                )}
            </div>
        </>
    );
}