import { createSlice } from '@reduxjs/toolkit'
import { fetchQuizeById, fetchQuizQuestions, fetchQuizzes, sendQuize } from './quizzesActions'

const initialState = {
    quizzes: [],
    singlequiz: null,
    quizQuestions: [],
    loading: false,
    error: null,
}

const quizzesSlice = createSlice({
    name: 'quizzes',
    initialState,
    reducers: {},
    extraReducers: builder => {
        builder
            .addCase(fetchQuizzes.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchQuizzes.fulfilled, (state, action) => {
                state.loading = false
                state.quizzes = action.payload
            })
            .addCase(fetchQuizzes.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            .addCase(fetchQuizeById.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchQuizeById.fulfilled, (state, action) => {
                state.loading = false
                state.singlequiz = action.payload
            })
            .addCase(fetchQuizeById.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            .addCase(fetchQuizQuestions.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchQuizQuestions.fulfilled, (state, action) => {
                state.loading = false
                state.quizQuestions = action.payload
            })
            .addCase(fetchQuizQuestions.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            .addCase(sendQuize.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(sendQuize.fulfilled, (state, action) => {
                state.loading = false
            })
            .addCase(sendQuize.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
    },
})

export default quizzesSlice.reducer
