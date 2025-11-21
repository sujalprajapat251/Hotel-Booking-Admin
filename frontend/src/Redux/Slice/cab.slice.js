import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { BASE_URL } from "../../Utils/baseUrl";
import { setAlert } from "./alert.slice";

const handleErrors = (error, dispatch, rejectWithValue) => {
    const errorMessage = error.response?.data?.message || "An error occurred";
    dispatch(setAlert({ text: errorMessage, color: "error" }));
    return rejectWithValue(error.response?.data || { message: errorMessage });
};

//  Get All Cabs
export const getAllCabs = createAsyncThunk(
    "cab/getAll",
    async (_, { dispatch, rejectWithValue }) => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${BASE_URL}/getallcab`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

//  Create Cab (with image upload)
export const createCab = createAsyncThunk(
    "cab/create",
    async (cabData, { dispatch, rejectWithValue }) => {
        try {
            const formData = new FormData();
            for (let key in cabData) {
                formData.append(key, cabData[key]);
            }

            const token = localStorage.getItem("token");
            const response = await axios.post(`${BASE_URL}/createcab`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });

            dispatch(setAlert({ text: "Cab created successfully", color: "success" }));
            return response.data.cab;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

//  Update Cab
export const updateCab = createAsyncThunk(
    "cab/update",
    async (cabData, { dispatch, rejectWithValue }) => {
        try {
            const { _id, ...updateFields } = cabData;
            const formData = new FormData();
            Object.entries(updateFields).forEach(([key, value]) => {
                if (value !== undefined) formData.append(key, value);
            });
            const token = localStorage.getItem("token");
            const response = await axios.put(`${BASE_URL}/updatecab/${_id}`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });
            dispatch(setAlert({ text: "Cab updated successfully", color: "success" }));
            return response.data.cab;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

//  Delete Cab
export const deleteCab = createAsyncThunk(
    "cab/delete",
    async (id, { dispatch, rejectWithValue }) => {
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`${BASE_URL}/deletecab/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            dispatch(setAlert({ text: "Cab deleted successfully", color: "success" }));
            return id;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

//  Toggle Cab Status
export const toggleCabStatus = createAsyncThunk(
    "cab/toggleStatus",
    async (id, { dispatch, rejectWithValue }) => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.put(`${BASE_URL}/cabs/${id}/status`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });

            return response.data.cab;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

const cabSlice = createSlice({
    name: "cab",
    initialState: {
        cabs: [],
        loading: false,
        message: "",
        isError: false,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Get All
            .addCase(getAllCabs.pending, (state) => {
                state.loading = true;
                state.isError = false;
            })
            .addCase(getAllCabs.fulfilled, (state, action) => {
                state.loading = false;
                state.cabs = action.payload;
            })
            .addCase(getAllCabs.rejected, (state, action) => {
                state.loading = false;
                state.isError = true;
                state.message = action.payload?.message;
            })

            // Create
            .addCase(createCab.pending, (state) => {
                state.loading = true;
            })
            .addCase(createCab.fulfilled, (state, action) => {
                state.loading = false;
                state.cabs.push(action.payload);
            })
            .addCase(createCab.rejected, (state, action) => {
                state.loading = false;
                state.isError = true;
                state.message = action.payload?.message;
            })

            // Update
            .addCase(updateCab.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.cabs.findIndex((cab) => cab._id === action.payload._id);
                if (index !== -1) state.cabs[index] = action.payload;
            })

            // Delete
            .addCase(deleteCab.fulfilled, (state, action) => {
                state.cabs = state.cabs.filter((cab) => cab._id !== action.payload);
            })

            // Toggle Status
            .addCase(toggleCabStatus.fulfilled, (state, action) => {
                const index = state.cabs.findIndex((cab) => cab._id === action.payload._id);
                if (index !== -1) state.cabs[index] = action.payload;
            });
    },
});

export default cabSlice.reducer;
