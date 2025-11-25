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

export const getAllReview = createAsyncThunk(
    'user/getAllReview',
    async (_, { dispatch, rejectWithValue }) => {
        try {
            const response = await axios.get(`${BASE_URL}/reviews`);
            return response.data.data;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

const reviewsSlice = createSlice({
    name: 'reviews',
    initialState: {
        reviews: [],
        message: '',
        loading: false,
        isError: false,
    },
    extraReducers: (builder) => {
        builder
            .addCase(getAllReview.pending, (state) => {
                state.loading = true;
                state.message = 'Fetching reviews...';
                state.isError = false;
            })
            .addCase(getAllReview.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = 'Reviews fetched successfully';
                state.reviews = action.payload;
                state.isError = false;
            })
            .addCase(getAllReview.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.isError = true;
                state.message = action.payload?.message || 'Failed to fetch reviews';
            })
    },
});

export default reviewsSlice.reducer;