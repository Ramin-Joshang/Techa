import { createAsyncThunk } from "@reduxjs/toolkit";
import { SP_fetch } from "../../../api/utils/api";

export const fetchDocs = createAsyncThunk(
    'docs/fetchDocs',
    async (parameters, thunkAPI) => {
        try {
            const res = await SP_fetch('Courses_List', parameters)
            return res.Data
        } catch (err) {
            return thunkAPI.rejectWithValue(err.message)
        }
    }
)

export const fetchDocById = createAsyncThunk(
    'docs/fetchDocById',
    async (parameters, thunkAPI) => {
        try {
            const res = await SP_fetch('Course_Details', parameters)
            return res.Data[0]
        } catch (err) {
            return thunkAPI.rejectWithValue(err.message)
        }
    }
)