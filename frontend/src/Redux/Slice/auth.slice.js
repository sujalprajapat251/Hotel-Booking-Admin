import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import sessionStorage from 'redux-persist/es/storage/session';
import axios from 'axios';
import { BASE_URL } from '../../Utils/baseUrl';
import { setAlert } from './alert.slice';

const handleErrors = (error, dispatch, rejectWithValue) => {
    const errorMessage = error.response?.data?.message || 'An error occurred';
    dispatch(setAlert({ text: errorMessage, color: 'error' }));
    return rejectWithValue(error.response?.data || { message: errorMessage });
};

const initialState = {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    loggedIn: false,
    isLoggedOut: false,
    message: null,
    resendingOtp: false
};

export const login = createAsyncThunk(
    'auth/login',
    async (credentials, { dispatch, rejectWithValue }) => {
        try {
            const response = await axios.post(`${BASE_URL}/adminLogin`, credentials,{ withCredentials: true });
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('userId', response.data.user._id);
            dispatch(setAlert({ text: response.data.message, color: 'success' }));
            return response.data;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);



export const forgotPassword = createAsyncThunk(
    'auth/forgotPassword',
    async (email, { dispatch, rejectWithValue }) => {
        try {
            const response = await axios.post(`${BASE_URL}/adminforgotPassword`, { email });
            if (response.status === 200) {
                dispatch(setAlert({ text: response.data.message, color: 'success' }));
                return response.data;
            }
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

export const verifyOtp = createAsyncThunk(
    'auth/verifyOtp',
    async ({ email, otp }, { dispatch, rejectWithValue }) => {
        try {
            const response = await axios.post(`${BASE_URL}/adminverifyOtp`, { email, otp });
            if (response.status === 200) {
                dispatch(setAlert({ text: response.data.message, color: 'success' }));
                return response.data;
            }
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

export const resendOtp = createAsyncThunk(
    'auth/resendOtp',
    async (email, { dispatch, rejectWithValue }) => {
        try {
            const response = await axios.post(`${BASE_URL}/adminresendOtp`, { email });
            if (response.status === 200) {
                dispatch(setAlert({ text: response.data.message, color: 'success' }));
                return response.data;
            }
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

export const resetPassword = createAsyncThunk(
    'auth/resetPassword',
    async ({ email, newPassword }, { dispatch, rejectWithValue }) => {
        try {
            const response = await axios.post(`${BASE_URL}/adminresetpassword`, { email, newPassword });
            if (response.status === 200) {
                dispatch(setAlert({ text: response.data.message, color: 'success' }));
                return response.data;
            }
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

export const changePassword = createAsyncThunk(
    'auth/changePassword',
    async ({ oldPassword, newPassword, confirmPassword }, { dispatch, rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(`${BASE_URL}/adminchangepassword`, { oldPassword, newPassword, confirmPassword },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            if (response.status === 200) {
                dispatch(setAlert({ text: response.data.message, color: 'success' }));
                return response.data;
            }
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

export const logoutUser = createAsyncThunk(
    'auth/logout',
    async (id, { dispatch, rejectWithValue }) => {
        try {
            const response = await axios.post(`${BASE_URL}/logout/${id}`);
            if (response.status === 200) {
                sessionStorage.removeItem('userId');
                sessionStorage.removeItem('token');
                localStorage.clear();
                
                dispatch(setAlert({ text: response.data.message, color: 'success' }));
                return response.data;
            }
        } catch (error) {
            sessionStorage.removeItem('userId');
            sessionStorage.removeItem('token');
            localStorage.clear();
            return rejectWithValue(error.response?.data || { message: 'Logout failed' });
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state, action) => {
            state.user = null;
            state.isAuthenticated = false;
            state.loggedIn = false;
            state.isLoggedOut = true;
            state.loading = false;
            state.error = null;
            state.message = action.payload?.message || "Logged out successfully";
            window.localStorage.clear();
            window.sessionStorage.clear();
        },
        setauth: (state, action) => {
            state.isAuthenticated = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(login.fulfilled, (state, action) => {
                state.user = action.payload.user;
                state.isAuthenticated = true;
                state.loading = false;
                state.error = null;
                state.message = action.payload?.message || "Login successfully";
                
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload.message;
                state.message = action.payload?.message || "Login Failed";
                // enqueueSnackbar(state.message, { variant: 'error' });

            })
            .addCase(forgotPassword.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                state.message = action.payload; // Assuming the API returns a success message
                // enqueueSnackbar(state.message, { variant: 'success' });
            })
            .addCase(forgotPassword.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload.message;
                state.message = action.payload?.message || "Forgot Password Failed";
                // enqueueSnackbar(state.message, { variant: 'error' });
            })
            .addCase(verifyOtp.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                state.message = action.payload.message; // Assuming the API returns a success message
                // enqueueSnackbar(state.message, { variant: 'success' });
            })
            .addCase(verifyOtp.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload.message;
                state.message = action.payload.data?.message || "Verify OTP Failed";
                // enqueueSnackbar(state.message, { variant: 'error' });
            })
            .addCase(resendOtp.pending, (state) => {
                state.resendingOtp = true;
                state.error = null;
            })
            .addCase(resendOtp.fulfilled, (state, action) => {
                state.resendingOtp = false;
                state.error = null;
                state.message = action.payload.message || "OTP resent successfully..!";
            })
            .addCase(resendOtp.rejected, (state, action) => {
                state.resendingOtp = false;
                state.error = action.payload.message;
                state.message = action.payload?.message || "Resend OTP Failed";
            })
            .addCase(resetPassword.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                state.message = action.payload; // Assuming the API returns a success message
                // enqueueSnackbar(state.message, { variant: 'success' });
            })
            .addCase(resetPassword.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload.message;
                state.message = action.payload?.message || "Reset Password Failed";
                // enqueueSnackbar(state.message, { variant: 'error' });
            })
            .addCase(logoutUser.fulfilled, (state, action) => {
                state.user = null;
                state.isAuthenticated = false;
                state.loggedIn = false;
                state.isLoggedOut = true;
                state.loading = false;
                state.error = null;
                window.sessionStorage.clear();
                window.localStorage.clear();
                state.message = action.payload?.message || "Logged out successfully";
            })
            .addCase(logoutUser.rejected, (state, action) => {
                // Even if logout API fails, we should still clear the local state
                state.user = null;
                state.isAuthenticated = false;
                state.loggedIn = false;
                state.isLoggedOut = true;
                state.loading = false;
                state.error = null;
                window.sessionStorage.clear();
                window.localStorage.clear();
                state.message = "Logged out successfully";
            })

            .addCase(changePassword.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                state.message = action.payload;
            })
            .addCase(changePassword.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload.message;
                state.message = action.payload?.message || "Change Password Failed";
            })
    },
});

export const { logout, setauth } = authSlice.actions;
export default authSlice.reducer;