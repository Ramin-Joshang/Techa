import { createSlice } from '@reduxjs/toolkit'
import { fetchContentsWithExercises, fetchExerciseById, fetchExerciseProgress, fetchExercises, fetchQuizExercise, sendExercise } from './exercisesActions'

const initialState = {
    exercises: [],
    contents: [],
    singleExercise: null,
    userExerciseProgress: null,
    loading: false,
    error: null,
}

const exercisesSlice = createSlice({
    name: 'exercises',
    initialState,
    reducers: {},
    extraReducers: builder => {
        builder
            .addCase(fetchExercises.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchExercises.fulfilled, (state, action) => {
                state.loading = false
                state.exercises = action.payload
            })
            .addCase(fetchExercises.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            .addCase(fetchContentsWithExercises.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchContentsWithExercises.fulfilled, (state, action) => {
                state.loading = false
                state.contents = action.payload
            })
            .addCase(fetchContentsWithExercises.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            .addCase(fetchExerciseById.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchExerciseById.fulfilled, (state, action) => {
                state.loading = false
                state.singleExercise = action.payload
            })
            .addCase(fetchExerciseById.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            .addCase(sendExercise.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(sendExercise.fulfilled, (state, action) => {
                state.loading = false
            })
            .addCase(sendExercise.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            .addCase(fetchExerciseProgress.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchExerciseProgress.fulfilled, (state, action) => {
                state.loading = false
                state.userExerciseProgress = action.payload
            })
            .addCase(fetchExerciseProgress.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            .addCase(fetchQuizExercise.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchQuizExercise.fulfilled, (state, action) => {
                state.loading = false
                state.exercises = action.payload
            })
            .addCase(fetchQuizExercise.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
    },
})

export default exercisesSlice.reducer
