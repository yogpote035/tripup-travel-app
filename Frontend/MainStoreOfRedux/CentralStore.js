import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../AllStatesFeatures/Authentication/authSlice";
import trainReducer from "../AllStatesFeatures/Train/trainSlice";
let Store = {};
export default Store = configureStore({
  reducer: {
    auth: authReducer,
    train: trainReducer,
  },
});
