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

export const getAllCafeUnpaid = createAsyncThunk(
    'accountant/getAllCafeUnpaid',
    async (_, { dispatch, rejectWithValue }) => {
        try {
            const token = await localStorage.getItem("token");
            const response = await axios.get(`${BASE_URL}/cafeUnpaidOrder`,
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
    'accountant/updateCafeItemStatus',
    async (data, { dispatch, rejectWithValue }) => {
        try {
            const token = await localStorage.getItem('token');
            const response = await axios.post(
                `${BASE_URL}/CafeItemStatus`,
                { orderId: data.orderId, itemId: data.itemId },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            return response.data.data;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

export const updateCafePayment = createAsyncThunk(
    'accountant/updateCafePayment',
    async (data, { dispatch, rejectWithValue }) => {
        try {
            const token = await localStorage.getItem("token");
            const orderId = data?.orderId;
            const paymentMethod = (data?.paymentMethod || 'cash').toString().toLowerCase();
            if (!orderId) {
                return rejectWithValue({ message: 'orderId is required' });
            }

            const allowed = ['upi', 'card', 'cash'];
            if (!allowed.includes(paymentMethod)) {
                return rejectWithValue({ message: `paymentMethod must be one of: ${allowed.join(', ')}` });
            }
            // ensure backend route and casing match: '/cafePayment/:orderId'
            const response = await axios.post(
                `${BASE_URL}/cafePayment/${orderId}`,
                { paymentMethod },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                }
            );
            dispatch(setAlert({ text: response.data.message || 'Payment completed successfully', color: 'success' }));
            return response.data.data;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

const accountantSlice = createSlice({
    name: 'accountant',
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
            .addCase(getAllCafeUnpaid.pending, (state) => {
                state.loading = true;
                state.message = 'Fetching unpaid cafe orders...';
                state.isError = false;
            })
            .addCase(getAllCafeUnpaid.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.orderData = action.payload;
                state.message = 'Unpaid orders fetched successfully';
                state.isError = false;

                // If there's at least one item with status Preparing, set preparingOrder
                if (!state.preparingOrder && action.payload) {
                    const preparingItem = action.payload.find(order =>
                        order.items && order.items.some(i => i.status === 'Preparing')
                    );
                    if (preparingItem) {
                        // find the actual item
                        const item = preparingItem.items.find(i => i.status === 'Preparing');
                        state.preparingOrder = item || null;
                    }
                }
            })
            .addCase(getAllCafeUnpaid.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.isError = true;
                state.message = action.payload?.message || 'Failed to fetch unpaid orders';
            })
            .addCase(updateCafePayment.pending, (state) => {
                state.loading = true;
                state.message = 'Processing payment...';
                state.isError = false;
            })
            .addCase(updateCafePayment.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                const updatedOrder = action.payload;

                // Remove paid order from unpaid list (if present)
                if (updatedOrder && updatedOrder._id) {
                    state.orderData = state.orderData.filter(o => o._id !== updatedOrder._id);
                }

                state.message = 'Payment completed successfully';
            })
            .addCase(updateCafePayment.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.isError = true;
                state.message = action.payload?.message || 'Failed to complete payment';
            });
            
            builder
            .addCase(updateCafeItemStatus.pending, (state) => {
                state.loading = true;
                state.message = 'Updating item status...';
                state.isError = false;
            })
            .addCase(updateCafeItemStatus.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                // payload is updated order; we won't merge it into cafeTable here
                state.message = 'Item status updated';
            })
            .addCase(updateCafeItemStatus.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.isError = true;
                state.message = action.payload?.message || 'Failed to update item status';
            });
    },
});

export const { setPreparingOrder, clearPreparingOrder } = accountantSlice.actions;
export default accountantSlice.reducer;
