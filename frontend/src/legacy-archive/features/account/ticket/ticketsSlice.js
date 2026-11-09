import { createSlice } from '@reduxjs/toolkit'
import { addTicket, addTicketReply, fetchUserTicketById, fetchUserTickets, fetchUserTicketsDashboard } from './ticketsActions'

const initialState = {
    summary: null,
    tickets: [],
    singleTicket: null,
    loading: false,
    error: null,
}

const ticketsSlice = createSlice({
    name: 'tickets',
    initialState,
    reducers: {},
    extraReducers: builder => {
        builder
            .addCase(fetchUserTickets.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchUserTickets.fulfilled, (state, action) => {
                state.loading = false
                state.tickets = action.payload
            })
            .addCase(fetchUserTickets.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            .addCase(fetchUserTicketsDashboard.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchUserTicketsDashboard.fulfilled, (state, action) => {
                state.loading = false
                state.summary = action.payload
            })
            .addCase(fetchUserTicketsDashboard.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            .addCase(fetchUserTicketById.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchUserTicketById.fulfilled, (state, action) => {
                state.loading = false
                state.singleTicket = action.payload
            })
            .addCase(fetchUserTicketById.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            .addCase(addTicketReply.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(addTicketReply.fulfilled, (state, action) => {
                state.loading = false
            })
            .addCase(addTicketReply.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            .addCase(addTicket.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(addTicket.fulfilled, (state, action) => {
                state.loading = false
            })
            .addCase(addTicket.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
    },
})

export default ticketsSlice.reducer
