import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../AllStatesFeatures/Authentication/authSlice";
import trainReducer from "../AllStatesFeatures/Train/AllTrainsSlice";
import bookingReducer from "../AllStatesFeatures/Train/BookTrainTicketSlice";
import userProfileReducer from "../AllStatesFeatures/UserProfile/userProfileSlice";
let Store = {}; //initialize because export default
export default Store = configureStore({
  reducer: {
    auth: authReducer,
    train: trainReducer, //for Get All Train Between Source And Destination
    bookTrainTicket: bookingReducer,
    userProfile: userProfileReducer,
  },
});
