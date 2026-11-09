import { createAsyncThunk } from "@reduxjs/toolkit";
import { SP_fetch } from "../../../api/utils/api";

export const fetchUserDashboardStats = createAsyncThunk(
    'dashboard/fetchUserDashboardStats',
    async (parameters, thunkAPI) => {
        try {
            const res = await SP_fetch('GetUserDashboardStats', parameters)
            return res.Data[0]
        } catch (err) {
            return thunkAPI.rejectWithValue(err.message)
        }
    }
)
export const fetchUserStudyStats = createAsyncThunk(
    'dashboard/fetchUserStudyStats',
    async (parameters, thunkAPI) => {
        try {
            const res = await SP_fetch('GetUserStudyStats', parameters)
            return res.Data
        } catch (err) {
            return thunkAPI.rejectWithValue(err.message)
        }
    }
)