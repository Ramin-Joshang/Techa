// src/features/docs/blogsSlice.js

import { createSlice } from '@reduxjs/toolkit'
import { fetchBlogs, fetchDocById, fetchDocs } from './blogsActions'

const initialState = {
    blogs: [],
    loading: false,
    error: null,
}


const blogsSlice = createSlice({
    name: 'blogs',
    initialState,
    reducers: {},
    extraReducers: builder => {
        builder
            .addCase(fetchBlogs.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchBlogs.fulfilled, (state, action) => {
                state.loading = false
                state.blogs = action.payload
            })
            .addCase(fetchBlogs.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
    },
})

export default blogsSlice.reducer
