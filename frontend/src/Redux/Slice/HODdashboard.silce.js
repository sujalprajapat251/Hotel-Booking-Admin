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

export const getAllHodDashboard = createAsyncThunk(
    'revenue/getHoddashboard',
    async (getCurrentYearMonth, { dispatch, rejectWithValue }) => {

        try {
            const token = await localStorage.getItem("token");
            const response = await axios.get(`${BASE_URL}/gethoddashboard?month=${getCurrentYearMonth}`,
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

export const getAllPaymentMethod = createAsyncThunk(
    'revenue/getAllPaymentMethod',
    async (month, { dispatch, rejectWithValue }) => {

        try {
            const token = await localStorage.getItem("token");
            const query = month ? `?month=${month}` : '';
            const response = await axios.get(`${BASE_URL}/getdepartmentpaymentsummary${query}`,
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

export const getAllMonthlyRevenue = createAsyncThunk(
    'revenue/getMonthlyRevenue',
    async (getCurrentYear, { dispatch, rejectWithValue }) => {

        try {
            const token = await localStorage.getItem("token");
            const response = await axios.get(`${BASE_URL}/getdepartmentrevenuebymonth?year=${getCurrentYear}`,
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


const dashboardSlice = createSlice({
    name: 'HodDashboardData',
    initialState: {
        getHodDashboard: [],
        getPaymentMethod: [],
        getMonthlyRevenue: [],
        message: '',
        loading: false,
        isError: false,
    },
    extraReducers: (builder) => {
        builder
            .addCase(getAllHodDashboard.pending, (state) => {
                state.loading = true;
                state.message = 'Fetching HOD Dashboard Data...';
                state.isError = false;
            })
            .addCase(getAllHodDashboard.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = 'HOD Dashboard Data fetched successfully';
                state.getHodDashboard = action.payload;
                state.isError = false;
            })
            .addCase(getAllHodDashboard.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.isError = true;
                state.message = action.payload?.message || 'Failed to fetch HOD Dashboard Data';
            })

            .addCase(getAllPaymentMethod.pending, (state) => {
                state.loading = true;
                state.message = 'Fetching Payment Method...';
                state.isError = false;
            })
            .addCase(getAllPaymentMethod.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = 'Payment Method fetched successfully';
                state.getPaymentMethod = action.payload;
                state.isError = false;
            })
            .addCase(getAllPaymentMethod.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.isError = true;
                state.message = action.payload?.message || 'Failed to fetch Payment Method';
            })

            .addCase(getAllMonthlyRevenue.pending, (state) => {
                state.loading = true;
                state.message = 'Fetching Monthly Revenue...';
                state.isError = false;
            })
            .addCase(getAllMonthlyRevenue.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = 'Monthly Revenue fetched successfully';
                state.getMonthlyRevenue = action.payload;
                state.isError = false;
            })
            .addCase(getAllMonthlyRevenue.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.isError = true;
                state.message = action.payload?.message || 'Failed to fetch Monthly Revenue';
            })            
    },
});

export default dashboardSlice.reducer;
