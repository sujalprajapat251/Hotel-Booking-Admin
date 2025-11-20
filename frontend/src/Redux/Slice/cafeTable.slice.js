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

export const getAllCafeTable = createAsyncThunk(
    'user/getAllCafeTable',
    async (_, { dispatch, rejectWithValue }) => {
        try {

            const token = await localStorage.getItem("token");

            const response = await axios.get(`${BASE_URL}/getAllCafeTable`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                }
            });

            return response.data.data;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

export const createCafeTable = createAsyncThunk(
    'user/addCafeTable',
    async (cafeTableData, { dispatch, rejectWithValue }) => {
        try {

            const token = await localStorage.getItem("token");
            const response = await axios.post(`${BASE_URL}/addCafeTable`, cafeTableData,
                {
                    headers: {
                        'Content-Type': 'application/json',
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

export const updateCafeTable = createAsyncThunk(
    'user/updateCafeTable',
    async (editCafeTableData, { dispatch, rejectWithValue }) => {
        try {
            const token = await localStorage.getItem("token");
            const response = await axios.put(`${BASE_URL}/updateCafeTable/${editCafeTableData.id}`, editCafeTableData,
                {
                    headers: {
                        'Content-Type': 'application/json',
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

export const deleteCafeTable = createAsyncThunk(
    'user/deleteCafeTable',
    async (cafeTableData, { dispatch, rejectWithValue }) => {
        try {
            const token = await localStorage.getItem("token");
            const response = await axios.delete(`${BASE_URL}/deleteCafeTable/${cafeTableData.id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    }
                }
            );

            return response.data.data;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue, 'Failed to delete Cafe Table');
        }
    }
);

const cafeTableSlice = createSlice({
    name: 'cafeTable',
    initialState: {
        cafeTable: [],
        message: '',
        loading: false,
        isError: false,
    },
    extraReducers: (builder) => {
        builder
            .addCase(getAllCafeTable.pending, (state) => {
                state.loading = true;
                state.message = 'Fetching Cafe Table...';
                state.isError = false;
            })
            .addCase(getAllCafeTable.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = 'Cafe Table fetched successfully';
                state.cafeTable = action.payload;
                state.isError = false;
            })
            .addCase(getAllCafeTable.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.isError = true;
                state.message = action.payload?.message || 'Failed to fetch Cafe Table';
            })

            .addCase(createCafeTable.pending, (state) => {
                state.loading = true;
                state.message = 'Creating Cafe Table...';
                state.isError = false;
            })
            .addCase(createCafeTable.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = 'Cafe Table created successfully';
                state.isError = false;
            })
            .addCase(createCafeTable.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.isError = true;
                state.message = action.payload?.message || 'Failed to create Cafe Table';
            })

            .addCase(updateCafeTable.pending, (state) => {
                state.loading = true;
                state.message = 'Updating Cafe Table...';
                state.isError = false;
            })
            .addCase(updateCafeTable.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = 'Cafe Table updated successfully';
                state.isError = false;
            })
            .addCase(updateCafeTable.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.isError = true;
                state.message = action.payload?.message || 'Failed to update Cafe Table';
            })

            .addCase(deleteCafeTable.pending, (state) => {
                state.loading = true;
                state.message = 'Deleting Cafe Table...';
                state.isError = false;
            })
            .addCase(deleteCafeTable.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = 'Cafe Table deleted successfully';
                state.isError = false;
            })
            .addCase(deleteCafeTable.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.isError = true;
                state.message = action.payload?.message || 'Failed to delete Cafe Table';
            });
    },
});

export default cafeTableSlice.reducer;