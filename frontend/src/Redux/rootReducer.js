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
import blogSlice from "./Slice/blogSlice";
import termsSlice from "./Slice/terms.slice";
import cafeSlice from "./Slice/cafeitemSlice";
import barSlice from "./Slice/baritemSlice";
import cafecategorySlice from "./Slice/cafecategorySlice";
import barcategorySlice from "./Slice/barcategorySlice";
import aboutSlice from "./Slice/about.slice";
import cafeTableSlice from "./Slice/cafeTable.slice";
import waiterSlice from "./Slice/Waiter.slice"
import chefSlice from "./Slice/Chef.slice"
import restaurantSlice from "./Slice/restaurantitemSlice"
import restaurantcategorySlice from "./Slice/restaurantcategorySlice"
import cabSlice from "./Slice/cab.slice";
import driverSlice from "./Slice/driverSlice";
import cabBookingSlice from "./Slice/cabBookingSlice";
import hodSlice from "./Slice/hod.slice";
import accountantSlice from "./Slice/Accountant.slice";
import reviewSlice from "./Slice/review.slice";
import housekeepingSlice from "./Slice/housekeepingSlice";
import viewOrderSlice from "./Slice/vieworederadmin.slice";

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
    housekeeping:housekeepingSlice,
    department:departmentSlice,
    staff:staffSlice,
    blog:blogSlice,
    terms:termsSlice,
    cafe:cafeSlice,
    bar:barSlice,
    cafecategory:cafecategorySlice,
    barcategory:barcategorySlice,
    about:aboutSlice,
    cafeTable:cafeTableSlice,
    waiter:waiterSlice,
    chef:chefSlice,
    restaurant:restaurantSlice,
    restaurantcategory:restaurantcategorySlice,
    cab:cabSlice,
    driver:driverSlice,
    cabBooking:cabBookingSlice,
    hod:hodSlice,
    accountant:accountantSlice,
    review: reviewSlice,
    vieworder: viewOrderSlice
});