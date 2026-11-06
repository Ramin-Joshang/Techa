import { createAsyncThunk } from "@reduxjs/toolkit";
import { SP_fetch } from "../../../api/utils/api";

export const fetchPackages = createAsyncThunk(
    'packages/fetchPackages',
    async (parameters, thunkAPI) => {
        try {
            const res = await SP_fetch('Packages_List', parameters)
            return res.Data
        } catch (err) {
            return thunkAPI.rejectWithValue(err.message)
        }
    }
)

export const fetchPackageBySlug = createAsyncThunk(
    'packages/fetchPackageBySlug',
    async (parameters, thunkAPI) => {
        try {
            const res = await SP_fetch('GetPackage', parameters)
            console.log(res.Data[0]['Package'])
            return res.Data[0]['Package']
        } catch (err) {
            return thunkAPI.rejectWithValue(err.message)
        }
    }
)