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

export const addBarcategory = createAsyncThunk(
    'barcategory/addBarcategory',
    async (values, { dispatch, rejectWithValue }) => {
        try {
            const token = await localStorage.getItem("token");
            const response = await axios.post(`${BASE_URL}/createbarcategory`, values,
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

export const getAllBarcategory = createAsyncThunk(
    'barcategory/getallbarcategory',
    async (_, { dispatch, rejectWithValue }) => {
        try {
            const token = await localStorage.getItem("token");
            const response = await axios.get(`${BASE_URL}/getallbarcategory`,
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

export const updateBarcategory = createAsyncThunk(
    'barcategory/updatebarcategory',
    async ({ barcategorytId, barcategoryData }, { dispatch, rejectWithValue }) => {
        try {
            const token = await localStorage.getItem("token");
            const response = await axios.put(`${BASE_URL}/updatebarcategory/${barcategorytId}`, barcategoryData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                }
            );
            dispatch(setAlert({ text: response.data.message || 'Bar Category updated successfully', color: 'success' }));
            return response.data.data;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

export const deleteBarcategory = createAsyncThunk(
    'barcategory/deleteBarcategory',
    async (barcategorytId, { dispatch, rejectWithValue }) => {
        try {
            const token = await localStorage.getItem("token");
            const response = await axios.delete(`${BASE_URL}/deletetbarcategory/${barcategorytId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            dispatch(setAlert({ text: response.data.message || 'Bar Category deleted successfully', color: 'success' }));
            return barcategorytId;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

const barcategorySlice = createSlice({
    name: 'barcategory',
    initialState: {
        barcategory: [],
        message: '',
        loading: false,
        isError: false,
    },
    extraReducers: (builder) => {
        builder
            .addCase(addBarcategory.pending, (state) => {
                state.loading = true;
                state.message = 'Adding Bar Category...';
                state.isError = false;
            })
            .addCase(addBarcategory.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = 'Bar Category added successfully..!';
                state.barcategory.push(action.payload);
                state.isError = false;
            })
            .addCase(addBarcategory.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.isError = true;
                state.message = action.payload?.message || 'Failed to add Bar Category';
            })
            .addCase(getAllBarcategory.pending, (state) => {
                state.loading = true;
                state.message = 'Fetching Bar Category...';
                state.isError = false;
            })
            .addCase(getAllBarcategory.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = 'Bar Category fetched successfully';
                state.barcategory = action.payload;
                state.isError = false;
            })
            .addCase(getAllBarcategory.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.isError = true;
                state.message = action.payload?.message || 'Failed to fetch Bar Category';
            })
            .addCase(updateBarcategory.pending, (state) => {
                state.loading = true;
                state.message = 'Updating Bar Category...';
                state.isError = false;
            })
            .addCase(updateBarcategory.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = 'Bar Category updated successfully..!';
                state.barcategory = state.barcategory.map(barcategory => 
                    barcategory._id === action.payload._id ? action.payload : barcategory);
                state.isError = false;
            })
            .addCase(updateBarcategory.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.isError = true;
                state.message = action.payload?.message || 'Failed to update Bar Category';
            })
            .addCase(deleteBarcategory.pending, (state) => {
                state.loading = true;
                state.message = 'Deleting Bar Category...';
                state.isError = false;
            })
            .addCase(deleteBarcategory.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = 'Bar Category deleted successfully..!';
                state.barcategory = state.barcategory.filter(barcategory => 
                    barcategory._id !== action.payload);
                state.isError = false;
            })
            .addCase(deleteBarcategory.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.isError = true;
                state.message = action.payload?.message || 'Failed to delete Bar Category';
            });
    },
});

export default barcategorySlice.reducer;