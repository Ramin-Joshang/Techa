import { createSlice } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';
import { refreshToken, requestOTP, verifyOTP } from './authActions';

const initialState = {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    otpSent: false,
    timer: 0,
    phone: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },

        setTimer: (state, action) => {
            state.timer = action.payload;
        },

        decrementTimer: (state) => {
            state.timer = Math.max(0, state.timer - 1);
        },

        resetAuth: (state) => {
            state.loading = false;
            state.error = null;
            state.otpSent = false;
            state.timer = 0;
            state.phone = null;
        },

        logout: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.loading = false;
            state.error = null;
            state.otpSent = false;
            state.timer = 0;
            state.phone = null;

            Cookies.remove('token');
            Cookies.remove('refreshToken');
            Cookies.remove('user');
            Cookies.remove('otpStart');
        },

        loadUserFromCookie: (state) => {
            try {
                const userCookie = Cookies.get('user');
                if (userCookie) {
                    const parsedUser = JSON.parse(userCookie);
                    state.user = parsedUser;
                    state.isAuthenticated = !!parsedUser?.Token; // یا هر شرطی که مناسب است
                }

                const otpStart = Cookies.get('otpStart');
                if (otpStart) {
                    const elapsed = Math.floor((Date.now() - parseInt(otpStart, 10)) / 1000);
                    const remaining = Math.max(0, 120 - elapsed);

                    if (remaining > 0) {
                        state.timer = remaining;
                        state.otpSent = true;
                    } else {
                        Cookies.remove('otpStart');
                    }
                }
            } catch (err) {
                console.error('Error loading auth state from cookies:', err);
            }
        },
    },

    extraReducers: (builder) => {
        builder
            // ────────────────────────────────────────────────
            // requestOTP
            .addCase(requestOTP.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(requestOTP.fulfilled, (state, action) => {
                state.loading = false;
                state.otpSent = true;
                state.phone = action.payload.phone;
                state.timer = 120;
                state.error = null;

                Cookies.set('otpStart', Date.now().toString(), {
                    expires: 1,
                    secure: true,
                    sameSite: 'strict',
                });
            })
            .addCase(requestOTP.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'خطا در ارسال کد تأیید';
                state.otpSent = false;
            })

            // ────────────────────────────────────────────────
            // verifyOTP
            .addCase(verifyOTP.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(verifyOTP.fulfilled, (state, action) => {
                const data = action.payload; // همان Data که برگردانده شده

                state.loading = false;
                state.user = data;
                state.isAuthenticated = true;
                state.error = null;
                state.otpSent = false;
                state.timer = 0;
                state.phone = null; // بعد از لاگین معمولاً پاک می‌شود

                Cookies.set('token', data.Token, {
                    expires: 7,
                    secure: true,
                    sameSite: 'strict',
                });

                Cookies.set('refreshToken', data.RefreshToken, {
                    expires: 30,
                    secure: true,
                    sameSite: 'strict',
                });

                Cookies.set('user', JSON.stringify(data), {
                    expires: 7,
                    secure: true,
                    sameSite: 'strict',
                });

                Cookies.remove('otpStart');
            })
            .addCase(verifyOTP.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'ورود ناموفق بود';
            })

            // ────────────────────────────────────────────────
            // refreshToken
            .addCase(refreshToken.pending, (state) => {
                // معمولاً loading را تغییر نمی‌دهیم چون در پس‌زمینه است
            })
            .addCase(refreshToken.fulfilled, (state, action) => {
                const data = action.payload;

                state.user = data;
                state.isAuthenticated = true;

                Cookies.set('token', data.Token, {
                    expires: 7,
                    secure: true,
                    sameSite: 'strict',
                });

                Cookies.set('refreshToken', data.RefreshToken, {
                    expires: 30,
                    secure: true,
                    sameSite: 'strict',
                });

                Cookies.set('user', JSON.stringify(data), {
                    expires: 7,
                    secure: true,
                    sameSite: 'strict',
                });
            })
            .addCase(refreshToken.rejected, (state) => {
                // اگر رفرش شکست خورد → لاگ‌اوت می‌کنیم (معمولاً در interceptor انجام می‌شود)
                // اما برای اطمینان اینجا هم می‌گذاریم
                state.user = null;
                state.isAuthenticated = false;
                Cookies.remove('token');
                Cookies.remove('refreshToken');
                Cookies.remove('user');
            });
    },
});

export const {
    clearError,
    setTimer,
    decrementTimer,
    resetAuth,
    logout,
    loadUserFromCookie,
} = authSlice.actions;

export default authSlice.reducer;