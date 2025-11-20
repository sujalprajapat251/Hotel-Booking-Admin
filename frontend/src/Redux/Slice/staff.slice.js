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

export const createStaff = createAsyncThunk(
    'staff/createStaff',
    async (staffData, { dispatch, rejectWithValue }) => {
        try {
            const formData = new FormData();
            formData.append('name', staffData.name);
            formData.append('email', staffData.email);
            formData.append('password', staffData.password);
            formData.append('mobileno', staffData.mobileno);
            formData.append('address', staffData.address);
            formData.append('department', staffData.department);
            formData.append('designation', staffData.designation);
            formData.append('gender', staffData.gender);
            formData.append('joiningdate', staffData.joiningdate);
            
            if (staffData.image) {
                formData.append('image', staffData.image);
            }

            const token = await localStorage.getItem("token");
            const response = await axios.post(`${BASE_URL}/createstaff`, formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
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

export const getAllStaff = createAsyncThunk(
    'staff/getAllStaff',
    async (_, { dispatch, rejectWithValue }) => {
        try {
            const token = await localStorage.getItem("token");
            const response = await axios.get(`${BASE_URL}/getallstaff`,
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

export const updateStaff = createAsyncThunk(
    'staff/updateStaff',
    async ({ staffId, staffData }, { dispatch, rejectWithValue }) => {
        try {
            const formData = new FormData();
            formData.append('name', staffData.name);
            formData.append('email', staffData.email);
            if (staffData.password) {
                formData.append('password', staffData.password);
            }
            formData.append('mobileno', staffData.mobileno);
            formData.append('address', staffData.address);
            formData.append('department', staffData.department);
            formData.append('designation', staffData.designation);
            formData.append('gender', staffData.gender);
            formData.append('joiningdate', staffData.joiningdate);
            
            if (staffData.image && staffData.image instanceof File) {
                formData.append('image', staffData.image);
            }

            const token = await localStorage.getItem("token");
            const response = await axios.put(`${BASE_URL}/updatestaff/${staffId}`, formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${token}`,
                    }
                }
            );
            dispatch(setAlert({ text: response.data.message || 'Staff updated successfully', color: 'success' }));
            return response.data.data; 
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);


export const deleteStaff = createAsyncThunk(
    'staff/deleteStaff',
    async (staffId, { dispatch, rejectWithValue }) => {
        try {
            const token = await localStorage.getItem("token");
            const response = await axios.delete(`${BASE_URL}/deletetstaff/${staffId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            dispatch(setAlert({ text: response.data.message || 'Staff deleted successfully', color: 'success' }));
            return staffId; 
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

const staffSlice = createSlice({
    name: 'staff',
    initialState: {
        staff: [],
        message: '',
        loading: false,
        isError: false,
    },
    extraReducers: (builder) => {
        builder
            .addCase(createStaff.pending, (state) => {
                state.loading = true;
                state.message = 'Adding Staff...';
                state.isError = false;
            })
            .addCase(createStaff.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = 'Staff added successfully..!';
                state.staff.push(action.payload); 
                state.isError = false;
            })
            .addCase(createStaff.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.isError = true;
                state.message = action.payload?.message || 'Failed to add Staff';
            })
            .addCase(getAllStaff.pending, (state) => {
                state.loading = true;
                state.message = 'Fetching staff...';
                state.isError = false;
            })
            .addCase(getAllStaff.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = 'staff fetched successfully..!';
                state.staff = action.payload;
                state.isError = false;
            })
            .addCase(getAllStaff.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.isError = true;
                state.message = action.payload?.message || 'Failed to fetch staff';
            })
            .addCase(updateStaff.pending, (state) => {
                state.loading = true;
                state.message = 'Updating Staff...';
                state.isError = false;
            })
            .addCase(updateStaff.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = 'Staff updated successfully..!';
                state.staff = state.staff.map(staff => staff._id === action.payload._id ? action.payload : staff);
                state.isError = false;
            })
            .addCase(updateStaff.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.isError = true;
                state.message = action.payload?.message || 'Failed to update Staff';
            })
            .addCase(deleteStaff.pending, (state) => {
                state.loading = true;
                state.message = 'Deleting Staff...';        
                state.isError = false;
            })
            .addCase(deleteStaff.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = 'Staff deleted successfully..!';
                state.staff = state.staff.filter(staff => staff._id !== action.payload);
                state.isError = false;
            })
            .addCase(deleteStaff.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.isError = true;
                state.message = action.payload?.message || 'Failed to delete Staff';
            });
    },
});

export default staffSlice.reducer;
