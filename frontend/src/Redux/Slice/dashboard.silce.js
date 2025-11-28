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


const dashboardSlice = createSlice({
    name: 'dashboardData',
    initialState: {
        getRevenue: [],
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
    },
});

export default dashboardSlice.reducer;
