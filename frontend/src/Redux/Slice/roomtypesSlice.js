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

export const fetchRoomTypes = createAsyncThunk(
  'roomtypes/fetchAll',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const token = await localStorage.getItem("token");
      const response = await axios.get(`${BASE_URL}/roomtypes`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }
      );
      return response.data?.data || [];
    } catch (error) {
      return handleErrors(error, dispatch, rejectWithValue);
    }
  }
);

export const getRoomTypeById = createAsyncThunk(
  'roomtypes/getById',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      const token = await localStorage.getItem("token");
      const response = await axios.get(`${BASE_URL}/roomtypes/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }
      );
      return response.data?.data;
    } catch (error) {
      return handleErrors(error, dispatch, rejectWithValue);
    }
  }
);

export const createRoomType = createAsyncThunk(
  'roomtypes/create',
  async ({ roomType, description, price, availableRooms, capacityAdults, capacityChildren, features, images, bed }, { rejectWithValue, dispatch }) => {
    try {
      const token = await localStorage.getItem("token");
      const formData = new FormData();
      formData.append('roomType', roomType);
      formData.append('description', description || '');
      formData.append('price', price);
      formData.append('availableRooms', availableRooms);
      if (capacityAdults !== undefined) formData.append('capacityAdults', capacityAdults);
      if (capacityChildren !== undefined) formData.append('capacityChildren', capacityChildren);
      if (features !== undefined) formData.append('features', JSON.stringify(features));
      if (bed !== undefined) formData.append('bed', JSON.stringify(bed));
      if (images?.length) {
        images.forEach((img) => {
          if (img) formData.append('images', img);
        });
      }

      const response = await axios.post(`${BASE_URL}/roomtypes`, formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          }
        }
      );
      dispatch(setAlert({ text: response.data.message, color: 'success' }));
      return response.data?.data;
    } catch (error) {
      return handleErrors(error, dispatch, rejectWithValue);
    }
  }
);

export const updateRoomType = createAsyncThunk(
  'roomtypes/update',
  async ({ id, roomType, description, price, availableRooms, capacityAdults, capacityChildren, features, images, existingImages, bed }, { rejectWithValue, dispatch }) => {
    try {
      const token = await localStorage.getItem("token");
      const formData = new FormData();
      if (roomType !== undefined) formData.append('roomType', roomType);
      if (description !== undefined) formData.append('description', description);
      if (price !== undefined) formData.append('price', price);
      if (availableRooms !== undefined) formData.append('availableRooms', availableRooms);
      if (capacityAdults !== undefined) formData.append('capacityAdults', capacityAdults);
      if (capacityChildren !== undefined) formData.append('capacityChildren', capacityChildren);
      if (features !== undefined) formData.append('features', JSON.stringify(features));
      if (bed !== undefined) formData.append('bed', JSON.stringify(bed));
      // Send existing images that should be kept
      if (existingImages !== undefined && Array.isArray(existingImages)) {
        formData.append('existingImages', JSON.stringify(existingImages));
      }
      if (images?.length) {
        images.forEach((img) => {
          if (img) formData.append('images', img);
        });
      }

      const response = await axios.put(`${BASE_URL}/roomtypes/${id}`, formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          }
        }
      );
      dispatch(setAlert({ text: "Room Type Update Successfull..!", color: 'success' }));
      return response.data?.data;
    } catch (error) {
      return handleErrors(error, dispatch, rejectWithValue);
    }
  }
);

export const deleteRoomType = createAsyncThunk(
  'roomtypes/delete',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      const token = await localStorage.getItem("token");
      const response = await axios.delete(`${BASE_URL}/roomtypes/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }
      );
      dispatch(setAlert({ text: response.data.message, color: 'success' }));
      return id;
    } catch (error) {
      return handleErrors(error, dispatch, rejectWithValue);
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
        state.items = state.items.map((item) => {
          const currentId = item._id || item.id;
          const updatedId = action.payload?._id || action.payload?.id;
          return currentId === updatedId ? action.payload : item;
        });
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
        state.items = state.items.filter((item) => (item._id || item.id) !== action.payload);
      })
      .addCase(deleteRoomType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearRoomTypeError, resetSelectedRoomType } = roomtypesSlice.actions;
export default roomtypesSlice.reducer;

