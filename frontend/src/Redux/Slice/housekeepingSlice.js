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

export const fetchAllhousekeepingrooms = createAsyncThunk(
    'housekeeping/fetchAllhousekeepingrooms',
    async (params = {}, { dispatch, rejectWithValue }) => {
        try {

            const response = await axios.get(`${BASE_URL}/getallhousekeepingroom`, {
                params, // This will include page, limit, search, etc.
                headers: getAuthHeaders()
            });

            // Return the entire response data
            return response.data;
        } catch (error) {
            console.error('❌ Error fetching housekeeping rooms:', error);
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

// Add this after your fetchAllhousekeepingrooms thunk
export const assignWorkerToRoom = createAsyncThunk(
    'housekeeping/assignWorkerToRoom',
    async ({ roomId, workerId }, { dispatch, rejectWithValue }) => {
        try {
            const response = await axios.post(
                `${BASE_URL}/assign`,
                { roomId, workerId },
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

export const fetchFreeWorker = createAsyncThunk(
    'housekeeping/fetchFreeWorker',

    async (_, { dispatch, rejectWithValue }) => {
        try {
            const response = await axios.get(`${BASE_URL}/getfreeworker`, {
                headers: getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
)

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

const housekeepingSlice = createSlice({
    name: 'housekeeping',
    initialState,
    reducers: {
        clearBookingError: (state) => {
            state.error = null;
        },
        resetLastCreatedBooking: (state) => {
            state.lastCreated = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllhousekeepingrooms.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllhousekeepingrooms.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload?.data || [];
                state.totalCount = action.payload.totalCount || 0;
                state.currentPage = action.payload.currentPage || 1;
                state.totalPages = action.payload.totalPages || 0;
            })
            .addCase(fetchAllhousekeepingrooms.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchFreeWorker.pending, (state) => {
                state.loadingWorkers = true;
                state.error = null;
            })
            .addCase(fetchFreeWorker.fulfilled, (state, action) => {
                state.loadingWorkers = false;
                state.freeWorkers = action.payload?.data || []; 
            })
            .addCase(fetchFreeWorker.rejected, (state, action) => {
                state.loadingWorkers = false;
                state.error = action.payload;
            })
            // Add these new cases for assignWorkerToRoom
            .addCase(assignWorkerToRoom.pending, (state) => {
                state.creating = true;
                state.error = null;
            })
            .addCase(assignWorkerToRoom.fulfilled, (state, action) => {
                state.creating = false;
                state.lastCreated = action.payload.data;
                // Optionally update the items array if needed
            })
            .addCase(assignWorkerToRoom.rejected, (state, action) => {
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

export const { clearBookingError, resetLastCreatedBooking } = housekeepingSlice.actions;
export default housekeepingSlice.reducer;