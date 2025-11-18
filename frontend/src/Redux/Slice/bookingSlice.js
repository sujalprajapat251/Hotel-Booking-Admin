import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { BASE_URL } from '../../Utils/baseUrl';

const buildError = (error) => {
  if (error?.response?.data?.message) return error.response.data.message;
  return error?.message || 'Something went wrong';
};

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const fetchBookings = createAsyncThunk(
  'booking/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/bookings`, {
        params,
        headers: getAuthHeaders()
      });
      return response.data?.data || [];
    } catch (error) {
      return rejectWithValue(buildError(error));
    }
  }
);

export const createBooking = createAsyncThunk(
  'booking/create',
  async (bookingData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}/bookings`, bookingData, {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        }
      });
      return response.data?.data;
    } catch (error) {
      return rejectWithValue(buildError(error));
    }
  }
);

export const getBookingById = createAsyncThunk(
  'booking/getById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/bookings/${id}`, {
        headers: getAuthHeaders()
      });
      return response.data?.data;
    } catch (error) {
      return rejectWithValue(buildError(error));
    }
  }
);

export const updateBooking = createAsyncThunk(
  'booking/update',
  async ({ id, updates }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${BASE_URL}/bookings/${id}`, updates, {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        }
      });
      return response.data?.data;
    } catch (error) {
      return rejectWithValue(buildError(error));
    }
  }
);

export const deleteBooking = createAsyncThunk(
  'booking/delete',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${BASE_URL}/bookings/${id}`, {
        headers: getAuthHeaders()
      });
      return id;
    } catch (error) {
      return rejectWithValue(buildError(error));
    }
  }
);

const initialState = {
  items: [],
  selected: null,
  loading: false,
  error: null,
  creating: false,
  lastCreated: null
};

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    clearBookingError: (state) => {
      state.error = null;
    },
    resetLastCreatedBooking: (state) => {
      state.lastCreated = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createBooking.pending, (state) => {
        state.creating = true;
        state.error = null;
        state.lastCreated = null;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.creating = false;
        state.items.unshift(action.payload);
        state.lastCreated = action.payload;
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload;
      })
      .addCase(getBookingById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBookingById.fulfilled, (state, action) => {
        state.loading = false;
        state.selected = action.payload;
      })
      .addCase(getBookingById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.map((booking) =>
          booking.id === action.payload.id ? action.payload : booking
        );
        if (state.selected?.id === action.payload.id) {
          state.selected = action.payload;
        }
      })
      .addCase(updateBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter((booking) => booking.id !== action.payload);
        if (state.selected?.id === action.payload) {
          state.selected = null;
        }
      })
      .addCase(deleteBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearBookingError, resetLastCreatedBooking } = bookingSlice.actions;
export default bookingSlice.reducer;

