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
 
export const getAllBaritem = createAsyncThunk(
    'user/getallbaritem',
    async (_, { dispatch, rejectWithValue }) => {
        try {
            const response = await axios.get(`${BASE_URL}/getallbaritem`);
            return response.data.data;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

export const createBaritem = createAsyncThunk(
    'user/createbaritem',
    async (barData, { dispatch, rejectWithValue }) => {
        try {
            const formData = new FormData();
            formData.append('name', barData.name);
            formData.append('category', barData.category);
            formData.append('price', barData.price);
            formData.append('description', barData.description);
            
            if (barData.image) {
                formData.append('image', barData.image);
            }

            const token = await localStorage.getItem("token");
            const response = await axios.post(`${BASE_URL}/createbaritem`, formData,
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

export const updateBaritem = createAsyncThunk(
    'user/updatebaritem',
    async (barData, { dispatch, rejectWithValue }) => {
        try {
            const formData = new FormData();
            formData.append('id', barData.id);
            formData.append('name', barData.name);
            formData.append('category', barData.category);
            formData.append('price', barData.price);
            formData.append('description', barData.description);
            
            if (barData.image) {
                formData.append('image', barData.image);
            }

            const token = await localStorage.getItem("token");
            const response = await axios.put(`${BASE_URL}/updatebaritem/${barData.id}`, formData,
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

export const deleteBaritem = createAsyncThunk(
    'user/deleteBaritem',
        async (cafeData, { dispatch, rejectWithValue }) => {
        try {
            const token = await localStorage.getItem("token");
            const response = await axios.delete(`${BASE_URL}/deletetbaritem/${cafeData.id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    }
                }
            );

            return response.data.data;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue, 'Failed to delete Bar Item');
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

const barSlice = createSlice({
    name: 'barItem',
    initialState: {
        barItem: [],
        message: '',
        loading: false,
        isError: false,
    },
    extraReducers: (builder) => {
        builder
            .addCase(getAllBaritem.pending, (state) => {
                state.loading = true;
                state.message = 'Fetching bar...';
                state.isError = false;
            })
            .addCase(getAllBaritem.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = 'Bar fetched successfully';
                state.barItem = action.payload;
                state.isError = false;
            })
            .addCase(getAllBaritem.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.isError = true;
                state.message = action.payload?.message || 'Failed to fetch bar';
            })

            .addCase(createBaritem.pending, (state) => {
                state.loading = true;
                state.message = 'Creating bar...';
                state.isError = false;
            })
            .addCase(createBaritem.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = 'Bar created successfully';
                state.isError = false;
            })
            .addCase(createBaritem.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.isError = true;
                state.message = action.payload?.message || 'Failed to create bar';
            })

            .addCase(updateBaritem.pending, (state) => {
                state.loading = true;
                state.message = 'Updating bar...';
                state.isError = false;
            })
            .addCase(updateBaritem.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = 'Bar updated successfully';
                state.isError = false;
            })
            .addCase(updateBaritem.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.isError = true;
                state.message = action.payload?.message || 'Failed to update bar';
            })

            .addCase(deleteBaritem.pending, (state) => {
                state.loading = true;
                state.message = 'Deleting Bar...';
                state.isError = false;
            })
            .addCase(deleteBaritem.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = 'Bar deleted successfully';
                state.isError = false;
            })
            .addCase(deleteBaritem.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.isError = true;
                state.message = action.payload?.message || 'Failed to delete Bar';
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
                const index = state.barItem.findIndex(item => item._id === action.payload._id || item.id === action.payload._id);
                if (index !== -1) {
                    state.barItem[index] = action.payload;
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
 
export default barSlice.reducer;