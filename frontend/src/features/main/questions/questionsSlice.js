import { createSlice } from '@reduxjs/toolkit'
import { addAnswer, addQuestion, fetchAllQuestions, fetchLatestQuestions, fetchQuestionDetails, fetchQuestions } from './questionsActions'

const initialState = {
    allQuestions: [],
    questions: [],
    latestQuestions: [],
    singleQuestion: null,
    loading: false,
    error: null,
}

const questionsSlice = createSlice({
    name: 'questions',
    initialState,
    reducers: {},
    extraReducers: builder => {
        builder
            .addCase(fetchQuestions.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchQuestions.fulfilled, (state, action) => {
                state.loading = false
                state.questions = action.payload
            })
            .addCase(fetchQuestions.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            .addCase(fetchAllQuestions.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchAllQuestions.fulfilled, (state, action) => {
                state.loading = false
                state.allQuestions = action.payload
            })
            .addCase(fetchAllQuestions.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            .addCase(fetchLatestQuestions.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchLatestQuestions.fulfilled, (state, action) => {
                state.loading = false
                state.latestQuestions = action.payload
            })
            .addCase(fetchLatestQuestions.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            .addCase(fetchQuestionDetails.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchQuestionDetails.fulfilled, (state, action) => {
                state.loading = false
                console.log(action)
                state.singleQuestion = action.payload
            })
            .addCase(fetchQuestionDetails.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            .addCase(addQuestion.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(addQuestion.fulfilled, (state, action) => {
                state.loading = false
            })
            .addCase(addQuestion.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            .addCase(addAnswer.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(addAnswer.fulfilled, (state, action) => {
                state.loading = false
            })
            .addCase(addAnswer.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })

    },
})

export default questionsSlice.reducer
