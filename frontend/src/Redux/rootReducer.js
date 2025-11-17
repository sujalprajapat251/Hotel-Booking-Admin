import { combineReducers } from "redux";
import alertSlice from "./Slice/alert.slice";
import roomtypesSlice from "./Slice/roomtypesSlice";
import featuresSlice from "./Slice/featuresSlice";
import roomsSlice from "./Slice/createRoomSlice";
import contactSlice from "./Slice/contactSlice";

export const rootReducer = combineReducers({
    alert:alertSlice,
    roomtypes:roomtypesSlice,
    features:featuresSlice,
    rooms:roomsSlice,
    contact:contactSlice
});