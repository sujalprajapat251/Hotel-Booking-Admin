import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { BASE_URL } from '../../Utils/baseUrl';
import { setAlert } from './alert.slice';

const handleErrors = (error, dispatch, rejectWithValue) => {
  const errorMessage = error.response?.data?.message || "An error occurred";

  dispatch(setAlert({ text: errorMessage, color: "error" }));

  // RETURN ONLY MESSAGE STRING
  return rejectWithValue(errorMessage);
};

const buildError = (error) => {
  if (error?.response?.data?.message) return error.response.data.message;
  return error?.message || 'Something went wrong';
};

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Updated fetchBookings to support pagination
export const fetchBookings = createAsyncThunk(
  'booking/fetchAll',
  async (params = {}, { dispatch, rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/bookings`, {
        params, // This will include page, limit, search, etc.
        headers: getAuthHeaders()
      });
      // console.log('response', response.data);
      
      // Return the entire response data
      return response.data;
    } catch (error) {
      return handleErrors(error, dispatch, rejectWithValue);
    }
  }
);

export const createBooking = createAsyncThunk(
  'booking/create',
  async (bookingData, { dispatch, rejectWithValue }) => {
    console.log(bookingData, "bookingData");
    try {
      const response = await axios.post(`${BASE_URL}/bookings`, bookingData, {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        }
      });
      dispatch(setAlert({ text: response.data.message, color: 'success' }));
      return response.data?.data;
    } catch (error) {
      return handleErrors(error, dispatch, rejectWithValue);
    }
  }
);

export const getBookingById = createAsyncThunk(
  'booking/getById',
  async (id, { dispatch, rejectWithValue }) => {
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
  async ({ id, updates }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axios.put(`${BASE_URL}/bookings/${id}`, updates, {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        }
      });
      dispatch(setAlert({ text: response.data.message, color: 'success' }));
      return response.data?.data;
    } catch (error) {
      return rejectWithValue(buildError(error));
    }
  }
);

export const deleteBooking = createAsyncThunk(
  'booking/delete',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const response = await axios.delete(`${BASE_URL}/bookings/${id}`, {
        headers: getAuthHeaders()
      });

      dispatch(setAlert({ text: response.data.message || "Booking deleted successfully..!", color: 'success' }));
      return id;
    } catch (error) {
      return handleErrors(error, dispatch, rejectWithValue);
    }
  }
);

export const createBookingPaymentIntent = createAsyncThunk(
  'booking/createPaymentIntent',
  async (paymentIntentData, { dispatch, rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}/booking/paymentintent`, paymentIntentData, {
        headers: getAuthHeaders()
      });
      return response.data?.paymentIntentId;
    } catch (error) {
      return handleErrors(error, dispatch, rejectWithValue);
    }
  }
);

const initialState = {
  items: [],
  paymentIntent: null,
  selected: null,
  loading: false,
  error: null,
  creating: false,
  lastCreated: null,
  // Pagination state
  totalCount: 0,
  currentPage: 1,
  totalPages: 0
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
        state.items = action.payload.data || [];
        state.totalCount = action.payload.totalCount || 0;
        state.currentPage = action.payload.currentPage || 1;
        state.totalPages = action.payload.totalPages || 0;
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
      })
      .addCase(createBookingPaymentIntent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBookingPaymentIntent.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentIntent = action.payload;
      })
      .addCase(createBookingPaymentIntent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
  }
});

export const { clearBookingError, resetLastCreatedBooking } = bookingSlice.actions;
export default bookingSlice.reducer;