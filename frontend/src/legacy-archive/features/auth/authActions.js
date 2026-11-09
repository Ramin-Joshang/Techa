import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/utils/axios";

// Request OTP
export const requestOTP = createAsyncThunk(
    "auth/RequestOtp",
    async (phone, { rejectWithValue }) => {
        try {
            const response = await api.post(`/Account/RequestOtp`, {
                Phone: phone,
                ProjectId: 1016,
            });

            if (!response.data.IsSuccess) {
                return rejectWithValue(response.data.Message || "خطایی در ارسال کد رخ داده است");
            }
            return { phone };
        } catch (error) {
            return rejectWithValue(error.response?.data?.Message || "خطای شبکه رخ داده است");
        }
    }
);

// Verify OTP → توجه: شما گفتید GET ولی پارامترها body هستند → باید POST باشد
export const verifyOTP = createAsyncThunk(
    "auth/VerifyOtp",
    async ({ phone, code }, { rejectWithValue }) => {
        try {
            const response = await api.post(`/Account/VerifyOtp`, {
                Phone: phone,
                Otp: code,
                ProjectId: 1016,
            });

            if (!response.data.IsSuccess) {
                return rejectWithValue(response.data.Message || "کد وارد شده نامعتبر است");
            }
            return response.data.Data; // شامل Token و RefreshToken و ...
        } catch (error) {
            return rejectWithValue(error.response?.data?.Message || "خطای شبکه رخ داده است");
        }
    }
);

// Refresh Token
export const refreshToken = createAsyncThunk(
    "auth/refreshToken",
    async (_, { getState, rejectWithValue }) => {
        try {
            const { auth } = getState();
            const refreshToken = Cookies.get("refreshToken"); // یا از state اگر نگه می‌داری

            if (!refreshToken) {
                throw new Error("No refresh token available");
            }

            const response = await api.post("/Account/RefreshToken", {
                RefreshToken: refreshToken,
                ProjectId: 1016,
            });

            if (!response.data.IsSuccess) {
                return rejectWithValue(response.data.Message || "رفرش توکن ناموفق بود");
            }

            return response.data.Data; // شامل Token جدید + RefreshToken جدید + user info
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.Message || "خطا در رفرش توکن"
            );
        }
    }
);