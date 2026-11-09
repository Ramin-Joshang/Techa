import { NextResponse } from 'next/server';

export async function GET(request) {
    let X = request.cookies.get('X')?.value;
    let shouldUpdate = false;

    // اگر کوکی وجود نداشت یک کوکی اولیه ایجاد کنید
    if (!X) {
        X = crypto.randomUUID().replace(/-/g, '') + Date.now().toString(16);
        shouldUpdate = true;
    } else {
        const currentTime = Date.now();
        const cookieTime = parseInt(X.slice(24, 36), 16);
        shouldUpdate = currentTime > cookieTime;
    }

    if (shouldUpdate) {
        try {
            const response = await fetch('https://app.spotplayer.ir/', {
                method: 'HEAD',
                headers: { Cookie: `X=${X}` }
            });

            const newCookie = response.headers.get('set-cookie')?.match(/X=([a-f0-9]+);/)[1];
            X = newCookie || X;
        } catch (error) {
            console.error('SpotPlayer API Error:', error);
        }
    }

    const response = NextResponse.json({ status: 'OK' });
    response.cookies.set({
        name: 'X',
        value: X,
        maxAge: 3600 * 24 * 365 * 100,
        path: '/',
        secure: true,
        httpOnly: false,
        sameSite: 'Lax'
    });

    return response;
}