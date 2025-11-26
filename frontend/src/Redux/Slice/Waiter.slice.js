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

export const addCafeOrder = createAsyncThunk(
    'user/addCafeOrder',
    async (values, { dispatch, rejectWithValue }) => {
        try {
            const token = await localStorage.getItem("token");
            const response = await axios.post(`${BASE_URL}/addCafeOrder`, {
                ...values
            },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                }
            );
            return response.data.users;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

export const addItemToTableOrder = createAsyncThunk(
    'waiter/addItemToTableOrder',
    async ({ tableId, product, qty, description, name, contact }, { dispatch, rejectWithValue }) => {
        try {
            const token = await localStorage.getItem("token");
            const response = await axios.post(
                `${BASE_URL}/cafe/tables/${tableId}/order/items`,
                { product, qty, description, name, contact },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                }
            );
            return response.data?.data;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

export const removeItemFromOrder = createAsyncThunk(
    'waiter/removeItemFromOrder',
    async ({ orderId, itemId }, { dispatch, rejectWithValue }) => {
        try {
            const token = await localStorage.getItem("token");
            const response = await axios.delete(
                `${BASE_URL}/cafe/orders/${orderId}/items/${itemId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                }
            );
            dispatch(setAlert({ text: response.data.message || 'Item removed', color: 'success' }));
            return response.data?.data;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

// get current login user details


const waiterSlice = createSlice({
    name: 'waiter',
    initialState: {
        users: [],
        currentUser: null,
        message: '',
        loading: false,
        isError: false,
    },
    extraReducers: (builder) => {
        builder
            // .addCase(addCafeOrder.pending, (state) => {
            //     state.loading = true;
            //     state.message = 'Fetching User...';
            //     state.isError = false;
            // })
            // .addCase(addCafeOrder.fulfilled, (state, action) => {
            //     state.loading = false;
            //     state.success = true;
            //     state.message = 'user fetched successfully';
            //     state.users = action.payload;
            //     state.isError = false;
            // })
            // .addCase(addCafeOrder.rejected, (state, action) => {
            //     state.loading = false;
            //     state.success = false;
            //     state.isError = true;
            //     state.message = action.payload?.message || 'Failed to fetch user';
            // })
            .addCase(addItemToTableOrder.pending, (state) => {
                state.loading = true;
                state.message = 'Adding item to order...';
                state.isError = false;
            })
            .addCase(addItemToTableOrder.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = 'Item added to order';
                state.isError = false;
            })
            .addCase(addItemToTableOrder.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.isError = true;
                state.message = action.payload?.message || 'Failed to add item';
            })
            .addCase(removeItemFromOrder.pending, (state) => {
                state.loading = true;
                state.message = 'Removing item from order...';
                state.isError = false;
            })
            .addCase(removeItemFromOrder.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = 'Item removed from order';
                state.isError = false;
            })
            .addCase(removeItemFromOrder.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.isError = true;
                state.message = action.payload?.message || 'Failed to remove item';
            })


    },
});

export default waiterSlice.reducer;
