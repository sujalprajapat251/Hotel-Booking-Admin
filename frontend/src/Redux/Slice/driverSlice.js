import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { BASE_URL } from "../../Utils/baseUrl";
import { setAlert } from "./alert.slice";

// Error handler
const handleErrors = (error, dispatch, rejectWithValue) => {
    const errorMessage = error.response?.data?.message || "An error occurred";
    dispatch(setAlert({ text: errorMessage, color: "error" }));
    return rejectWithValue(error.response?.data || { message: errorMessage });
};

// --------------- GET ALL DRIVERS ----------------
export const getAllDrivers = createAsyncThunk(
    "driver/getAll",
    async (_, { dispatch, rejectWithValue }) => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${BASE_URL}/getalldriver`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data.drivers;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

// --------------- CREATE DRIVER (with image) ----------------
export const createDriver = createAsyncThunk(
    "driver/create",
    async (driverData, { dispatch, rejectWithValue }) => {
        try {
            const formData = new FormData();
            // Add designation: "Driver" to ensure it's created as a driver
            formData.append("designation", "Driver");
            
            // Required fields for driver creation
            const requiredFields = ['name', 'email', 'password', 'countrycode', 'mobileno', 'address', 'gender', 'joiningdate', 'designation'];
            
            for (let key in driverData) {
                // Skip _id, fullMobile, and existingImage for new driver
                if (key === "_id" || key === "fullMobile" || key === "existingImage") {
                    continue;
                }
                
                const value = driverData[key];
                
                // Skip null and undefined
                if (value === null || value === undefined) {
                    // But if it's a required field, we should have caught this in frontend validation
                    continue;
                }
                
                // For optional fields (like AssignedCab, image), skip empty strings
                if (!requiredFields.includes(key)) {
                    if (typeof value === 'string' && value.trim() === '') {
                        continue;
                    }
                    if (key === 'AssignedCab' && (value === '' || value === null)) {
                        continue;
                    }
                }
                
                // Append the value (required fields should always have values at this point)
                formData.append(key, value);
            }

            const token = localStorage.getItem("token");
            const response = await axios.post(`${BASE_URL}/createstaff`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data"
                }
            });

            dispatch(setAlert({ text: "Driver created successfully", color: "success" }));

            return response.data.data;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

// --------------- GET DRIVER BY ID ----------------
export const getDriverById = createAsyncThunk(
    "driver/getById",
    async (id, { dispatch, rejectWithValue }) => {
        try {
            const response = await axios.get(`${BASE_URL}/getdriver/${id}`);
            return response.data.driver;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

// --------------- UPDATE DRIVER ----------------
export const updateDriver = createAsyncThunk(
    "driver/update",
    async (driverData, { dispatch, rejectWithValue }) => {
        try {
            const { _id, ...updateFields } = driverData;

            const formData = new FormData();
            
            // Ensure designation is "Driver" when updating (but don't duplicate if already present)
            // Remove designation from updateFields if it exists to avoid duplication
            const { designation, ...restFields } = updateFields;
            formData.append("designation", "Driver");
            
            // Append all other fields
            Object.entries(restFields).forEach(([key, value]) => {
                // Skip fields that shouldn't be sent
                if (key === "fullMobile" || key === "existingImage") {
                    return;
                }
                if (value !== undefined && value !== null) {
                    formData.append(key, value);
                }
            });

            const token = localStorage.getItem("token");
            const response = await axios.put(
                `${BASE_URL}/updatestaff/${_id}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data"
                    }
                }
            );

            dispatch(setAlert({ text: "Driver updated successfully", color: "success" }));

            return response.data.data;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

// --------------- DELETE DRIVER ----------------
export const deleteDriver = createAsyncThunk(
    "driver/delete",
    async (id, { dispatch, rejectWithValue }) => {
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`${BASE_URL}/deletetstaff/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            dispatch(setAlert({ text: "Driver deleted successfully", color: "success" }));

            return id;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

// --------------- SLICE ----------------
const driverSlice = createSlice({
    name: "driver",
    initialState: {
        drivers: [],
        driverDetails: null,
        loading: false,
        isError: false,
        message: ""
    },
    reducers: {},
    extraReducers: (builder) => {
        builder

            // GET ALL
            .addCase(getAllDrivers.pending, (state) => {
                state.loading = true;
                state.isError = false;
            })
            .addCase(getAllDrivers.fulfilled, (state, action) => {
                state.loading = false;
                state.drivers = action.payload;
            })
            .addCase(getAllDrivers.rejected, (state, action) => {
                state.loading = false;
                state.isError = true;
                state.message = action.payload?.message;
            })

            // CREATE DRIVER
            .addCase(createDriver.pending, (state) => {
                state.loading = true;
            })
            .addCase(createDriver.fulfilled, (state, action) => {
                state.loading = false;
                state.drivers.push(action.payload);
            })
            .addCase(createDriver.rejected, (state, action) => {
                state.loading = false;
                state.isError = true;
                state.message = action.payload?.message;
            })

            // GET BY ID
            .addCase(getDriverById.fulfilled, (state, action) => {
                state.driverDetails = action.payload;
            })

            // UPDATE DRIVER
            .addCase(updateDriver.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.drivers.findIndex(
                    (driver) => driver._id === action.payload._id
                );
                if (index !== -1) {
                    state.drivers[index] = action.payload;
                }
            })

            // DELETE DRIVER
            .addCase(deleteDriver.fulfilled, (state, action) => {
                state.drivers = state.drivers.filter(
                    (driver) => driver._id !== action.payload
                );
            });
    }
});

export default driverSlice.reducer;
