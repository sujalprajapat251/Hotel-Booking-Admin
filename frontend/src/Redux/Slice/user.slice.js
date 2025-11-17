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

const userSlice = createSlice({
    name: 'user',
    initialState: {
        users: [],
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
            });
    },
});

export default userSlice.reducer;
