import { createSlice, createAsyncThunk, current } from '@reduxjs/toolkit';
import axios from 'axios';
import { BASE_URL } from '../../Utils/baseUrl';
import { setAlert } from './alert.slice';

const handleErrors = (error, dispatch, rejectWithValue) => {
    const errorMessage = error.response?.data?.message || 'An error occurred';
    if (dispatch) {
        dispatch(setAlert({ text: errorMessage, color: 'error' }));
    }
    return rejectWithValue(error.response?.data || { message: errorMessage });
};

export const getAllRevenue = createAsyncThunk(
    'revenue/getAllRevenue',
    async (getCurrentYearMonth, { dispatch, rejectWithValue }) => {

        try {
            const token = await localStorage.getItem("token");
            const response = await axios.get(`${BASE_URL}/getrevenue?month=${getCurrentYearMonth}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                }
            );

            return response.data.data;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

export const getAllDashboard = createAsyncThunk(
    'revenue/getdashboard',
    async (getCurrentYearMonth, { dispatch, rejectWithValue }) => {

        try {
            const token = await localStorage.getItem("token");
            const response = await axios.get(`${BASE_URL}/getdashboard?month=${getCurrentYearMonth}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                }
            );

            return response.data;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

export const getAllRoomAvailability = createAsyncThunk(
    'revenue/getAllRoomAvailability',
    async (_, { dispatch, rejectWithValue }) => {

        try {
            const token = await localStorage.getItem("token");
            const response = await axios.get(`${BASE_URL}/roomavailability`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                }
            );

            return response.data.data;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

export const getAllReservation = createAsyncThunk(
    'revenue/getreservation',
    async (getCurrentYearMonth, { dispatch, rejectWithValue }) => {

        try {
            const token = await localStorage.getItem("token");
            const response = await axios.get(`${BASE_URL}/getreservation?month=${getCurrentYearMonth}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                }
            );

            return response.data.data;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

const dashboardSlice = createSlice({
    name: 'dashboardData',
    initialState: {
        getRevenue: [],
        getDashboard: [],
        getRoomAvailability: [],
        getReservation: [],
        message: '',
        loading: false,
        isError: false,
    },
    extraReducers: (builder) => {
        builder
            .addCase(getAllRevenue.pending, (state) => {
                state.loading = true;
                state.message = 'Fetching Dashboard Revenue...';
                state.isError = false;
            })
            .addCase(getAllRevenue.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = 'Dashboard Revenue fetched successfully';
                state.getRevenue = action.payload;
                state.isError = false;
            })
            .addCase(getAllRevenue.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.isError = true;
                state.message = action.payload?.message || 'Failed to fetch Dashboard Revenue';
            })

            .addCase(getAllDashboard.pending, (state) => {
                state.loading = true;
                state.message = 'Fetching Dashboard Data...';
                state.isError = false;
            })
            .addCase(getAllDashboard.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = 'Dashboard Data fetched successfully';
                state.getDashboard = action.payload;
                state.isError = false;
            })
            .addCase(getAllDashboard.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.isError = true;
                state.message = action.payload?.message || 'Failed to fetch Dashboard Data';
            })

            .addCase(getAllRoomAvailability.pending, (state) => {
                state.loading = true;
                state.message = 'Fetching Room Availability...';
                state.isError = false;
            })
            .addCase(getAllRoomAvailability.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = 'Room Availability fetched successfully';
                state.getRoomAvailability = action.payload;
                state.isError = false;
            })
            .addCase(getAllRoomAvailability.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.isError = true;
                state.message = action.payload?.message || 'Failed to fetch Room Availability';
            })

            .addCase(getAllReservation.pending, (state) => {
                state.loading = true;
                state.message = 'Fetching Reservation...';
                state.isError = false;
            })
            .addCase(getAllReservation.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = 'Reservation fetched successfully';
                state.getReservation = action.payload;
                state.isError = false;
            })
            .addCase(getAllReservation.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.isError = true;
                state.message = action.payload?.message || 'Failed to fetch Reservation';
            })
    },
});

export default dashboardSlice.reducer;
