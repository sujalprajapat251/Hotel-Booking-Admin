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
 
export const getAllTerms = createAsyncThunk(
    'user/getAllTerms',
    async (_, { dispatch, rejectWithValue }) => {
        try {
            const token = await localStorage.getItem("token");
            const response = await axios.get(`${BASE_URL}/getallterms`,
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

export const createTerms = createAsyncThunk(
  'user/createTerms',
  async (termsData, { dispatch, rejectWithValue }) => {
    try {
      const token = await localStorage.getItem("token");
      const response = await axios.post(
        `${BASE_URL}/createterms`,
        {
          title: termsData.title,
          description: termsData.description
        }, // ✨ JSON send karo
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          }
        }
      );
        dispatch(setAlert({ text: response.data.message || 'Terms created successfully', color: 'success' }));
        return response.data.data;
    } catch (error) {   
      return handleErrors(error, dispatch, rejectWithValue);
    }
  }
);

export const updateTerms = createAsyncThunk(
  'user/updateTerms',
  async (termsData, { dispatch, rejectWithValue }) => {
    try {   
      const token = await localStorage.getItem("token");
      const id = typeof termsData === 'string' ? termsData : (termsData.id || termsData._id || termsData);
      const response = await axios.put(
        `${BASE_URL}/updateterms/${id}`,
        {
          title: termsData.title,
          description: termsData.description
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          }
        }
      );
        dispatch(setAlert({ text: response.data.message || 'Terms updated successfully', color: 'success' }));
        return id; 
    } catch (error) {
      return handleErrors(error, dispatch, rejectWithValue);
    }
  }
);


export const deleteTerms = createAsyncThunk(
    'user/deleteTerms',
        async (termsData, { dispatch, rejectWithValue }) => {
        try {
            const token = await localStorage.getItem("token");
      const id = typeof termsData === 'string' ? termsData : (termsData.id || termsData._id || termsData);
      const response = await axios.delete(`${BASE_URL}/deleteterms/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        }
      );
            dispatch(setAlert({ text: response.data.message || 'Terms deleted successfully', color: 'success' }));
            return id; 
        } catch (error) {
      return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

const termsSlice = createSlice({
    name: 'terms',
    initialState: {
        terms: [],
        message: '',
        loading: false,
        isError: false,
    },
    extraReducers: (builder) => {
        builder
            .addCase(getAllTerms.pending, (state) => {
                state.loading = true;
                state.message = 'Fetching terms...';
                state.isError = false;
            })
            .addCase(getAllTerms.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = 'terms fetched successfully';
                state.terms = action.payload;
                state.isError = false;
            })
            .addCase(getAllTerms.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.isError = true;
                state.message = action.payload?.message || 'Failed to fetch terms';
            })

            .addCase(createTerms.pending, (state) => {
                state.loading = true;
                state.message = 'Creating terms...';
                state.isError = false;
            })
            .addCase(createTerms.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = 'Terms created successfully';
                state.isError = false;
            })
            .addCase(createTerms.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.isError = true;
                state.message = action.payload?.message || 'Failed to create terms';
            })

            .addCase(updateTerms.pending, (state) => {
                state.loading = true;
                state.message = 'Updating terms...';
                state.isError = false;
            })
            .addCase(updateTerms.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = 'Terms updated successfully';
                state.isError = false;

              state.terms = state.terms.map((term) =>
                (term._id && action.payload?._id && term._id === action.payload._id) || (term.id && action.payload?.id && term.id === action.payload.id)
                  ? action.payload
                  : term
              );
            })
            .addCase(updateTerms.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.isError = true;
                state.message = action.payload?.message || 'Failed to update terms';
            })

            .addCase(deleteTerms.pending, (state) => {
                state.loading = true;
                state.message = 'Deleting terms...';
                state.isError = false;
            })
            .addCase(deleteTerms.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = 'Terms deleted successfully';
                state.isError = false;

              const deletedId = action.payload?._id || action.payload?.id;
              if (deletedId) {
                state.terms = state.terms.filter((term) => (term._id || term.id) !== deletedId);
              }
            })
            .addCase(deleteTerms.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.isError = true;
                state.message = action.payload?.message || 'Failed to delete terms';
            });
    },
});
 
export default termsSlice.reducer;