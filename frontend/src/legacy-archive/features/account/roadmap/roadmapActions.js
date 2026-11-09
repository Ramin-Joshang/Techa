import { createAsyncThunk } from "@reduxjs/toolkit";
import { SP_fetch } from "../../../api/utils/api";

export const fetchUserRoadmap = createAsyncThunk(
    'roadmap/fetchUserRoadmap',
    async (parameters, thunkAPI) => {
        try {
            const res = await SP_fetch('GetUserRoadmapProgress', parameters)
            return res.Data
        } catch (err) {
            return thunkAPI.rejectWithValue(err.message)
        }
    }
)