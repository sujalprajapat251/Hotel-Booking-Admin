import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { BASE_URL } from '../../Utils/baseUrl';

const buildError = (error) => {
  if (error.response?.data?.message) return error.response.data.message;
  return error.message || 'Something went wrong';
};

export const fetchRooms = createAsyncThunk(
  'rooms/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/rooms`);
      return response.data?.data || [];
    } catch (error) {
      return rejectWithValue(buildError(error));
    }
  }
);

// Paginated rooms fetch (used in AvailableRooms to avoid loading all rooms at once)
export const fetchRoomsPaginated = createAsyncThunk(
  'rooms/fetchPaginated',
  async ({ page = 1, limit = 12, filters = {} } = {}, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/rooms/pagination`, {
        params: { page, limit, ...filters }
      });

      return {
        items: response.data?.data || [],
        page: response.data?.page || page,
        total: response.data?.total || 0,
        totalPages: response.data?.totalPages || 1,
        limit,
        stats: response.data?.stats || null,
        floors: response.data?.floors || []
      };
    } catch (error) {
      return rejectWithValue(buildError(error));
    }
  }
);

export const getRoomById = createAsyncThunk(
  'rooms/getById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/rooms/${id}`);
      return response.data?.data;
    } catch (error) {
      return rejectWithValue(buildError(error));
    }
  }
);

export const createRoom = createAsyncThunk(
  'rooms/create',
  async (roomData, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      
      // Append all room data
      formData.append('roomNumber', roomData.roomNumber);
      formData.append('roomType', roomData.roomType);
      formData.append('floor', roomData.floor);
      formData.append('price', JSON.stringify(roomData.price));
      formData.append('capacity', JSON.stringify(roomData.capacity));
      formData.append('features', JSON.stringify(roomData.features || []));
      formData.append('bed', JSON.stringify(roomData.bed));
      formData.append('viewType', roomData.viewType);
      formData.append('status', roomData.status || 'Available');
      formData.append('isSmokingAllowed', String(roomData.isSmokingAllowed || false));
      formData.append('isPetFriendly', String(roomData.isPetFriendly || false));
      formData.append('maintenanceNotes', roomData.maintenanceNotes || '');

      // Append images if provided
      if (roomData.images && roomData.images.length > 0) {
        roomData.images.forEach((image) => {
          if (image instanceof File) {
            formData.append('images', image);
          }
        });
      }

      const token = localStorage.getItem('token');
      const response = await axios.post(`${BASE_URL}/rooms`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      return response.data?.data;
    } catch (error) {
      return rejectWithValue(buildError(error));
    }
  }
);

export const updateRoom = createAsyncThunk(
  'rooms/update',
  async ({ id, roomData }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      
      // Append all room data
      if (roomData.roomNumber) formData.append('roomNumber', roomData.roomNumber);
      if (roomData.roomType) formData.append('roomType', roomData.roomType);
      if (roomData.floor !== undefined) formData.append('floor', roomData.floor);
      if (roomData.price) formData.append('price', JSON.stringify(roomData.price));
      if (roomData.capacity) formData.append('capacity', JSON.stringify(roomData.capacity));
      if (roomData.features) formData.append('features', JSON.stringify(roomData.features));
      if (roomData.bed) formData.append('bed', JSON.stringify(roomData.bed));
      if (roomData.viewType) formData.append('viewType', roomData.viewType);
      if (roomData.status) formData.append('status', roomData.status);
      if (roomData.isSmokingAllowed !== undefined) formData.append('isSmokingAllowed', String(roomData.isSmokingAllowed));
      if (roomData.isPetFriendly !== undefined) formData.append('isPetFriendly', String(roomData.isPetFriendly));
      if (roomData.maintenanceNotes !== undefined) formData.append('maintenanceNotes', roomData.maintenanceNotes);
      if (roomData.imagesToKeep) formData.append('images', JSON.stringify(roomData.imagesToKeep));

      // Append images if provided
      if (roomData.images && roomData.images.length > 0) {
        roomData.images.forEach((image) => {
          if (image instanceof File) {
            formData.append('images', image);
          }
        });
      }

      const token = localStorage.getItem('token');
      const response = await axios.put(`${BASE_URL}/rooms/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      return response.data?.data;
    } catch (error) {
      return rejectWithValue(buildError(error));
    }
  }
);

export const deleteRoom = createAsyncThunk(
  'rooms/delete',
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${BASE_URL}/rooms/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return id;
    } catch (error) {
      return rejectWithValue(buildError(error));
    }
  }
);

const initialState = {
  items: [],
  floors: [],
  selectedRoom: null,
  loading: false,
  error: null,
  // pagination meta (used when fetching via fetchRoomsPaginated)
  page: 1,
  limit: 12,
  total: 0,
  totalPages: 1,
  // aggregated stats from backend (for dashboard cards)
  stats: {
    total: 0,
    available: 0,
    occupied: 0,
    reserved: 0,
    maintenance: 0,
    occupancyRate: 0
  }
};

const roomsSlice = createSlice({
  name: 'rooms',
  initialState,
  reducers: {
    clearRoomError: (state) => {
      state.error = null;
    },
    resetSelectedRoom: (state) => {
      state.selectedRoom = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRooms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRooms.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchRooms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchRoomsPaginated.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoomsPaginated.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.page = action.payload.page;
        state.total = action.payload.total;
        state.totalPages = action.payload.totalPages;
        state.limit = action.payload.limit;
        state.floors = action.payload.floors;
        if (action.payload.stats) {
          state.stats = {
            ...state.stats,
            ...action.payload.stats
          };
        }
      })
      .addCase(fetchRoomsPaginated.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getRoomById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRoomById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedRoom = action.payload;
      })
      .addCase(getRoomById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createRoom.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRoom.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload);
      })
      .addCase(createRoom.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateRoom.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRoom.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.map((item) =>
          item.id === action.payload.id ? action.payload : item
        );
      })
      .addCase(updateRoom.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteRoom.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteRoom.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter((item) => {
          const itemId = item?.id || item?._id;
          return itemId !== action.payload;
        });
      })
      .addCase(deleteRoom.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearRoomError, resetSelectedRoom } = roomsSlice.actions;
export default roomsSlice.reducer;

