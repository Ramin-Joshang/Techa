// src/features/roadmap/roadmapSlice.js

import { createSlice } from '@reduxjs/toolkit';
import { fetchUserRoadmap } from './roadmapActions';


const initialState = {
    milestones: [],
    currentStep: 0,
    progressPercentage: 0,
    remainingSteps: 0,
    loading: false,
    error: null,
    lastUpdated: null,
};

const roadmapSlice = createSlice({
    name: 'roadmap',
    initialState,

    reducers: {},

    extraReducers: (builder) => {
        // دریافت پیشرفت
        builder
            .addCase(fetchUserRoadmap.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUserRoadmap.fulfilled, (state, action) => {
                state.loading = false;
                state.milestones = action.payload;

                // محاسبه currentStep و درصد (مطابق منطق فرانت‌اند)
                const completed = action.payload.filter(m => m.Status === 'COMPLETED').length;
                const total = action.payload.length;
                state.progressPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;
                state.remainingSteps = total - completed;

                // پیدا کردن مرحله فعلی (اولین IN_PROGRESS یا آخرین COMPLETED)
                const current = action.payload.find(m => m.Status === 'IN_PROGRESS');
                state.currentStep = current ? current.MilestoneID :
                    (completed > 0 ? action.payload[completed - 1]?.MilestoneID : 0);
            })
            .addCase(fetchUserRoadmap.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'خطا در بارگذاری پیشرفت';
            })

    }
});

export const { resetRoadmap } = roadmapSlice.actions;
export default roadmapSlice.reducer;