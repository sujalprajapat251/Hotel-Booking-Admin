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
 
export const getAllContact = createAsyncThunk(
    'user/getAllContact',
    async (_, { dispatch, rejectWithValue }) => {
        try {
            const token = await localStorage.getItem("token");
            const response = await axios.get(`${BASE_URL}/getallcontact`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                }
            );
            return response.data.contact;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);
 
const contactSlice = createSlice({
    name: 'contact',
    initialState: {
        contact: [],
        message: '',
        loading: false,
        isError: false,
    },
    extraReducers: (builder) => {
        builder
            .addCase(getAllContact.pending, (state) => {
                state.loading = true;
                state.message = 'Fetching contact...';
                state.isError = false;
            })
            .addCase(getAllContact.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = 'contact fetched successfully';
                state.contact = action.payload;
                state.isError = false;
            })
            .addCase(getAllContact.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.isError = true;
                state.message = action.payload?.message || 'Failed to fetch contact';
            });
    },
});
 
export default contactSlice.reducer;