import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { BASE_URL } from "../../Utils/baseUrl";
import { setAlert } from "./alert.slice";

const handleErrors = (error, dispatch, rejectWithValue) => {
    const errorMessage = error.response?.data?.message || "An error occurred";
    dispatch(setAlert({ text: errorMessage, color: "error" }));
    return rejectWithValue(error.response?.data || { message: errorMessage });
};

//  Create Cab Booking
export const createCabBooking = createAsyncThunk(
    "cabBooking/create",
    async (bookingData, { dispatch, rejectWithValue }) => {
        try {
            const token = localStorage.getItem("token");

            const response = await axios.post(
                `${BASE_URL}/createcabbooking`,
                bookingData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            dispatch(setAlert({ text: "Cab booking created successfully", color: "success" }));

            return response.data.data;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

//  Get All Cab Bookings
export const getAllCabBookings = createAsyncThunk(
    "cabBooking/getAll",
    async (params, { dispatch, rejectWithValue }) => {
        try {
            const token = localStorage.getItem("token");

            const response = await axios.get(`${BASE_URL}/getallcabbooking`, {
                headers: { Authorization: `Bearer ${token}` },
                params,
            });

            return {
                list: response.data.data || [],
                count: response.data.count ?? (response.data.data ? response.data.data.length : 0),
            };
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

//  Get Single Cab Booking
export const getCabBooking = createAsyncThunk(
    "cabBooking/getOne",
    async (id, { dispatch, rejectWithValue }) => {
        try {
            const response = await axios.get(`${BASE_URL}/getcabbooking/${id}`);
            return response.data.data;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

//  Get Cab Bookings by Booking ID
export const getCabBookingsByBooking = createAsyncThunk(
    "cabBooking/getByBooking",
    async (bookingId, { dispatch, rejectWithValue }) => {
        try {
            const response = await axios.get(
                `${BASE_URL}/getcabbookingsbybooking/${bookingId}`
            );
            return response.data.data;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

//  Update Cab Booking
export const updateCabBooking = createAsyncThunk(
    "cabBooking/update",
    async ({ id, updateData }, { dispatch, rejectWithValue }) => {
        try {
            const token = localStorage.getItem("token");

            const response = await axios.put(
                `${BASE_URL}/updatecabbooking/${id}`,
                updateData,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            dispatch(setAlert({ text: "Cab booking updated successfully", color: "success" }));

            return response.data.data;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

//  Delete Cab Booking
export const deleteCabBooking = createAsyncThunk(
    "cabBooking/delete",
    async (id, { dispatch, rejectWithValue }) => {
        try {
            const token = localStorage.getItem("token");

            await axios.delete(`${BASE_URL}/deletecabbooking/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            dispatch(setAlert({ text: "Cab booking deleted successfully", color: "success" }));

            return id;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

//  Advance Cab Booking Status (for drivers)
export const advanceCabBookingStatus = createAsyncThunk(
    "cabBooking/advanceStatus",
    async (id, { dispatch, rejectWithValue }) => {
        try {
            const token = localStorage.getItem("token");

            const response = await axios.put(
                `${BASE_URL}/cabbooking/${id}/status`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            dispatch(setAlert({ 
                text: response.data.message || "Status updated successfully", 
                color: "success" 
            }));

            return response.data.data;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

// ------------------------------------------------------------------------------------

const cabBookingSlice = createSlice({
    name: "cabBooking",
    initialState: {
        cabBookings: [],
        selectedCabBooking: null,
        byBookingList: [],
        loading: false,
        isError: false,
        message: "",
        totalCount: 0,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder

            //  CREATE
            .addCase(createCabBooking.pending, (state) => {
                state.loading = true;
                state.isError = false;
                state.message = "";
            })
            .addCase(createCabBooking.fulfilled, (state, action) => {
                state.loading = false;
                state.cabBookings.push(action.payload);
                state.totalCount += 1;
            })
            .addCase(createCabBooking.rejected, (state, action) => {
                state.loading = false;
                state.isError = true;
                state.message = action.payload?.message;
            })

            //  GET ALL
            .addCase(getAllCabBookings.pending, (state) => {
                state.loading = true;
                state.isError = false;
                state.message = "";
            })
            .addCase(getAllCabBookings.fulfilled, (state, action) => {
                state.loading = false;
                state.cabBookings = action.payload.list;
                state.totalCount = action.payload.count;
            })
            .addCase(getAllCabBookings.rejected, (state, action) => {
                state.loading = false;
                state.isError = true;
                state.message = action.payload?.message;
            })

            //  GET ONE
            .addCase(getCabBooking.pending, (state) => {
                state.loading = true;
            })
            .addCase(getCabBooking.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedCabBooking = action.payload;
            })
            .addCase(getCabBooking.rejected, (state, action) => {
                state.loading = false;
                state.isError = true;
                state.message = action.payload?.message;
            })

            //  GET BY BOOKING ID
            .addCase(getCabBookingsByBooking.fulfilled, (state, action) => {
                state.byBookingList = action.payload;
            })

            //  UPDATE
            .addCase(updateCabBooking.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.cabBookings.findIndex(
                    (item) => item._id === action.payload._id
                );
                if (index !== -1) state.cabBookings[index] = action.payload;
            })

            //  DELETE
            .addCase(deleteCabBooking.fulfilled, (state, action) => {
                state.cabBookings = state.cabBookings.filter((item) => item._id !== action.payload);
                if (state.totalCount > 0) {
                    state.totalCount -= 1;
                }
            })

            //  ADVANCE STATUS
            .addCase(advanceCabBookingStatus.pending, (state) => {
                state.loading = true;
                state.isError = false;
            })
            .addCase(advanceCabBookingStatus.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.cabBookings.findIndex(
                    (item) => item._id === action.payload._id
                );
                if (index !== -1) {
                    state.cabBookings[index] = action.payload;
                }
            })
            .addCase(advanceCabBookingStatus.rejected, (state, action) => {
                state.loading = false;
                state.isError = true;
                state.message = action.payload?.message;
            });
    },
});

export default cabBookingSlice.reducer;
