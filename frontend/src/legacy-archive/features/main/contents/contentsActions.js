import { createAsyncThunk } from '@reduxjs/toolkit'
import { SP_fetch } from "../../../api/utils/api";


export const fetchContents = createAsyncThunk(
    'docs/fetchContents',
    async (parameters, thunkAPI) => {
        try {
            const res = await SP_fetch('Contents_List', parameters)
            return res.Data
        } catch (err) {
            return thunkAPI.rejectWithValue(err.message)
        }
    }
)

export const fetchContentById = createAsyncThunk(
    'docs/fetchContentById',
    async (parameters, thunkAPI) => {
        const res = await SP_fetch('Contents_Details', parameters);

        if (!res.IsSuccess) {
            return thunkAPI.rejectWithValue(res.Message);
        }

        return res.Data[0];
    }
)
export const completeContent = createAsyncThunk(
    'docs/completeContent',
    async (parameters, thunkAPI) => {
        const res = await SP_fetch('MarkContentCompleted', parameters);

        if (!res.IsSuccess) {
            return thunkAPI.rejectWithValue(res.Message);
        }

        return res.Data[0];
    }
)


