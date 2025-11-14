import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { BASE_URL } from '../../Utils/baseUrl';

const buildError = (error) => {
  if (error.response?.data?.message) return error.response.data.message;
  return error.message || 'Something went wrong';
};

export const fetchRoomTypes = createAsyncThunk(
  'roomtypes/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/roomtypes`);
      return response.data?.data || [];
    } catch (error) {
      return rejectWithValue(buildError(error));
    }
  }
);

export const getRoomTypeById = createAsyncThunk(
  'roomtypes/getById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/roomtypes/${id}`);
      return response.data?.data;
    } catch (error) {
      return rejectWithValue(buildError(error));
    }
  }
);

export const createRoomType = createAsyncThunk(
  'roomtypes/create',
  async ({ roomType }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}/roomtypes`, { roomType });
      return response.data?.data;
    } catch (error) {
      return rejectWithValue(buildError(error));
    }
  }
);

export const updateRoomType = createAsyncThunk(
  'roomtypes/update',
  async ({ id, roomType }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${BASE_URL}/roomtypes/${id}`, { roomType });
      return response.data?.data;
    } catch (error) {
      return rejectWithValue(buildError(error));
    }
  }
);

export const deleteRoomType = createAsyncThunk(
  'roomtypes/delete',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${BASE_URL}/roomtypes/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(buildError(error));
    }
  }
);

const initialState = {
  items: [],
  selectedRoomType: null,
  loading: false,
  error: null
};

const roomtypesSlice = createSlice({
  name: 'roomtypes',
  initialState,
  reducers: {
    clearRoomTypeError: (state) => {
      state.error = null;
    },
    resetSelectedRoomType: (state) => {
      state.selectedRoomType = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRoomTypes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoomTypes.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchRoomTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getRoomTypeById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRoomTypeById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedRoomType = action.payload;
      })
      .addCase(getRoomTypeById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createRoomType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRoomType.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload);
      })
      .addCase(createRoomType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateRoomType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRoomType.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.map((item) =>
          item.id === action.payload.id ? action.payload : item
        );
      })
      .addCase(updateRoomType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteRoomType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteRoomType.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter((item) => item.id !== action.payload);
      })
      .addCase(deleteRoomType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearRoomTypeError, resetSelectedRoomType } = roomtypesSlice.actions;
export default roomtypesSlice.reducer;

