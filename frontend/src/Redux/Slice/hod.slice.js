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
 
export const getAllHodHistory = createAsyncThunk(
    'hod/getAllHodHistory',
    async (_, { dispatch, rejectWithValue }) => {
        try {
            const token = await localStorage.getItem("token");
            const response = await axios.get(`${BASE_URL}/getCafeOrder`
                // ,{
                //     headers: {
                //         Authorization: `Bearer ${token}`,
                //     }
                // }
            );
            return response.data.data;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

const hodSlice = createSlice({
    name: 'hod',
    initialState: {
        orderHistory: [],
        message: '',
        loading: false,
        isError: false,
    },
    extraReducers: (builder) => {
        builder
            .addCase(getAllHodHistory.pending, (state) => {
                state.loading = true;
                state.message = 'Fetching hod history...';
                state.isError = false;
            })
            .addCase(getAllHodHistory.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = 'hod history fetched successfully';
                state.orderHistory = action.payload;
                state.isError = false;
            })
            .addCase(getAllHodHistory.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.isError = true;
                state.message = action.payload?.message || 'Failed to fetch hod history';
            });
    },
});
 
export default hodSlice.reducer;