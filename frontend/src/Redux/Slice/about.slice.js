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

export const getAllAbout = createAsyncThunk(
    'user/getAllAbout',
    async (_, { dispatch, rejectWithValue }) => {
        try {
            const token = await localStorage.getItem("token");
            const response = await axios.get(`${BASE_URL}/getallabout`,
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

export const createAbout = createAsyncThunk(
  'user/createAbout',
  async (aboutData, { dispatch, rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('title', aboutData.title);
      formData.append('description', aboutData.description);
      if (aboutData.image) formData.append('image', aboutData.image);

      const token = await localStorage.getItem("token");
      const response = await axios.post(
        `${BASE_URL}/createabout`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }
      );
      dispatch(setAlert({ text: response.data.message || 'About created successfully', color: 'success' }));
      return response.data.data;
    } catch (error) {
      return handleErrors(error, dispatch, rejectWithValue);
    }
  }
);

export const updateAbout = createAsyncThunk(
  'user/updateAbout',
  async (aboutData, { dispatch, rejectWithValue }) => {
    try {   
      const token = await localStorage.getItem("token");
      const id = typeof aboutData === 'string' ? aboutData : (aboutData.id || aboutData._id || aboutData);
            let response;

            if (aboutData && aboutData.image && typeof aboutData.image === 'object' && aboutData.image instanceof File) {
                const formData = new FormData();
                if (aboutData.title !== undefined) formData.append('title', aboutData.title);
                if (aboutData.description !== undefined) formData.append('description', aboutData.description);
                formData.append('image', aboutData.image);

                response = await axios.put(
                    `${BASE_URL}/updateabout/${id}`,
                    formData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        }
                    }
                );
            } else {
                response = await axios.put(
                    `${BASE_URL}/updateabout/${id}`,
                    {
                        title: aboutData.title,
                        description: aboutData.description,
                        image: aboutData.image
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                        }
                    }
                );
            }
            dispatch(setAlert({ text: response.data.message || 'About updated successfully', color: 'success' }));
            return response.data.data;
    } catch (error) {
      return handleErrors(error, dispatch, rejectWithValue);
    }
  }
);

export const deleteAbout = createAsyncThunk(
    'user/deleteAbout',
        async (aboutData, { dispatch, rejectWithValue }) => {
        try {
            const token = await localStorage.getItem("token");
            const id = typeof aboutData === 'string' ? aboutData : (aboutData.id || aboutData._id || aboutData);
            const response = await axios.delete(`${BASE_URL}/deleteabout/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json', // Add this line
                    }
                }
            );
            dispatch(setAlert({ text: response.data.message || 'About deleted successfully', color: 'success' }));
            return response.data.data;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

const aboutSlice = createSlice({
    name: 'about',
    initialState: {
        about: [],
        message: '',
        loading: false,
        isError: false,
    },
    extraReducers: (builder) => {
        builder
            .addCase(getAllAbout.pending, (state) => {
                state.loading = true;
                state.message = 'Fetching about...';
                state.isError = false;
            })
            .addCase(getAllAbout.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = 'about fetched successfully';
                state.about = action.payload;
                state.isError = false;
            })
            .addCase(getAllAbout.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.isError = true;
                state.message = action.payload?.message || 'Failed to fetch about';
            })

            .addCase(createAbout.pending, (state) => {
                state.loading = true;
                state.message = 'Creating about...';
                state.isError = false;
            })
            .addCase(createAbout.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = 'About created successfully';
                state.isError = false;
            })
            .addCase(createAbout.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.isError = true;
                state.message = action.payload?.message || 'Failed to create about';
            })

            .addCase(updateAbout.pending, (state) => {
                state.loading = true;
                state.message = 'Updating about...';
                state.isError = false;
            })
            .addCase(updateAbout.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = 'About updated successfully';
                state.isError = false;
                
                state.about = state.about.map((about) =>
                (about._id && action.payload?._id && about._id === action.payload._id) || (about.id && action.payload?.id && about.id === action.payload.id)
                  ? action.payload
                  : about
              );
            })
            .addCase(updateAbout.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.isError = true;
                state.message = action.payload?.message || 'Failed to update about';
            })

            .addCase(deleteAbout.pending, (state) => {
                state.loading = true;
                state.message = 'Deleting about...';
                state.isError = false;
            })
            .addCase(deleteAbout.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = 'About deleted successfully';
                state.isError = false;

                const deletedId = action.payload?._id || action.payload?.id;
                if (deletedId) {
                    state.about = state.about.filter((about) => (about._id || about.id) !== deletedId);
                }
            })
            .addCase(deleteAbout.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.isError = true;
                state.message = action.payload?.message || 'Failed to delete about';
            });
    },
});
 
export default aboutSlice.reducer;