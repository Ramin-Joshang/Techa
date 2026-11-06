import { createSlice } from "@reduxjs/toolkit";
import { subscribeNewsletter } from "./newsletterActions";

const initialState = {
    loading: false,
    error: null,
    successMessage: null,
};

const newsletterSlice = createSlice({
    name: "newsletter",
    initialState,
    reducers: {
        clearNewsletterState: (state) => {
            state.loading = false;
            state.error = null;
            state.successMessage = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(subscribeNewsletter.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.successMessage = null;
            })
            .addCase(subscribeNewsletter.fulfilled, (state, action) => {
                state.loading = false;
                state.successMessage = action.payload;
            })
            .addCase(subscribeNewsletter.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "خطای نامشخص";
            });
    },
});

export const { clearNewsletterState } = newsletterSlice.actions;
export default newsletterSlice.reducer;
