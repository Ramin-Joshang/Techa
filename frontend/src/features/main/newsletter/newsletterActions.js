import { createAsyncThunk } from "@reduxjs/toolkit";
import { SP_fetch } from "../../../api/utils/api";

export const subscribeNewsletter = createAsyncThunk(
    "newsletter/subscribeNewsletter",
    async (parameters, { rejectWithValue }) => {
        try {
            const response = await SP_fetch("Save_NewsletterSubscriber", parameters);
            if (response.IsSuccess) {
                return response.Message;
            } else {
                return rejectWithValue(response.Message);
            }
        } catch (err) {
            return rejectWithValue(err.message || "خطا در ارتباط با سرور");
        }
    }
); 