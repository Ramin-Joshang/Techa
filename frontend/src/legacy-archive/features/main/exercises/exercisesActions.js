// src/features/todos/todosActions.js
import { createAsyncThunk } from '@reduxjs/toolkit'
import { SP_fetch } from "../../../api/utils/api";

export const fetchExercises = createAsyncThunk(
    'exercises/fetchExercises',
    async (parameters, thunkAPI) => {
        try {
            const res = await SP_fetch('Exercise_List', parameters)
            return res.Data
        } catch (err) {
            return thunkAPI.rejectWithValue(err.message)
        }
    }
)
export const fetchContentsWithExercises = createAsyncThunk(
    'exercises/fetchContentsWithExercises',
    async (parameters, thunkAPI) => {
        try {
            const res = await SP_fetch('ContentsWithExercises_List', parameters)
            return res.Data
        } catch (err) {
            return thunkAPI.rejectWithValue(err.message)
        }
    }
)

export const fetchExerciseById = createAsyncThunk(
    'exercises/fetchExerciseById',
    async (parameters, thunkAPI) => {
        try {
            const res = await SP_fetch('Form_Exercises', parameters)
            return res.Data[0]
        } catch (err) {
            return thunkAPI.rejectWithValue(err.message)
        }
    }
)

export const sendExercise = createAsyncThunk(
    'exercises/sendExercise',
    async (parameters, thunkAPI) => {
        try {
            const res = await SP_fetch('Save_UserExerciseProgresses', parameters)
            return res.Data
        } catch (err) {
            return thunkAPI.rejectWithValue(err.message)
        }
    }
)

export const fetchExerciseProgress = createAsyncThunk(
    'exercises/fetchExerciseProgress',
    async (parameters, thunkAPI) => {
        try {
            const res = await SP_fetch('GetUserExerciseProgress', parameters)
            return res.Data[0]
        } catch (err) {
            return thunkAPI.rejectWithValue(err.message)
        }
    }
)
export const fetchQuizExercise = createAsyncThunk(
    'exercises/fetchQuizExercise',
    async (parameters, thunkAPI) => {
        try {
            const res = await SP_fetch('ExerciseQuestions_List', parameters)
            return res.Data
        } catch (err) {
            return thunkAPI.rejectWithValue(err.message)
        }
    }
)