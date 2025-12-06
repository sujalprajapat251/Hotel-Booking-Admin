import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
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

export const getAllRestaurantOrder = createAsyncThunk(
    'order/getAllRestaurantOrder',
    async (_, { dispatch, rejectWithValue }) => {
        try {
            const token = await localStorage.getItem("token");
            const response = await axios.get(`${BASE_URL}/getallrestaurantorderbyadmin`, {
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

export const getAllBarOrder = createAsyncThunk(
    'order/getAllBarOrder',
    async (_, { dispatch, rejectWithValue }) => {
        try {
            const token = await localStorage.getItem("token");
            const response = await axios.get(`${BASE_URL}/getallbarorderbyadmin`, {
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

export const getAllCafeOrder = createAsyncThunk(
    'order/getAllCafeOrder',
    async (_, { dispatch, rejectWithValue }) => {
        try {
            const token = await localStorage.getItem("token");
            const response = await axios.get(`${BASE_URL}/getallcafeorderbyadmin`, {
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

const viewOrderSlice = createSlice({
    name: 'order',
    initialState: {
        restaurantOrder: [],
        barOrder: [],
        cafeListOrder: [],
        message: '',
        loading: false,
        isError: false,
    },
    extraReducers: (builder) => {
        builder
            .addCase(getAllRestaurantOrder.pending, (state) => {
                state.loading = true;
                state.message = 'Fetching Restaurant Order...';
                state.isError = false;
            })
            .addCase(getAllRestaurantOrder.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = 'Restaurant Order fetched successfully';
                state.restaurantOrder = action.payload;
                state.isError = false;
            })
            .addCase(getAllRestaurantOrder.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.isError = true;
                state.message = action.payload?.message || 'Failed to fetch Restaurant Order';
            })

            .addCase(getAllBarOrder.pending, (state) => {
                state.loading = true;
                state.message = 'Fetching Bar Order...';
                state.isError = false;
            })
            .addCase(getAllBarOrder.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = 'Bar Order fetched successfully';
                state.barOrder = action.payload;
                state.isError = false;
            })
            .addCase(getAllBarOrder.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.isError = true;
                state.message = action.payload?.message || 'Failed to fetch Bar Order';
            })

            .addCase(getAllCafeOrder.pending, (state) => {
                state.loading = true;
                state.message = 'Fetching Cafe Order...';
                state.isError = false;
            })
            .addCase(getAllCafeOrder.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = 'Cafe Order fetched successfully';
                state.cafeListOrder = action.payload;
                state.isError = false;
            })
            .addCase(getAllCafeOrder.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.isError = true;
                state.message = action.payload?.message || 'Failed to fetch Cafe Order';
            })
    },
});

export default viewOrderSlice.reducer;