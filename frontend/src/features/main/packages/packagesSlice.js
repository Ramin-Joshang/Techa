// src/features/packages/packagesSlice.js

import { createSlice } from '@reduxjs/toolkit'
import { fetchPackageBySlug, fetchPackages } from './packagesActions'

const initialState = {
    packages: [],
    singlePackage: null,
    loading: false,
    error: null,
}


const packagesSlice = createSlice({
    name: 'packages',
    initialState,
    reducers: {},
    extraReducers: builder => {
        builder
            .addCase(fetchPackages.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchPackages.fulfilled, (state, action) => {
                state.loading = false
                state.packages = action.payload
            })
            .addCase(fetchPackages.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            .addCase(fetchPackageBySlug.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchPackageBySlug.fulfilled, (state, action) => {
                state.loading = false
                state.singlePackage = JSON.parse(action.payload)
            })
            .addCase(fetchPackageBySlug.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })

    },
})

export default packagesSlice.reducer
