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
 
export const getAllCafeitem = createAsyncThunk(
    'user/getAllCafeitem',
    async (_, { dispatch, rejectWithValue }) => {
        try {
            const token = await localStorage.getItem("token");
            const response = await axios.get(`${BASE_URL}/getallcafeitem`,
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

export const createCafeitem = createAsyncThunk(
    'user/createCafeitem',
    async (cafeData, { dispatch, rejectWithValue }) => {
        try {
            const formData = new FormData();
            formData.append('name', cafeData.name);
            formData.append('category', cafeData.category);
            formData.append('price', cafeData.price);
            formData.append('description', cafeData.description);
            
            if (cafeData.image) {
                formData.append('image', cafeData.image);
            }

            const token = await localStorage.getItem("token");
            const response = await axios.post(`${BASE_URL}/createcafeitem`, formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
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

export const updateCafeitem = createAsyncThunk(
    'user/updateCafeitem',
    async (cafeData, { dispatch, rejectWithValue }) => {
        try {
            const formData = new FormData();
            formData.append('id', cafeData.id);
            formData.append('name', cafeData.name);
            formData.append('category', cafeData.category);
            formData.append('price', cafeData.price);
            formData.append('description', cafeData.description);
            
            if (cafeData.image) {
                formData.append('image', cafeData.image);
            }

            const token = await localStorage.getItem("token");
            const response = await axios.put(`${BASE_URL}/updatecafeitem/${cafeData.id}`, formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
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

export const deleteCafeitem = createAsyncThunk(
    'user/deleteCafeitem',
        async (cafeData, { dispatch, rejectWithValue }) => {
        try {
            const token = await localStorage.getItem("token");
            const response = await axios.delete(`${BASE_URL}/deletetcafeitem/${cafeData.id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json', // Add this line
                    }
                }
            );
            return response.data.data;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue, 'Failed to delete blog');
        }
    }
);

export const toggleCafeitemStatus = createAsyncThunk(
    'user/toggleCafeitemStatus',
    async (cafeData, { dispatch, rejectWithValue }) => {
        try {
            const token = await localStorage.getItem("token");
            const response = await axios.put(`${BASE_URL}/togglecafeitem/${cafeData.id}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    }
                }
            );
            return response.data.data;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue, 'Failed to toggle status');
        }
    }
);

const cafeSlice = createSlice({
    name: 'cafe',
    initialState: {
        cafe: [],
        message: '',
        loading: false,
        isError: false,
    },
    extraReducers: (builder) => {
        builder
            .addCase(getAllCafeitem.pending, (state) => {
                state.loading = true;
                state.message = 'Fetching cafe...';
                state.isError = false;
            })
            .addCase(getAllCafeitem.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = 'cafe fetched successfully';
                state.cafe = action.payload;
                state.isError = false;
            })
            .addCase(getAllCafeitem.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.isError = true;
                state.message = action.payload?.message || 'Failed to fetch cafe';
            })

            .addCase(createCafeitem.pending, (state) => {
                state.loading = true;
                state.message = 'Creating cafe...';
                state.isError = false;
            })
            .addCase(createCafeitem.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = 'Cafe created successfully';
                state.isError = false;
            })
            .addCase(createCafeitem.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.isError = true;
                state.message = action.payload?.message || 'Failed to create cafe';
            })

            .addCase(updateCafeitem.pending, (state) => {
                state.loading = true;
                state.message = 'Updating cafe...';
                state.isError = false;
            })
            .addCase(updateCafeitem.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = 'Cafe updated successfully';
                state.isError = false;
            })
            .addCase(updateCafeitem.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.isError = true;
                state.message = action.payload?.message || 'Failed to update cafe';
            })

            .addCase(deleteCafeitem.pending, (state) => {
                state.loading = true;
                state.message = 'Deleting cafe...';
                state.isError = false;
            })
            .addCase(deleteCafeitem.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = 'Cafe deleted successfully';
                state.isError = false;
            })
            .addCase(deleteCafeitem.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.isError = true;
                state.message = action.payload?.message || 'Failed to delete cafe';
            })

            .addCase(toggleCafeitemStatus.pending, (state) => {
                state.loading = true;
                state.message = 'Toggling status...';
                state.isError = false;
            })
            .addCase(toggleCafeitemStatus.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = 'Status updated successfully';
                // Update the specific item in the cafe array
                const index = state.cafe.findIndex(item => item._id === action.payload._id || item.id === action.payload._id);
                if (index !== -1) {
                    state.cafe[index] = action.payload;
                }
                state.isError = false;
            })
            .addCase(toggleCafeitemStatus.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.isError = true;
                state.message = action.payload?.message || 'Failed to toggle status';
            });
    },
});
 
export default cafeSlice.reducer;