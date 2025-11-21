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

export const addRestaurantcategory = createAsyncThunk(
    'restaurantcategory/addRestaurantcategory',
    async (values, { dispatch, rejectWithValue }) => {
        try {
            const token = await localStorage.getItem("token");
            const response = await axios.post(`${BASE_URL}/createrestaurantcategory`, values,
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

export const getAllRestaurantcategory = createAsyncThunk(
    'restaurantcategory/getallrestaurantcategory',
    async (_, { dispatch, rejectWithValue }) => {
        try {
            const token = await localStorage.getItem("token");
            const response = await axios.get(`${BASE_URL}/getallrestaurantcategory`,
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

export const updateRestaurantcategory = createAsyncThunk(
    'restaurantcategory/updaterestaurantcategory',
    async ({ restaurantcategorytId, restaurantcategoryData }, { dispatch, rejectWithValue }) => {
        try {
            const token = await localStorage.getItem("token");
            const response = await axios.put(`${BASE_URL}/updaterestaurantcategory/${restaurantcategorytId}`, restaurantcategoryData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                }
            );
            dispatch(setAlert({ text: response.data.message || 'Restaurant Category updated successfully', color: 'success' }));
            return response.data.data;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

export const deleteRestaurantcategory = createAsyncThunk(
    'restaurantcategory/deleterestaurantcategory',
    async (restaurantcategorytId, { dispatch, rejectWithValue }) => {
        try {
            const token = await localStorage.getItem("token");
            const response = await axios.delete(`${BASE_URL}/deletetrestaurantcategory/${restaurantcategorytId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            dispatch(setAlert({ text: response.data.message || 'Restaurant Category deleted successfully', color: 'success' }));
            return restaurantcategorytId;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

const restaurantcategorySlice = createSlice({
    name: 'restaurantcategory',
    initialState: {
        restaurantcategory: [],
        message: '',
        loading: false,
        isError: false,
    },
    extraReducers: (builder) => {
        builder
            .addCase(addRestaurantcategory.pending, (state) => {
                state.loading = true;
                state.message = 'Adding Restaurant Category...';
                state.isError = false;
            })
            .addCase(addRestaurantcategory.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = 'Restaurant Category added successfully..!';
                state.restaurantcategory.push(action.payload);
                state.isError = false;
            })
            .addCase(addRestaurantcategory.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.isError = true;
                state.message = action.payload?.message || 'Failed to add Restaurant Category';
            })
            .addCase(getAllRestaurantcategory.pending, (state) => {
                state.loading = true;
                state.message = 'Fetching Restaurant Category...';
                state.isError = false;
            })
            .addCase(getAllRestaurantcategory.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = 'Restaurant Category fetched successfully';
                state.restaurantcategory = action.payload;
                state.isError = false;
            })
            .addCase(getAllRestaurantcategory.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.isError = true;
                state.message = action.payload?.message || 'Failed to fetch Restaurant Category';
            })
            .addCase(updateRestaurantcategory.pending, (state) => {
                state.loading = true;
                state.message = 'Updating Restaurant Category...';
                state.isError = false;
            })
            .addCase(updateRestaurantcategory.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = 'Restaurant Category updated successfully..!';
                state.restaurantcategory = state.restaurantcategory.map(restaurantcategory => 
                    restaurantcategory._id === action.payload._id ? action.payload : restaurantcategory);
                state.isError = false;
            })
            .addCase(updateRestaurantcategory.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.isError = true;
                state.message = action.payload?.message || 'Failed to update Restaurant Category';
            })
            .addCase(deleteRestaurantcategory.pending, (state) => {
                state.loading = true;
                state.message = 'Deleting Restaurant Category...';
                state.isError = false;
            })
            .addCase(deleteRestaurantcategory.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = 'Restaurant Category deleted successfully..!';
                state.restaurantcategory = state.restaurantcategory.filter(restaurantcategory => 
                    restaurantcategory._id !== action.payload);
                state.isError = false;
            })
            .addCase(deleteRestaurantcategory.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.isError = true;
                state.message = action.payload?.message || 'Failed to delete Restaurant Category';
            });
    },
});

export default restaurantcategorySlice.reducer;