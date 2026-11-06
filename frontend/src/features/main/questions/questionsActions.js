import { createAsyncThunk } from '@reduxjs/toolkit'
import { SP_fetch } from "../../../api/utils/api";

export const fetchQuestions = createAsyncThunk(
    'questions/fetchQuestions',
    async (parameters, thunkAPI) => {
        try {
            const res = await SP_fetch('GetQuestions', parameters)
            return res.Data
        } catch (err) {
            return thunkAPI.rejectWithValue(err.message)
        }
    }
)

export const fetchAllQuestions = createAsyncThunk(
    'questions/fetchAllQuestions',
    async (parameters, thunkAPI) => {
        try {
            const res = await SP_fetch('GetAllQuestions', parameters)
            return res.Data
        } catch (err) {
            return thunkAPI.rejectWithValue(err.message)
        }
    }
)

export const fetchLatestQuestions = createAsyncThunk(
    'questions/fetchLatestQuestions',
    async (parameters, thunkAPI) => {
        try {
            const res = await SP_fetch('GetLatestQuestions', parameters)
            return res.Data
        } catch (err) {
            return thunkAPI.rejectWithValue(err.message)
        }
    }
)

export const fetchQuestionDetails = createAsyncThunk(
    'questions/fetchQuestionDetails',
    async (parameters, thunkAPI) => {
        try {
            const res = await SP_fetch('GetQuestionDetails', parameters)
            return res.Data[0]
        } catch (err) {
            return thunkAPI.rejectWithValue(err.message)
        }
    }
)

export const addQuestion = createAsyncThunk(
    'questions/AddQuestion',
    async (parameters, thunkAPI) => {
        try {
            const res = await SP_fetch('AddQuestion', parameters)
            return res.Data
        } catch (err) {
            return thunkAPI.rejectWithValue(err.message)
        }
    }
)

export const addAnswer = createAsyncThunk(
    'questions/AddAnswer',
    async (parameters, thunkAPI) => {
        try {
            const res = await SP_fetch('AddAnswer', parameters)
            return res.Data
        } catch (err) {
            return thunkAPI.rejectWithValue(err.message)
        }
    }
)

