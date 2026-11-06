import { createAsyncThunk } from "@reduxjs/toolkit";
import { SP_fetch } from "../../../api/utils/api";

export const fetchUserCourses = createAsyncThunk(
    'docs/fetchUserCourses',
    async (parameters, thunkAPI) => {
        try {
            const res = await SP_fetch('sp_GetUserCourses', parameters)
            return res.Data
        } catch (err) {
            return thunkAPI.rejectWithValue(err.message)
        }
    }
)
export const fetchUserCoursesDashboard = createAsyncThunk(
    'docs/fetchUserCoursesDashboard',
    async (parameters, thunkAPI) => {
        try {
            const res = await SP_fetch('sp_GetUserCoursesDashboard', parameters)
            return res.Data[0]
        } catch (err) {
            return thunkAPI.rejectWithValue(err.message)
        }
    }
)
