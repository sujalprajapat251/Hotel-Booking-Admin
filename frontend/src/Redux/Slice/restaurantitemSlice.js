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
 
export const getAllRestaurantitem = createAsyncThunk(
    'user/getAllRestaurantitem',
    async (_, { dispatch, rejectWithValue }) => {
        try {
            const response = await axios.get(`${BASE_URL}/getallrestaurantitem`);
            return response.data.data;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

export const createRestaurantitem = createAsyncThunk(
    'user/createRestaurantitem',
    async (restaurantData, { dispatch, rejectWithValue }) => {
        try {
            const formData = new FormData();
            formData.append('name', restaurantData.name);
            formData.append('category', restaurantData.category);
            formData.append('price', restaurantData.price);
            formData.append('description', restaurantData.description);
            
            if (restaurantData.image) {
                formData.append('image', restaurantData.image);
            }

            const token = await localStorage.getItem("token");
            const response = await axios.post(`${BASE_URL}/createrestaurantitem`, formData,
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

export const updateRestaurantitem = createAsyncThunk(
    'user/updateRestaurantitem',
    async (restaurantData, { dispatch, rejectWithValue }) => {
        try {
            const formData = new FormData();
            formData.append('id', restaurantData.id);
            formData.append('name', restaurantData.name);
            formData.append('category', restaurantData.category);
            formData.append('price', restaurantData.price);
            formData.append('description', restaurantData.description);
            
            if (restaurantData.image) {
                formData.append('image', restaurantData.image);
            }

            const token = await localStorage.getItem("token");
            const response = await axios.put(`${BASE_URL}/updaterestaurantitem/${restaurantData.id}`, formData,
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

export const deleteRestaurantitem = createAsyncThunk(
    'user/deleteRestaurantitem',
        async (cafeData, { dispatch, rejectWithValue }) => {
        try {
            const token = await localStorage.getItem("token");
            const response = await axios.delete(`${BASE_URL}/deletetrestaurantitem/${cafeData.id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    }
                }
            );

            return response.data.data;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue, 'Failed to delete Restaurant Item');
        }
    }
);

export const toggleRestaurantitemStatus = createAsyncThunk(
    'user/toggleRestaurantitemStatus',
    async (cafeData, { dispatch, rejectWithValue }) => {
        try {
            const token = await localStorage.getItem("token");
            const response = await axios.put(`${BASE_URL}/togglerestaurantitem/${cafeData.id}`,
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

const restaurantSlice = createSlice({
    name: 'restaurant',
    initialState: {
        restaurant: [],
        message: '',
        loading: false,
        isError: false,
    },
    extraReducers: (builder) => {
        builder
            .addCase(getAllRestaurantitem.pending, (state) => {
                state.loading = true;
                state.message = 'Fetching restaurant...';
                state.isError = false;
            })
            .addCase(getAllRestaurantitem.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = 'Restaurant fetched successfully';
                state.restaurant = action.payload;
                state.isError = false;
            })
            .addCase(getAllRestaurantitem.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.isError = true;
                state.message = action.payload?.message || 'Failed to fetch restaurant';
            })

            .addCase(createRestaurantitem.pending, (state) => {
                state.loading = true;
                state.message = 'Creating restaurant...';
                state.isError = false;
            })
            .addCase(createRestaurantitem.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = 'Restaurant created successfully';
                state.isError = false;
            })
            .addCase(createRestaurantitem.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.isError = true;
                state.message = action.payload?.message || 'Failed to create restaurant';
            })

            .addCase(updateRestaurantitem.pending, (state) => {
                state.loading = true;
                state.message = 'Updating restaurant...';
                state.isError = false;
            })
            .addCase(updateRestaurantitem.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = 'Restaurant updated successfully';
                state.isError = false;
            })
            .addCase(updateRestaurantitem.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.isError = true;
                state.message = action.payload?.message || 'Failed to update restaurant';
            })

            .addCase(deleteRestaurantitem.pending, (state) => {
                state.loading = true;
                state.message = 'Deleting restaurant...';
                state.isError = false;
            })
            .addCase(deleteRestaurantitem.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = 'Restaurant deleted successfully';
                state.isError = false;
            })
            .addCase(deleteRestaurantitem.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.isError = true;
                state.message = action.payload?.message || 'Failed to delete restaurant';
            })

            .addCase(toggleRestaurantitemStatus.pending, (state) => {
                state.loading = true;
                state.message = 'Toggling status...';
                state.isError = false;
            })
            .addCase(toggleRestaurantitemStatus.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = 'Status updated successfully';
                // Update the specific item in the cafe array
                const index = state.restaurant.findIndex(item => item._id === action.payload._id || item.id === action.payload._id);
                if (index !== -1) {
                    state.restaurant[index] = action.payload;
                }
                state.isError = false;
            })
            .addCase(toggleRestaurantitemStatus.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.isError = true;
                state.message = action.payload?.message || 'Failed to toggle status';
            });
    },
});
 
export default restaurantSlice.reducer;