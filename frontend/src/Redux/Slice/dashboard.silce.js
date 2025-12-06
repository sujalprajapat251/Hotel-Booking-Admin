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

export const getAllOrdersummery = createAsyncThunk(
    'revenue/getAllOrdersummery',
    async (getCurrentYearMonth, { dispatch, rejectWithValue }) => {

        try {
            const token = await localStorage.getItem("token");
            const query = getCurrentYearMonth ? `?month=${getCurrentYearMonth}` : '';
            const response = await axios.get(`${BASE_URL}/getordersummery${query}`,
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

export const getAllBookingtrends = createAsyncThunk(
    'revenue/getBookingtrends',
    async (filter, { dispatch, rejectWithValue }) => {

        try {
            const token = await localStorage.getItem("token");
            let query = '';
            if (filter && (filter === '7' || filter === '30' || filter === 'year')) {
                query = `range=${filter}`;
            } else if (filter) {
                // Assume it's a month string YYYY-MM
                query = `month=${filter}`;
            } else {
                query = `range=7`; // Default
            }

            const response = await axios.get(`${BASE_URL}/getbookingtrends?${query}`,
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

export const getAllOccupancyrate = createAsyncThunk(
    'revenue/getOccupancyrate',
    async (filter, { dispatch, rejectWithValue }) => {

        try {
            const token = await localStorage.getItem("token");
            let query = '';
            // Check if filter is in YYYY-MM format
            if (filter && /^\d{4}-\d{2}$/.test(filter)) {
                query = `month=${filter}`;
            } else {
                // Assume it's a year or default to current year
                query = `year=${filter || new Date().getFullYear()}`;
            }
            
            const response = await axios.get(`${BASE_URL}/getoccupancyrate?${query}`,
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

export const getAllServicerequests = createAsyncThunk(
    'revenue/getAllServicerequests',
    async (_, { dispatch, rejectWithValue }) => {

        try {
            const token = await localStorage.getItem("token");
            const response = await axios.get(`${BASE_URL}/servicerequests`,
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
    name: 'dashboardData',
    initialState: {
        getRevenue: [],
        getDashboard: [],
        getRoomAvailability: [],
        getReservation: [],
        getOrdersummery: [],
        getBookingtrends: [],
        getOccupancyrate: [],
        getServicerequests: [],
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

            .addCase(getAllOrdersummery.pending, (state) => {
                state.loading = true;
                state.message = 'Fetching Order Summery...';
                state.isError = false;
            })
            .addCase(getAllOrdersummery.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = 'Order Summery fetched successfully';
                state.getOrdersummery = action.payload;
                state.isError = false;
            })
            .addCase(getAllOrdersummery.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.isError = true;
                state.message = action.payload?.message || 'Failed to fetch Order Summery';
            })

            .addCase(getAllBookingtrends.pending, (state) => {
                state.loading = true;
                state.message = 'Fetching Booking Trends...';
                state.isError = false;
            })
            .addCase(getAllBookingtrends.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = 'Booking Trends fetched successfully';
                state.getBookingtrends = action.payload;
                state.isError = false;
            })
            .addCase(getAllBookingtrends.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.isError = true;
                state.message = action.payload?.message || 'Failed to fetch Booking Trends';
            })

            .addCase(getAllOccupancyrate.pending, (state) => {
                state.loading = true;
                state.message = 'Fetching Occupancy Rate...';
                state.isError = false;
            })
            .addCase(getAllOccupancyrate.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = 'Occupancy Rate fetched successfully';
                state.getOccupancyrate = action.payload;
                state.isError = false;
            })
            .addCase(getAllOccupancyrate.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.isError = true;
                state.message = action.payload?.message || 'Failed to fetch Occupancy Rate';
            })

            .addCase(getAllServicerequests.pending, (state) => {
                state.loading = true;
                state.message = 'Fetching Service Requests...';
                state.isError = false;
            })
            .addCase(getAllServicerequests.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = 'Service Requests fetched successfully';
                state.getServicerequests = action.payload;
                state.isError = false;
            })
            .addCase(getAllServicerequests.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.isError = true;
                state.message = action.payload?.message || 'Failed to fetch Service Requests';
            })
    },
});

export default dashboardSlice.reducer;
