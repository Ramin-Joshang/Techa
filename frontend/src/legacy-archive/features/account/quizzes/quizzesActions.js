// src/features/todos/todosActions.js
import { createAsyncThunk } from '@reduxjs/toolkit'
import { SP_fetch } from "../../../api/utils/api";

export const fetchQuizzes = createAsyncThunk(
    'quizzes/fetchquizzes',
    async (parameters, thunkAPI) => {
        try {
            const res = await SP_fetch('Quizzes_List', parameters)
            return res.Data
        } catch (err) {
            return thunkAPI.rejectWithValue(err.message)
        }
    }
)
export const fetchQuizeById = createAsyncThunk(
    'quizzes/fetchQuizeById',
    async (parameters, thunkAPI) => {
        try {
            const res = await SP_fetch('GetQuiz', parameters)
            return res.Data[0]
        } catch (err) {
            return thunkAPI.rejectWithValue(err.message)
        }
    }
)

export const fetchQuizQuestions = createAsyncThunk(
    'quizzes/fetchQuizQuestions',
    async (parameters, thunkAPI) => {
        try {
            const res = await SP_fetch('GetQuizQuestions', parameters)
            return res.Data
        } catch (err) {
            return thunkAPI.rejectWithValue(err.message)
        }
    }
)

export const sendQuize = createAsyncThunk(
    'quizzes/sendQuize',
    async (parameters, thunkAPI) => {
        try {
            const res = await SP_fetch('SubmitQuizAttempt', parameters)
            return res.Data
        } catch (err) {
            return thunkAPI.rejectWithValue(err.message)
        }
    }
)

