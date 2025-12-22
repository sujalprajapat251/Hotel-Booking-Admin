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
            const response = await axios.get(`${BASE_URL}/getCafeOrderitems`,
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
    'chef/updateCafeItemStatus',
    async (data, { dispatch, rejectWithValue }) => {
        try {
            const token = await localStorage.getItem("token");
            const response = await axios.post(`${BASE_URL}/CafeItemStatus`,{
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

// Reject item status
export const rejectCafeItemStatus = createAsyncThunk(
    'chef/rejectCafeItemStatus',
    async (data, { dispatch, rejectWithValue }) => {
        try {
            const token = await localStorage.getItem("token");
            const response = await axios.post(`${BASE_URL}/CafeItemStatus`,{
                orderId : data?.orderId,
                itemId : data?.itemId,
                status: 'Reject by chef'
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
        preparingOrder: null,
    },
    reducers: {
        setPreparingOrder: (state, action) => {
            state.preparingOrder = action.payload;
        },
        clearPreparingOrder: (state) => {
            state.preparingOrder = null;
        }
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
            .addCase(updateCafeItemStatus.fulfilled, (state, action) => {
                const updatedOrder = action.payload;

                state.orderData = state.orderData.map(item => {
                    if (item.orderId === updatedOrder._id) {
                        const updatedItem = updatedOrder.items.find(updatedItem => updatedItem._id === item._id);
                        if (updatedItem) {
                            return {
                                ...item,
                                ...updatedItem,
                                status: updatedItem.status
                            };
                        }
                    }
                    return item;
                });

                const updatedItem = updatedOrder.items.find(item => 
                    state.preparingOrder && item._id === state.preparingOrder._id
                );
                
                if (updatedItem) {
                    if (updatedItem.status === 'Preparing') {
                        state.preparingOrder = updatedItem;
                    } else if (updatedItem.status === 'Done') {
                        state.preparingOrder = null;
                    }
                }
            })
            .addCase(updateCafeItemStatus.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.isError = true;
                state.message = action.payload?.message || 'Failed to update order status';
            })
            // Handle rejected cafe item status
            .addCase(rejectCafeItemStatus.fulfilled, (state, action) => {
                const updatedOrder = action.payload;
                state.orderData = state.orderData.map(item => {
                    if (item.orderId === updatedOrder._id) {
                        const updatedItem = updatedOrder.items.find(updatedItem => updatedItem._id === item._id);
                        if (updatedItem) {
                            return {
                                ...item,
                                ...updatedItem,
                                status: updatedItem.status
                            };
                        }
                    }
                    return item;
                });
            })
            .addCase(rejectCafeItemStatus.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.isError = true;
                state.message = action.payload?.message || 'Failed to reject order';
            });
    },
});

export const { setPreparingOrder, clearPreparingOrder } = chefSlice.actions;
export default chefSlice.reducer;
