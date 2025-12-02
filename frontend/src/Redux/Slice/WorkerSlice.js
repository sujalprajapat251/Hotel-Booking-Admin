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

export const fetchWorkerTasks = createAsyncThunk(
    'worker/fetchWorkerTasks',
    async ({ workerId }, { dispatch, rejectWithValue }) => {
        try {
            const response = await axios.get(`${BASE_URL}/getworkertask/${workerId}`,
                { headers: getAuthHeaders() }
            );
            return response.data;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
)

export const startWork = createAsyncThunk(
    'worker/startWork',
    async ({ id }, { dispatch, rejectWithValue }) => {
        console.log('taskId', id);
        try {
            const response = await axios.put(
                `${BASE_URL}/start/${id}`,
                {},
                { headers: getAuthHeaders() }
            );

            dispatch(setAlert({
                text: response.data.message || 'Task started successfully!',
                color: 'success'
            }));

            return response.data;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

export const completeTask = createAsyncThunk(
    'worker/completeTask',
    async ({ id }, { dispatch, rejectWithValue }) => {
        console.log('taskId', id);
        try {
            const response = await axios.put(
                `${BASE_URL}/complete/${id}`,
                {},
                { headers: getAuthHeaders() }
            );
            console.log('response', response.data);

            dispatch(setAlert({
                text: response.data.message || 'Task started successfully!',
                color: 'success'
            }));

            return response.data;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

export const fetchOrderTasks = createAsyncThunk(
    'worker/fetchOrderTasks',
    async ({ workerId }, { dispatch, rejectWithValue }) => {
        try {
            const response = await axios.get(`${BASE_URL}/getorderRequest/${workerId}`,
                { headers: getAuthHeaders() }
            );
            console.log('response', response);
            return response.data;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
)

export const acceptWorkeorders = createAsyncThunk(
    'worker/acceptWorkeorders',
    async ({ id }, { dispatch, rejectWithValue }) => {
        console.log('order', id);
        try {
            const response = await axios.put(
                `${BASE_URL}/orderRequest/${id}/status`,
                {},
                { headers: getAuthHeaders() }
            );

            dispatch(setAlert({
                text: response.data.message || 'Task started successfully!',
                color: 'success'
            }));

            return response.data;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);


const initialState = {
    items: [],
    busyWorkers: [],
    selected: null,
    loading: false,
    error: null,
    creating: false,
    lastCreated: null,
    totalCount: 0,
    currentPage: 1,
    totalPages: 0
};

const WorkerSlice = createSlice({
    name: 'worker',
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
            .addCase(fetchWorkerTasks.pending, (state) => {
                state.loadingWorkers = true;
                state.error = null;
            })
            .addCase(fetchWorkerTasks.fulfilled, (state, action) => {
                state.loadingWorkers = false;
                state.items = action.payload?.data || [];
            })
            .addCase(fetchWorkerTasks.rejected, (state, action) => {
                state.loadingWorkers = false;
                state.error = action.payload;
            })
            .addCase(startWork.pending, (state) => {
                state.loadingStart = true;
                state.error = null;
            })
            .addCase(startWork.fulfilled, (state, action) => {
                state.loadingStart = false;
                state.start = action.payload?.data || [];
            })
            .addCase(startWork.rejected, (state, action) => {
                state.loadingStart = false;
                state.error = action.payload;
            })
            .addCase(completeTask.pending, (state) => {
                state.loadingStart = true;
                state.error = null;
            })
            .addCase(completeTask.fulfilled, (state, action) => {
                state.loadingStart = false;
                state.start = action.payload?.data || [];
                console.log('Free workers:', action.payload.data);
            })
            .addCase(completeTask.rejected, (state, action) => {
                state.loadingStart = false;
                state.error = action.payload;
            })
            .addCase(fetchOrderTasks.pending, (state) => {
                state.loadingWorkers = true;
                state.error = null;
            })
            .addCase(fetchOrderTasks.fulfilled, (state, action) => {
                state.loadingWorkers = false;
                state.orders = action.payload?.data || [];
            })
            .addCase(fetchOrderTasks.rejected, (state, action) => {
                state.loadingWorkers = false;
                state.error = action.payload;
            })
            .addCase(acceptWorkeorders.pending, (state) => {
                state.loadingWorkers = true;
                state.error = null;
            })
            .addCase(acceptWorkeorders.fulfilled, (state, action) => {
                state.loadingWorkers = false;
                state.orders = action.payload?.data || [];
            })
            .addCase(acceptWorkeorders.rejected, (state, action) => {
                state.loadingWorkers = false;
                state.error = action.payload;
            })
    }
});

export const { clearBookingError, resetLastCreatedBooking } = WorkerSlice.actions;
export default WorkerSlice.reducer;