import { combineReducers } from "redux";
import alertSlice from "./Slice/alert.slice";
import roomtypesSlice from "./Slice/roomtypesSlice";
import featuresSlice from "./Slice/featuresSlice";
import userSlice from "./Slice/user.slice";

export const rootReducer = combineReducers({
    alert:alertSlice,
    roomtypes:roomtypesSlice,
    features:featuresSlice,
    user:userSlice
});