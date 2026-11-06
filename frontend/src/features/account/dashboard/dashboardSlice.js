// src/features/roadmap/dashboardSlice.js

import { createSlice } from '@reduxjs/toolkit';
import { fetchUserDashboardStats, fetchUserStudyStats } from './dashboardActions';


const initialState = {
    dashboardStats: null,
    studyStats: null,
    loading: false,
    error: null,
};

const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState,

    reducers: {},

    extraReducers: (builder) => {
        // دریافت پیشرفت
        builder
            .addCase(fetchUserDashboardStats.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUserDashboardStats.fulfilled, (state, action) => {
                state.loading = false;
                state.dashboardStats = action.payload;
                state.error = null;
            })
            .addCase(fetchUserDashboardStats.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'خطا در بارگذاری داشبورد';
            })
            .addCase(fetchUserStudyStats.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUserStudyStats.fulfilled, (state, action) => {
                state.loading = false;
                state.studyStats = action.payload;
                state.error = null;
            })
            .addCase(fetchUserStudyStats.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'خطا در بارگذاری داشبورد';
            })

    }
});

export default dashboardSlice.reducer;