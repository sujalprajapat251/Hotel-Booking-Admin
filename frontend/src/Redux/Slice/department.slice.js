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

export const addDepartment = createAsyncThunk(
    'department/addDepartment',
    async (values, { dispatch, rejectWithValue }) => {
        try {
            const token = await localStorage.getItem("token");
            const response = await axios.post(`${BASE_URL}/createdepartment`, values,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                }
            );
            dispatch(setAlert({ text: response.data.message, color: 'success' }));
            return response.data.data;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

export const getAllDepartment = createAsyncThunk(
    'department/getAllDepartment',
    async (_, { dispatch, rejectWithValue }) => {
        try {
            const token = await localStorage.getItem("token");
            const response = await axios.get(`${BASE_URL}/getalldepartment`,
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

export const updateDepartment = createAsyncThunk(
    'department/updateDepartment',
    async ({ departmentId, departmentData }, { dispatch, rejectWithValue }) => {
        try {
            const token = await localStorage.getItem("token");
            const response = await axios.put(`${BASE_URL}/updatedepartment/${departmentId}`, departmentData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                }
            );
            dispatch(setAlert({ text: response.data.message || 'Department updated successfully', color: 'success' }));
            return response.data.data;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

export const deleteDepartment = createAsyncThunk(
    'department/deleteDepartment',
    async (departmentId, { dispatch, rejectWithValue }) => {
        try {
            const token = await localStorage.getItem("token");
            const response = await axios.delete(`${BASE_URL}/deletetdepartment/${departmentId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            dispatch(setAlert({ text: response.data.message || 'Department deleted successfully', color: 'success' }));
            return departmentId;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

const departmentSlice = createSlice({
    name: 'department',
    initialState: {
        departments: [],
        message: '',
        loading: false,
        isError: false,
    },
    extraReducers: (builder) => {
        builder
            .addCase(addDepartment.pending, (state) => {
                state.loading = true;
                state.message = 'Adding Department...';
                state.isError = false;
            })
            .addCase(addDepartment.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = 'Department added successfully..!';
                state.departments.push(action.payload);
                state.isError = false;
            })
            .addCase(addDepartment.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.isError = true;
                state.message = action.payload?.message || 'Failed to add Department';
            })
            .addCase(getAllDepartment.pending, (state) => {
                state.loading = true;
                state.message = 'Fetching Department...';
                state.isError = false;
            })
            .addCase(getAllDepartment.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = 'Department fetched successfully';
                state.departments = action.payload;
                state.isError = false;
            })
            .addCase(getAllDepartment.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.isError = true;
                state.message = action.payload?.message || 'Failed to fetch Department';
            })
            .addCase(updateDepartment.pending, (state) => {
                state.loading = true;
                state.message = 'Updating Department...';
                state.isError = false;
            })
            .addCase(updateDepartment.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = 'Department updated successfully..!';
                state.departments = state.departments.map(department => 
                    department._id === action.payload._id ? action.payload : department);
                state.isError = false;
            })
            .addCase(updateDepartment.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.isError = true;
                state.message = action.payload?.message || 'Failed to update Department';
            })
            .addCase(deleteDepartment.pending, (state) => {
                state.loading = true;
                state.message = 'Deleting Department...';
                state.isError = false;
            })
            .addCase(deleteDepartment.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = 'Department deleted successfully..!';
                state.departments = state.departments.filter(department => 
                    department._id !== action.payload);
                state.isError = false;
            })
            .addCase(deleteDepartment.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.isError = true;
                state.message = action.payload?.message || 'Failed to delete Department';
            });
    },
});

export default departmentSlice.reducer;