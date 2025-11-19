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

export const addCafecategory = createAsyncThunk(
    'cafecategory/addCafecategory',
    async (values, { dispatch, rejectWithValue }) => {
        try {
            const token = await localStorage.getItem("token");
            const response = await axios.post(`${BASE_URL}/createcafecategory`, values,
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

export const getAllCafecategory = createAsyncThunk(
    'cafecategory/getAllCafecategory',
    async (_, { dispatch, rejectWithValue }) => {
        try {
            const token = await localStorage.getItem("token");
            const response = await axios.get(`${BASE_URL}/getallcafecategory`,
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

export const updateCafecategory = createAsyncThunk(
    'cafecategory/updateCafecategory',
    async ({ cafecategorytId, cafecategoryData }, { dispatch, rejectWithValue }) => {
        try {
            const token = await localStorage.getItem("token");
            const response = await axios.put(`${BASE_URL}/updatecafecategory/${cafecategorytId}`, cafecategoryData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                }
            );
            dispatch(setAlert({ text: response.data.message || 'Cafe Category updated successfully', color: 'success' }));
            return response.data.data;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

export const deleteCafecategory = createAsyncThunk(
    'cafecategory/deleteCafecategory',
    async (cafecategorytId, { dispatch, rejectWithValue }) => {
        try {
            const token = await localStorage.getItem("token");
            const response = await axios.delete(`${BASE_URL}/deletetcafecategory/${cafecategorytId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            dispatch(setAlert({ text: response.data.message || 'Cafe Category deleted successfully', color: 'success' }));
            return cafecategorytId;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

const cafecategorySlice = createSlice({
    name: 'cafecategory',
    initialState: {
        cafecategory: [],
        message: '',
        loading: false,
        isError: false,
    },
    extraReducers: (builder) => {
        builder
            .addCase(addCafecategory.pending, (state) => {
                state.loading = true;
                state.message = 'Adding Cafe Category...';
                state.isError = false;
            })
            .addCase(addCafecategory.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = 'Cafe Category added successfully..!';
                state.cafecategory.push(action.payload);
                state.isError = false;
            })
            .addCase(addCafecategory.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.isError = true;
                state.message = action.payload?.message || 'Failed to add Cafe Category';
            })
            .addCase(getAllCafecategory.pending, (state) => {
                state.loading = true;
                state.message = 'Fetching Cafe Category...';
                state.isError = false;
            })
            .addCase(getAllCafecategory.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = 'Cafe Category fetched successfully';
                state.cafecategory = action.payload;
                state.isError = false;
            })
            .addCase(getAllCafecategory.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.isError = true;
                state.message = action.payload?.message || 'Failed to fetch Cafe Category';
            })
            .addCase(updateCafecategory.pending, (state) => {
                state.loading = true;
                state.message = 'Updating Cafe Category...';
                state.isError = false;
            })
            .addCase(updateCafecategory.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = 'Cafe Category updated successfully..!';
                state.cafecategory = state.cafecategory.map(cafecategory => 
                    cafecategory._id === action.payload._id ? action.payload : cafecategory);
                state.isError = false;
            })
            .addCase(updateCafecategory.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.isError = true;
                state.message = action.payload?.message || 'Failed to update Cafe Category';
            })
            .addCase(deleteCafecategory.pending, (state) => {
                state.loading = true;
                state.message = 'Deleting Cafe Category...';
                state.isError = false;
            })
            .addCase(deleteCafecategory.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = 'Cafe Category deleted successfully..!';
                state.cafecategory = state.cafecategory.filter(cafecategory => 
                    cafecategory._id !== action.payload);
                state.isError = false;
            })
            .addCase(deleteCafecategory.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.isError = true;
                state.message = action.payload?.message || 'Failed to delete Cafe Category';
            });
    },
});

export default cafecategorySlice.reducer;