import { combineReducers } from "redux";
import alertSlice from "./Slice/alert.slice";
import roomtypesSlice from "./Slice/roomtypesSlice";
import featuresSlice from "./Slice/featuresSlice";
import roomsSlice from "./Slice/createRoomSlice";
import contactSlice from "./Slice/contactSlice";
import userSlice from "./Slice/user.slice";
import faqSlice from "./Slice/faq.slice";
import authSlice from "./Slice/auth.slice";
import bookingSlice from "./Slice/bookingSlice";
import departmentSlice from "./Slice/department.slice";
import staffSlice from "./Slice/staff.slice";

export const rootReducer = combineReducers({
    alert:alertSlice,
    auth:authSlice,
    roomtypes:roomtypesSlice,
    features:featuresSlice,
    rooms:roomsSlice,
    contact:contactSlice, 
    user:userSlice,
    faq:faqSlice,
    booking:bookingSlice,
    department:departmentSlice,
    staff:staffSlice,
});