import { createAsyncThunk } from '@reduxjs/toolkit'
import { SP_fetch } from "../../../api/utils/api";

export const fetchReviews = createAsyncThunk(
    'reviews/fetchReviews',
    async (parameters, thunkAPI) => {
        try {
            const res = await SP_fetch('GetDocReviews', parameters)
            return res.Data
        } catch (err) {
            return thunkAPI.rejectWithValue(err.message)
        }
    }
)

export const AddReview = createAsyncThunk(
    'reviews/AddReview',
    async (parameters, thunkAPI) => {
        try {
            const res = await SP_fetch('AddDocReview', parameters)
            return res.Data
        } catch (err) {
            return thunkAPI.rejectWithValue(err.message)
        }
    }
)
