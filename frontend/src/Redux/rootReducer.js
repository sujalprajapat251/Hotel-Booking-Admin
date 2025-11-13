import { combineReducers } from "redux";
import alertSlice from "./Slice/alert.slice";


export const rootReducer = combineReducers({
    alert:alertSlice
});