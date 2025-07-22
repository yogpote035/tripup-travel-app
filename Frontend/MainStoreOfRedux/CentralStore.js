import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../AllStatesFeatures/Authentication/authSlice";
let Store = {};
export default Store = configureStore({
  reducer: {
    auth: authReducer,
  },
});
