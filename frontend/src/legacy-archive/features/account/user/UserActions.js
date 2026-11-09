import { createAsyncThunk } from "@reduxjs/toolkit";
import { SP_fetch } from "../../../api/utils/api";

export const fetchUserById = createAsyncThunk(
    'docs/fetchUserById',
    async (parameters, thunkAPI) => {
        try {
            const res = await SP_fetch('GetUserProfile', parameters)
            return res.Data[0]
        } catch (err) {
            return thunkAPI.rejectWithValue(err.message)
        }
    }
)
export const updateUser = createAsyncThunk(
    'docs/updateUser',
    async (parameters, thunkAPI) => {
        try {
            const res = await SP_fetch('UpdateUserProfile', parameters)

        } catch (err) {
            return thunkAPI.rejectWithValue(err.message)
        }
    }
)
export const updateUserSocialMedia = createAsyncThunk(
    'docs/updateUserSocialMedia',
    async (parameters, thunkAPI) => {
        try {
            const res = await SP_fetch('Update_UserSocialNetworks', parameters)

        } catch (err) {
            return thunkAPI.rejectWithValue(err.message)
        }
    }
)