import { createSlice } from '@reduxjs/toolkit'
import { AddReview, fetchReviews } from './reviewsActions'

const initialState = {
    reviews: [],
    loading: false,
    error: null,
}

const reviewsSlice = createSlice({
    name: 'reviews',
    initialState,
    reducers: {},
    extraReducers: builder => {
        builder
            .addCase(fetchReviews.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchReviews.fulfilled, (state, action) => {
                state.loading = false
                state.reviews = action.payload
            })
            .addCase(fetchReviews.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            .addCase(AddReview.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(AddReview.fulfilled, (state, action) => {
                state.loading = false
            })
            .addCase(AddReview.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })

    },
})

export default reviewsSlice.reducer
