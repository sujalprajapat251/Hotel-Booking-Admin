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

// export const addFaq = createAsyncThunk(
//     'faq/addFaq',
//     async (faqData, { dispatch, rejectWithValue }) => {
//         try {
//             const token = await localStorage.getItem("token");
//             const response = await axios.post(`${BASE_URL}/createfaq`, faqData,
//                 {
//                     headers: {
//                         Authorization: `Bearer ${token}`,
//                     }
//                 }
//             );
//             dispatch(setAlert({ text: response.data.message, color: 'success' }));
//             return response.data.data;
//         } catch (error) {
//             return handleErrors(error, dispatch, rejectWithValue);
//         }
//     }
// );

export const getAllStaff = createAsyncThunk(
    'staff/getAllStaff',
    async (_, { dispatch, rejectWithValue }) => {
        try {
            const token = await localStorage.getItem("token");
            const response = await axios.get(`${BASE_URL}/getallstaff`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                }
            );
            return response.data.data;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

// export const updateFaq = createAsyncThunk(
//     'faq/updateFaq',
//     async ({ faqId, faqData }, { dispatch, rejectWithValue }) => {
//         try {
//             const token = await localStorage.getItem("token");
//             const response = await axios.put(`${BASE_URL}/updatefaq/${faqId}`,faqData,
//                 {
//                     headers: {
//                         Authorization: `Bearer ${token}`,
//                     }
//                 }
//             );
//             dispatch(setAlert({ text: response.data.message || 'FAQ updated successfully', color: 'success' }));
//             return response.data.data; 
//         } catch (error) {
//             return handleErrors(error, dispatch, rejectWithValue);
//         }
//     }
// );


// export const deleteFaq = createAsyncThunk(
//     'faq/deleteFaq',
//     async (faqId, { dispatch, rejectWithValue }) => {
//         try {
//             const token = await localStorage.getItem("token");
//             const response = await axios.delete(`${BASE_URL}/deletetfaq/${faqId}`, {
//                 headers: {
//                     Authorization: `Bearer ${token}`,
//                 }
//             });
//             dispatch(setAlert({ text: response.data.message || 'FAQ deleted successfully', color: 'success' }));
//             return faqId; 
//         } catch (error) {
//             return handleErrors(error, dispatch, rejectWithValue);
//         }
//     }
// );

const staffSlice = createSlice({
    name: 'staff',
    initialState: {
        staff: [],
        message: '',
        loading: false,
        isError: false,
    },
    extraReducers: (builder) => {
        builder
            // .addCase(addFaq.pending, (state) => {
            //     state.loading = true;
            //     state.message = 'Adding FAQ...';
            //     state.isError = false;
            // })
            // .addCase(addFaq.fulfilled, (state, action) => {
            //     state.loading = false;
            //     state.success = true;
            //     state.message = 'FAQ added successfully..!';
            //     state.faqs.push(action.payload); 
            //     state.isError = false;
            // })
            // .addCase(addFaq.rejected, (state, action) => {
            //     state.loading = false;
            //     state.success = false;
            //     state.isError = true;
            //     state.message = action.payload?.message || 'Failed to add FAQ';
            // })
            .addCase(getAllStaff.pending, (state) => {
                state.loading = true;
                state.message = 'Fetching staff...';
                state.isError = false;
            })
            .addCase(getAllStaff.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = 'staff fetched successfully..!';
                state.staff = action.payload;
                state.isError = false;
            })
            .addCase(getAllStaff.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.isError = true;
                state.message = action.payload?.message || 'Failed to fetch staff';
            });
            // .addCase(updateFaq.pending, (state) => {
            //     state.loading = true;
            //     state.message = 'Updating FAQ...';
            //     state.isError = false;
            // })
            // .addCase(updateFaq.fulfilled, (state, action) => {
            //     state.loading = false;
            //     state.success = true;
            //     state.message = 'FAQ updated successfully..!';
            //     state.faqs = state.faqs.map(faq => faq._id === action.payload._id ? action.payload : faq);
            //     state.isError = false;
            // })
            // .addCase(updateFaq.rejected, (state, action) => {
            //     state.loading = false;
            //     state.success = false;
            //     state.isError = true;
            //     state.message = action.payload?.message || 'Failed to update FAQ';
            // })
            // .addCase(deleteFaq.pending, (state) => {
            //     state.loading = true;
            //     state.message = 'Deleting FAQ...';
            //     state.isError = false;
            // })
            // .addCase(deleteFaq.fulfilled, (state, action) => {
            //     state.loading = false;
            //     state.success = true;
            //     state.message = 'FAQ deleted successfully..!';
            //     state.faqs = state.faqs.filter(faq => faq._id !== action.payload);
            //     state.isError = false;
            // })
            // .addCase(deleteFaq.rejected, (state, action) => {
            //     state.loading = false;
            //     state.success = false;
            //     state.isError = true;
            //     state.message = action.payload?.message || 'Failed to delete FAQ';
            // });
    },
});

export default staffSlice.reducer;
