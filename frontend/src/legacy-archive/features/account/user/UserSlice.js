// src/features/docs/userSlice.js

import { createSlice } from '@reduxjs/toolkit'
import { fetchUserById, updateUser, updateUserSocialMedia } from './UserActions'

const initialState = {
    user: null,
    loading: false,
    error: null,
}


const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {},
    extraReducers: builder => {
        builder
            .addCase(fetchUserById.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchUserById.fulfilled, (state, action) => {
                state.loading = false
                state.user = action.payload
            })
            .addCase(fetchUserById.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            .addCase(updateUser.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(updateUser.fulfilled, (state, action) => {
                state.loading = false
            })
            .addCase(updateUser.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            .addCase(updateUserSocialMedia.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(updateUserSocialMedia.fulfilled, (state, action) => {
                state.loading = false
            })
            .addCase(updateUserSocialMedia.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
    },
})

export default userSlice.reducer
