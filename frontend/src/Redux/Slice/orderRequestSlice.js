import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { BASE_URL } from '../../Utils/baseUrl';
import { setAlert } from './alert.slice';

const handleErrors = (error, dispatch, rejectWithValue) => {
    const errorMessage = error.response?.data?.message || 'An error occurred';
    dispatch(setAlert({ text: errorMessage, color: 'error' }));
    return rejectWithValue(error.response?.data || { message: errorMessage });
};

const buildError = (error) => {
    if (error?.response?.data?.message) return error.response.data.message;
    return error?.message || 'Something went wrong';
};

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const fetchAllOrderRequesr = createAsyncThunk(
    'housekeeping/fetchAllOrderRequesr',
    async (params = {}, { dispatch, rejectWithValue }) => {
        try {
            // Log the request parameters
            console.log('📤 Fetching housekeeping rooms with params:', params);

            const response = await axios.get(`${BASE_URL}/getorderRequest`, {
                // params, // This will include page, limit, search, etc.
                headers: getAuthHeaders()
            });

            // Log the response
            console.log('📥 Housekeeping API Response:', {
                dataCount: response.data?.data?.length || 0,
                pagination: response.data?.pagination,
                totalCount: response.data?.pagination?.totalCount,
                currentPage: response.data?.pagination?.currentPage,
                totalPages: response.data?.pagination?.totalPages
            });

            console.log('response', response.data);
            // Return the entire response data
            return response.data;
        } catch (error) {
            console.error('❌ Error fetching housekeeping rooms:', error);
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

// Add this after your fetchAllhousekeepingrooms thunk
export const assignWorkerToOrderRequest = createAsyncThunk(
    'housekeeping/assignWorkerToRoom',
    async ({ Id, workerId }, { dispatch, rejectWithValue }) => {
        try {
            const response = await axios.put(
                `${BASE_URL}/orderRequest/${Id}/assign`,
                { workerId },
                { headers: getAuthHeaders() }
            );

            dispatch(setAlert({
                text: response.data.message || 'Worker assigned successfully!',
                color: 'success'
            }));

            return response.data;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

// export const fetchFreeWorker = createAsyncThunk(
//     'housekeeping/fetchFreeWorker',

//     async (_, { dispatch, rejectWithValue }) => {
//         try {
//             const response = await axios.get(`${BASE_URL}/getfreeworker`, {
//                 headers: getAuthHeaders()
//             });
//             console.log('responseeeeeeee', response.data);
//             return response.data;
//         } catch (error) {
//             return handleErrors(error, dispatch, rejectWithValue);
//         }
//     }
// )

// Approve Cleaning (Head Supervisor)
export const approveCleaningRoom = createAsyncThunk(
    'housekeeping/approveCleaningRoom',
    async (roomId, { dispatch, rejectWithValue }) => {
        try {
            const response = await axios.put(
                `${BASE_URL}/approve/${roomId}`,
                {}, // no body needed
                { headers: getAuthHeaders() }
            );
            dispatch(setAlert({ text: response.data.message || 'Room marked as clean!', color: 'success' }));
            console.log('response', response?.data);
            return response.data;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);


const initialState = {
    items: [],
    freeWorkers: [],
    selected: null,
    loading: false,
    error: null,
    creating: false,
    lastCreated: null,
    // Pagination state
    totalCount: 0,
    currentPage: 1,
    totalPages: 0
};

const orderRequestSlice = createSlice({
    name: 'orderrequest',
    initialState,
    reducers: {
        clearOrderRequestError: (state) => {
            state.error = null;
        },
        resetLastCreatedOrderRequest: (state) => {
            state.lastCreated = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllOrderRequesr.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllOrderRequesr.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload?.data || [];
                console.log('itemssss', action.payload);
                state.totalCount = action.payload.totalCount || 0;
                state.currentPage = action.payload.currentPage || 1;
                state.totalPages = action.payload.totalPages || 0;
            })
            .addCase(fetchAllOrderRequesr.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // .addCase(fetchFreeWorker.pending, (state) => {
            //     state.loadingWorkers = true;
            //     state.error = null;
            // })
            // .addCase(fetchFreeWorker.fulfilled, (state, action) => {
            //     state.loadingWorkers = false;
            //     state.freeWorkers = action.payload?.data || []; // Store in freeWorkers instead of items
            //     console.log('Free workers:', action.payload.data);
            // })
            // .addCase(fetchFreeWorker.rejected, (state, action) => {
            //     state.loadingWorkers = false;
            //     state.error = action.payload;
            // })
            // Add these new cases for assignWorkerToRoom
            .addCase(assignWorkerToOrderRequest.pending, (state) => {
                state.creating = true;
                state.error = null;
            })
            .addCase(assignWorkerToOrderRequest.fulfilled, (state, action) => {
                state.creating = false;
                state.lastCreated = action.payload.data;
                // Optionally update the items array if needed
            })
            .addCase(assignWorkerToOrderRequest.rejected, (state, action) => {
                state.creating = false;
                state.error = action.payload;
            })
            // Add reducer cases for approveCleaningRoom
            .addCase(approveCleaningRoom.pending, (state) => {
                state.updating = true;
                state.error = null;
            })
            .addCase(approveCleaningRoom.fulfilled, (state, action) => {
                state.updating = false;
                const updatedRoom = action.payload?.data;
                // Update items list if present
                if (updatedRoom && Array.isArray(state.items)) {
                    state.items = state.items.map(item => {
                        if (item.id === updatedRoom._id || item._id === updatedRoom._id) {
                            return { ...item, ...updatedRoom };
                        }
                        return item;
                    });
                }
            })
            .addCase(approveCleaningRoom.rejected, (state, action) => {
                state.updating = false;
                state.error = action.payload;
            });
    }
});

export const { clearOrderRequestError, resetLastCreatedOrderRequest } = orderRequestSlice.actions;
export default orderRequestSlice.reducer;