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
 
export const getAllBlog = createAsyncThunk(
    'user/getAllBlog',
    async (_, { dispatch, rejectWithValue }) => {
        try {
            const token = await localStorage.getItem("token");
            const response = await axios.get(`${BASE_URL}/getallblog`,
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

export const createBlog = createAsyncThunk(
    'user/createBlog',
    async (blogData, { dispatch, rejectWithValue }) => {
        try {
            const formData = new FormData();
            formData.append('title', blogData.title);
            formData.append('subtitle', blogData.subtitle);
            formData.append('description', blogData.description);
            formData.append('tag', blogData.tag);
            
            if (blogData.image) {
                formData.append('image', blogData.image);
            }

            const token = await localStorage.getItem("token");
            const response = await axios.post(`${BASE_URL}/createblog`, formData,
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

export const updateBlog = createAsyncThunk(
    'user/updateBlog',
    async (blogData, { dispatch, rejectWithValue }) => {
        try {
            const formData = new FormData();
            formData.append('id', blogData.id);
            formData.append('title', blogData.title);
            formData.append('subtitle', blogData.subtitle);
            formData.append('description', blogData.description);
            formData.append('tag', blogData.tag);
            
            if (blogData.image) {
                formData.append('image', blogData.image);
            }

            const token = await localStorage.getItem("token");
                    const response = await axios.put(`${BASE_URL}/updateblog/${blogData.id}`, formData,
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

export const deleteBlog = createAsyncThunk(
    'user/deleteBlog',
        async (blogData, { dispatch, rejectWithValue }) => {
        try {
            const token = await localStorage.getItem("token");
            const response = await axios.delete(`${BASE_URL}/deleteblog/${blogData.id}`,
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

const blogSlice = createSlice({
    name: 'blog',
    initialState: {
        blog: [],
        message: '',
        loading: false,
        isError: false,
    },
    extraReducers: (builder) => {
        builder
            .addCase(getAllBlog.pending, (state) => {
                state.loading = true;
                state.message = 'Fetching blog...';
                state.isError = false;
            })
            .addCase(getAllBlog.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = 'blog fetched successfully';
                state.blog = action.payload;
                state.isError = false;
            })
            .addCase(getAllBlog.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.isError = true;
                state.message = action.payload?.message || 'Failed to fetch blog';
            })

            .addCase(createBlog.pending, (state) => {
                state.loading = true;
                state.message = 'Creating blog...';
                state.isError = false;
            })
            .addCase(createBlog.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = 'Blog created successfully';
                state.isError = false;
            })
            .addCase(createBlog.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.isError = true;
                state.message = action.payload?.message || 'Failed to create blog';
            })

            .addCase(updateBlog.pending, (state) => {
                state.loading = true;
                state.message = 'Updating blog...';
                state.isError = false;
            })
            .addCase(updateBlog.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = 'Blog updated successfully';
                state.isError = false;
            })
            .addCase(updateBlog.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.isError = true;
                state.message = action.payload?.message || 'Failed to update blog';
            })

            .addCase(deleteBlog.pending, (state) => {
                state.loading = true;
                state.message = 'Deleting blog...';
                state.isError = false;
            })
            .addCase(deleteBlog.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = 'Blog deleted successfully';
                state.isError = false;
            })
            .addCase(deleteBlog.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.isError = true;
                state.message = action.payload?.message || 'Failed to delete blog';
            });
    },
});
 
export default blogSlice.reducer;