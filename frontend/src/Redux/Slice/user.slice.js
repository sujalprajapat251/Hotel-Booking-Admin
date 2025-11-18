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

export const getAllUser = createAsyncThunk(
    'user/getAllUser',
    async (_, { dispatch, rejectWithValue }) => {
        try {
            const token = await localStorage.getItem("token");
            const response = await axios.get(`${BASE_URL}/getalluser`,
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

// get current login user details
export const getUserById = createAsyncThunk(
    'users/getUserById',
    async (_, { dispatch, rejectWithValue }) => {
        try {
            const token = localStorage.getItem("token");
            const userId = localStorage.getItem("userId");
            
            if (!token || !userId) {
                throw new Error('No authentication token or user ID found');
            }
            
            const response = await axios.get(`${BASE_URL}/getUserById`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            
            return response.data.users || response.data.user;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

export const updateUser = createAsyncThunk(
    "users/updateUser",
    async ({ id, values, file }, { dispatch, rejectWithValue }) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error('No authentication token found');
            }
            
            const formData = new FormData();
            
            // Append all form values to FormData
            Object.keys(values).forEach((key) => {
                if (values[key] !== null && values[key] !== undefined && values[key] !== '') {
                    formData.append(key, values[key]);
                }
            });
            
            // Append file if provided
            if (file) {
                formData.append('photo', file);
            }

            const response = await axios.put(`${BASE_URL}/userUpdate/${id}`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });
            
            dispatch(setAlert({ text: response.data.message, color: 'success' }));
            return response.data.user;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

const userSlice = createSlice({
    name: 'user',
    initialState: {
        users: [],
        currentUser: null,
        message: '',
        loading: false,
        isError: false,
    },
    extraReducers: (builder) => {
        builder
            .addCase(getAllUser.pending, (state) => {
                state.loading = true;
                state.message = 'Fetching User...';
                state.isError = false;
            })
            .addCase(getAllUser.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = 'user fetched successfully';
                state.users = action.payload;
                state.isError = false;
            })
            .addCase(getAllUser.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.isError = true;
                state.message = action.payload?.message || 'Failed to fetch user';
            })

            // Get user by ID
            .addCase(getUserById.pending, (state) => {
                state.loading = true;
                state.message = 'Getting user...';
                state.isError = false;
            })
            .addCase(getUserById.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.currentUser = action.payload;
                state.message = '';
                state.isError = false;
            })
            .addCase(getUserById.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.isError = true;
                state.message = action.payload?.message || 'Failed to get user';
            })

            // Update user
            .addCase(updateUser.pending, (state) => {
                state.loading = true;
                state.message = 'Updating user...';
                state.isError = false;
            })
            .addCase(updateUser.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                // Update user in users array
                state.users = state.users.map(user =>
                    user._id === action.payload._id ? action.payload : user
                );
                // Update current user
                state.currentUser = action.payload;
                state.message = 'User updated successfully';
                state.isError = false;
            })
            .addCase(updateUser.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.isError = true;
                state.message = action.payload?.message || 'Failed to update user';
            })
    },
});

export default userSlice.reducer;
