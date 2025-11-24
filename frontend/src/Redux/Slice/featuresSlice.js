import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { BASE_URL } from '../../Utils/baseUrl';

const buildError = (error) => {
  if (error.response?.data?.message) return error.response.data.message;
  return error.message || 'Something went wrong';
};

export const fetchFeatures = createAsyncThunk(
  'features/fetchAll',
  async (roomTypeId, { rejectWithValue }) => {
    try {
      const token = await localStorage.getItem("token");
      const url = roomTypeId
        ? `${BASE_URL}/features/roomtype/${roomTypeId}`
        : `${BASE_URL}/features`;
      const response = await axios.get(url,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }
      );
      return response.data?.data || [];
    } catch (error) {
      return rejectWithValue(buildError(error));
    }
  }
);

export const getFeatureById = createAsyncThunk(
  'features/getById',
  async (id, { rejectWithValue }) => {
    const token = await localStorage.getItem("token");
    try {
      const response = await axios.get(`${BASE_URL}/features/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }
      );
      return response.data?.data;
    } catch (error) {
      return rejectWithValue(buildError(error));
    }
  }
);

export const createFeature = createAsyncThunk(
  'features/create',
  async ({ feature, roomType }, { rejectWithValue }) => {
    try {
      const token = await localStorage.getItem("token");
      const response = await axios.post(`${BASE_URL}/features`, { feature, roomType },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }
      );
      return response.data?.data;
    } catch (error) {
      return rejectWithValue(buildError(error));
    }
  }
);

export const updateFeature = createAsyncThunk(
  'features/update',
  async ({ id, feature, roomType }, { rejectWithValue }) => {
    try {
      const token = await localStorage.getItem("token");
      const response = await axios.put(`${BASE_URL}/features/${id}`, { feature, roomType },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }
      );
      return response.data?.data;
    } catch (error) {
      return rejectWithValue(buildError(error));
    }
  }
);

export const deleteFeature = createAsyncThunk(
  'features/delete',
  async (id, { rejectWithValue }) => {
    try {
      const token = await localStorage.getItem("token");
      await axios.delete(`${BASE_URL}/features/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }
      );
      return id;
    } catch (error) {
      return rejectWithValue(buildError(error));
    }
  }
);

const initialState = {
  items: [],
  selectedFeature: null,
  loading: false,
  error: null
};

const featuresSlice = createSlice({
  name: 'features',
  initialState,
  reducers: {
    clearFeaturesError: (state) => {
      state.error = null;
    },
    resetSelectedFeature: (state) => {
      state.selectedFeature = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeatures.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeatures.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchFeatures.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getFeatureById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getFeatureById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedFeature = action.payload;
      })
      .addCase(getFeatureById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createFeature.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createFeature.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload);
      })
      .addCase(createFeature.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateFeature.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateFeature.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.map((item) =>
          item.id === action.payload.id ? action.payload : item
        );
      })
      .addCase(updateFeature.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteFeature.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteFeature.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter((item) => item.id !== action.payload);
      })
      .addCase(deleteFeature.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearFeaturesError, resetSelectedFeature } = featuresSlice.actions;
export default featuresSlice.reducer;

