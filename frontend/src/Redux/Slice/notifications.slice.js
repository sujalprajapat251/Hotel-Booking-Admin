import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { BASE_URL } from '../../Utils/baseUrl';
import { setAlert } from './alert.slice';

const STORAGE_KEY = 'staff_notifications';

const formatMessage = (n) => {
  const t = n?.type || n?.payload?.type || '';
  const p = n?.payload || {};
  if (n?.message) return n.message;
  if (p?.message) return p.message;
  if (t === 'table_status_changed') {
    const title = p.tableTitle || p.tableId || '';
    const status = p.status || '';
    return `Table ${title} status changed to ${status}`.trim();
  }
  if (t === 'new_order') {
    const title = p.tableTitle || p.tableId || '';
    const items = Array.isArray(p.items) ? p.items.filter(Boolean) : [];
    const list = items
      .map((it) => {
        const nm = it?.name || it?.product?.name || '';
        const q = it?.qty ?? it?.quantity ?? 1;
        return nm ? `${nm} x${q}` : '';
      })
      .filter(Boolean)
      .join(', ');
    const suffix = list ? `: ${list}` : '';
    return `New order arise on ${title}${suffix}`.trim();
  }
  if (t === 'item_ready') {
    const title = p.tableTitle || p.tableId || '';
    const itemName = p.itemName || '';
    return `${itemName} is ready on ${title}`.trim();
  }
  if (t === 'order_paid') {
    const title = p.tableTitle || p.tableId || '';
    return `Order paid for ${title}`.trim();
  }
  return 'Notification';
};

const saveCache = (list) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, 100)));
  } catch {}
};

export const fetchNotifications = createAsyncThunk(
  'notifications/fetch',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const token = await localStorage.getItem('token');
      if (!token) return [];
      const res = await axios.get(`${BASE_URL}/notifications`, { headers: { Authorization: `Bearer ${token}` } });
      const server = Array.isArray(res.data?.data) ? res.data.data : [];
      let cache = [];
      try {
        cache = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      } catch {}
      const map = new Map();
      [...server, ...cache].forEach((n) => {
        const key = n._id || `${n.type}-${n.message}-${n.createdAt}`;
        if (!map.has(key)) map.set(key, n);
      });
      const mergedAll = Array.from(map.values())
        .map((n) => ({ ...n, message: formatMessage(n) }))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 100);
      const mergedUnseen = mergedAll.filter((n) => !n.seen);
      saveCache(mergedUnseen);
      return mergedUnseen;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to fetch notifications';
      dispatch(setAlert({ text: msg, color: 'error' }));
      return rejectWithValue(error.response?.data || { message: msg });
    }
  }
);

export const markNotificationSeen = createAsyncThunk(
  'notifications/markSeen',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const token = await localStorage.getItem('token');
      if (!token) return id;
      await axios.put(`${BASE_URL}/notifications/${id}/seen`, {}, { headers: { Authorization: `Bearer ${token}` } });
      return id;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to mark notification as seen';
      dispatch(setAlert({ text: msg, color: 'error' }));
      return rejectWithValue(error.response?.data || { message: msg });
    }
  }
);

export const clearAllNotifications = createAsyncThunk(
  'notifications/clearAll',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const token = await localStorage.getItem('token');
      if (!token) {
        try { localStorage.removeItem(STORAGE_KEY); } catch {}
        return true;
      }
      await axios.delete(`${BASE_URL}/notifications`, { headers: { Authorization: `Bearer ${token}` } });
      try { localStorage.removeItem(STORAGE_KEY); } catch {}
      return true;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to clear notifications';
      dispatch(setAlert({ text: msg, color: 'error' }));
      return rejectWithValue(error.response?.data || { message: msg });
    }
  }
);

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: {
    items: [],
    unread: 0,
    loading: false,
    message: '',
    isError: false,
  },
  reducers: {
    receiveNotification: (state, action) => {
      const data = action.payload || {};
      const msg = formatMessage({ payload: data, type: data?.type, message: data?.message });
      const item = {
        _id: Math.random().toString(36).slice(2),
        message: msg,
        type: data?.type || 'notify',
        payload: data || {},
        createdAt: new Date().toISOString(),
        seen: false,
      };
      state.items = [item, ...state.items].slice(0, 100);
      state.unread = state.unread + 1;
      saveCache(state.items);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.message = 'Fetching notifications...';
        state.isError = false;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload) ? action.payload : [];
        state.unread = state.items.filter((n) => !n.seen).length;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.isError = true;
        state.message = action.payload?.message || 'Failed to fetch notifications';
      })
      .addCase(markNotificationSeen.fulfilled, (state, action) => {
        const id = action.payload;
        state.items = state.items.filter((n) => n._id !== id);
        state.unread = state.unread > 0 ? state.unread - 1 : 0;
        saveCache(state.items);
      })
      .addCase(clearAllNotifications.fulfilled, (state) => {
        state.items = [];
        state.unread = 0;
      });
  },
});

export const { receiveNotification } = notificationsSlice.actions;
export default notificationsSlice.reducer;

