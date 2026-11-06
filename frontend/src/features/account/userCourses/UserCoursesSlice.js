import { createSlice } from '@reduxjs/toolkit'
import { fetchUserById, fetchUserCourses, fetchUserCoursesDashboard, updateUser, updateUserSocialMedia } from './UserCoursesActions'

const initialState = {
    summary: null,
    courses: [],
    loading: false,
    error: null,
}

const userCoursesSlice = createSlice({
    name: 'userCourses',
    initialState,
    reducers: {},
    extraReducers: builder => {
        builder
            .addCase(fetchUserCourses.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchUserCourses.fulfilled, (state, action) => {
                state.loading = false
                state.courses = action.payload
            })
            .addCase(fetchUserCourses.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            .addCase(fetchUserCoursesDashboard.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchUserCoursesDashboard.fulfilled, (state, action) => {
                state.loading = false
                state.summary = action.payload
            })
            .addCase(fetchUserCoursesDashboard.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
    },
})

export default userCoursesSlice.reducer
