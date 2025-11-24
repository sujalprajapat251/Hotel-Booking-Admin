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

export const getCafeOrderStatus = createAsyncThunk(
    'chef/getCafeOrderStatus',
    async (status, { dispatch, rejectWithValue }) => {
        try {
            const token = await localStorage.getItem("token");
            const response = await axios.get(`${BASE_URL}/getCafeOrderitems/${status}`,
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

export const updateCafeItemStatus = createAsyncThunk(
    'chef/getCafeOrderStatus',
    async (data, { dispatch, rejectWithValue }) => {
        try {
            const token = await localStorage.getItem("token");
            const response = await axios.get(`${BASE_URL}/CafeItemStatus`,{
                orderId : data?.orderId,
                itemId : data?.itemId
            },
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

// get current login user details


const chefSlice = createSlice({
    name: 'chef',
    initialState: {
        orderData: [],
        currentUser: null,
        message: '',
        loading: false,
        isError: false,
    },
    extraReducers: (builder) => {
        builder
            .addCase(getCafeOrderStatus.pending, (state) => {
                state.loading = true;
                state.message = 'Fetching User...';
                state.isError = false;
            })
            .addCase(getCafeOrderStatus.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.orderData = action.payload;
                state.message = 'user fetched successfully';
                state.users = action.payload;
                state.isError = false;
            })
            .addCase(getCafeOrderStatus.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.isError = true;
                state.message = action.payload?.message || 'Failed to fetch user';
            })
    },
});

export default chefSlice.reducer;
