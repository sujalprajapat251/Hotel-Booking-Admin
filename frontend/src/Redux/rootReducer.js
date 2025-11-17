import { combineReducers } from "redux";
import alertSlice from "./Slice/alert.slice";
import roomtypesSlice from "./Slice/roomtypesSlice";
import featuresSlice from "./Slice/featuresSlice";
import roomsSlice from "./Slice/createRoomSlice";

export const rootReducer = combineReducers({
    alert:alertSlice,
    roomtypes:roomtypesSlice,
    features:featuresSlice,
    rooms:roomsSlice
});