import { createAsyncThunk } from "@reduxjs/toolkit";
import { SP_fetch } from "../../../api/utils/api";

export const fetchBlogs = createAsyncThunk(
    'blogs/fetchBlogs',
    async (parameters, thunkAPI) => {
        try {
            const res = await SP_fetch('Blog_List', parameters)
            return res.Data
        } catch (err) {
            return thunkAPI.rejectWithValue(err.message)
        }
    }
)