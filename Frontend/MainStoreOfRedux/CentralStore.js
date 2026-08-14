import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../AllStatesFeatures/Authentication/authSlice";
import trainReducer from "../AllStatesFeatures/Train/AllTrainsSlice";
import bookingReducer from "../AllStatesFeatures/Train/BookTrainTicketSlice";
import userProfileReducer from "../AllStatesFeatures/UserProfile/UserProfileSlice";
import busReducer from "../AllStatesFeatures/Bus/AllBusSlice";
import BookBusReducer from "../AllStatesFeatures/Bus/BookBusTicketSlice";
import flightReducer from "../AllStatesFeatures/Flight/AllFlightSlice";
import flightBookingReducer from "../AllStatesFeatures/Flight/BookFlightSeatSlice";
import itineraryReducer from "../AllStatesFeatures/Itinerary/AllItinerarySlice";
import SocialMediaReducer from "../AllStatesFeatures/SocialFeed/SocialFeedSlice";
import savedPostsReducer from "../AllStatesFeatures/SocialFeed/savedPostsSlice";
import likedPostsReducer from "../AllStatesFeatures/SocialFeed/likedPostsSlice";
import locationReducer from "../AllStatesFeatures/Location/locationSlice";
import RecentActivityReducer from "../AllStatesFeatures/Recent Activity/RecentActivitySlice";
import themeReducer from "../AllStatesFeatures/Theme/ThemeSlice";
import adminReducer from "../AllStatesFeatures/Admin/AdminSlice";
import notificationsReducer from "../AllStatesFeatures/Notifications/NotificationsSlice";

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
    itinerary: itineraryReducer, //for all itinerary and add ,delete
    socialFeed: SocialMediaReducer,
    savedPosts: savedPostsReducer, // saved/bookmarked posts
    likedPosts: likedPostsReducer,
    locations: locationReducer, // locations with reviews and posts
    recentActivity: RecentActivityReducer, // for recent activity
    theme: themeReducer,
    notifications: notificationsReducer,
    admin: adminReducer,
  },
});
