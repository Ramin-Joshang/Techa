import { createAsyncThunk } from "@reduxjs/toolkit";
import { SP_fetch } from "../../../api/utils/api";

export const fetchUserTickets = createAsyncThunk(
    'ticket/fetchUserTickets',
    async (parameters, thunkAPI) => {
        try {
            const res = await SP_fetch('GetUserTickets', parameters)
            return res.Data
        } catch (err) {
            return thunkAPI.rejectWithValue(err.message)
        }
    }
)
export const fetchUserTicketsDashboard = createAsyncThunk(
    'ticket/fetchUserTicketsDashboard',
    async (parameters, thunkAPI) => {
        try {
            const res = await SP_fetch('GetUserTicketsDashboard', parameters)
            return res.Data[0]
        } catch (err) {
            return thunkAPI.rejectWithValue(err.message)
        }
    }
)

export const fetchUserTicketById = createAsyncThunk(
    'ticket/fetchUserTicketById',
    async (parameters, thunkAPI) => {
        try {
            const res = await SP_fetch('GetTicketDetails', parameters)
            return res.Data[0]
        } catch (err) {
            return thunkAPI.rejectWithValue(err.message)
        }
    }
)
export const addTicketReply = createAsyncThunk(
    'ticket/addTicketReply',
    async (parameters, thunkAPI) => {
        try {
            const res = await SP_fetch('AddTicketReply', parameters)
            return res.Data
        } catch (err) {
            return thunkAPI.rejectWithValue(err.message)
        }
    }
)
export const addTicket = createAsyncThunk(
    'ticket/addTicket',
    async (parameters, thunkAPI) => {
        try {
            const res = await SP_fetch('CreateTicket', parameters)
            return res.Data
        } catch (err) {
            return thunkAPI.rejectWithValue(err.message)
        }
    }
)