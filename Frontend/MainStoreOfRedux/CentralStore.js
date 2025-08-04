import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../AllStatesFeatures/Authentication/authSlice";
import trainReducer from "../AllStatesFeatures/Train/AllTrainsSlice";
import bookingReducer from "../AllStatesFeatures/Train/BookTrainTicketSlice";
import userProfileReducer from "../AllStatesFeatures/UserProfile/userProfileSlice";
import busReducer from "../AllStatesFeatures/Bus/AllBusSlice";
import BookBusReducer from "../AllStatesFeatures/Bus/BookBusTicketSlice";
import flightReducer from "../AllStatesFeatures/Flight/AllFlightSlice";
import flightBookingReducer from "../AllStatesFeatures/Flight/BookFlightSeatSlice";

let Store = {}; //initialize because export default
export default Store = configureStore({
  reducer: {
    auth: authReducer, //login signup
    train: trainReducer, //for Get All Train Between Source And Destination
    bookTrainTicket: bookingReducer, //book train seat
    userProfile: userProfileReducer, // user profile
    bus: busReducer, // get All Buses
    BookBusTicket: BookBusReducer, // get All Buses
    flight: flightReducer, // search all flight
    BookFlightTicket: flightBookingReducer,
  },
});
