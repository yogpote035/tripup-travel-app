import "./App.css";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { setAccessToken, setAuthInitialized } from "../AllStatesFeatures/Authentication/authSlice";
import io from 'socket.io-client';
import { receiveNotification, fetchUnreadCount } from "../AllStatesFeatures/Notifications/NotificationsSlice";
import { Route, Routes, useLocation } from "react-router-dom";
import Login from "./components/Authentication/Login.jsx";
import Signup from "./components/Authentication/Signup.jsx";
import ForgotPassword from "./components/Authentication/ForgotPassword.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "./General/Navbar.jsx";
import Home from "./components/Home/Home.jsx";
import Footer from "./General/Footer.jsx";
import Bookings from "./components/Booking/Booking.jsx";
import Itinerary from "./components/Itinerary/Itinerary.jsx";
import ItineraryPublicView from "./components/Itinerary/ItineraryPublicView.jsx";
import TrainPage from "./components/Train/TrainPage.jsx";
import TrainSeatBooking from "./components/Train/TrainSeatBooking.jsx";
import MyTrainBookings from "./components/Train/MyTrainBookings.jsx";
import ProtectedRoutes from "./General/ProtectedRoutes.jsx";
import ViewProfile from "./components/UserProfile/ViewProfile.jsx";
import BusPage from "./components/Bus/BusPage.jsx";
import BusSeatSelect from "./components/Bus/BusSeatSelect.jsx";
import BusBookingForm from "./components/Bus/BusBookingForm.jsx";
import MyBusBookings from "./components/Bus/MyBusBookings.jsx";
import FlightSearch from "./components/Flight/FlightSearch.jsx";
import FlightSeatSelection from "./components/Flight/FlightSeatSelection.jsx";
import FlightBookingForm from "./components/Flight/FlightBookingForm.jsx";
import MyFlightBookings from "./components/Flight/MyFlightBookings.jsx";
import PrivacyPolicy from "./components/PrivacyPolicy/PrivacyPolicy.jsx";
import TermsAndConditions from "./components/TermsAndConditions/TermsAndConditions.jsx";
import ContactUs from "./components/ContactUs/ContactUs.jsx";
import RecentActivity from "./components/RecentActivity/RecentActivity.jsx";
import ItineraryForm from "./components/Itinerary/ItineraryForm.jsx";
import CreatePost from "./components/SocialFeed/CreatePost.jsx";
import PostsFeed from "./components/SocialFeed/PostsFeed.jsx";
import SinglePostView from "./components/SocialFeed/SinglePostView.jsx";
import EditPost from "./components/SocialFeed/EditPost.jsx";
import SavedPostsPage from "./components/SocialFeed/SavedPostsPage.jsx";
import LikedPostsPage from "./components/SocialFeed/LikedPostsPage.jsx";
import LocationBrowser from "./components/General/LocationBrowser.jsx";
import LocationDetail from "./components/General/LocationDetail.jsx";
import PageNotFound from "./General/PageNotFound.jsx";
import AdminLogin from "./components/Admin/AdminLogin.jsx";
import AdminLayout from "./components/Admin/AdminLayout.jsx";
import AdminProtectedRoute from "./components/Admin/AdminProtectedRoute.jsx";
import AdminDashboard from "./components/Admin/AdminDashboard.jsx";
import AdminUsers from "./components/Admin/AdminUsers.jsx";
import AdminBookings from "./components/Admin/AdminBookings.jsx";
import AdminPosts from "./components/Admin/AdminPosts.jsx";
import AdminAdministrators from "./components/Admin/AdminAdministrators.jsx";
import AdminFlights from "./components/Admin/AdminFlights.jsx";
import AdminTrains from "./components/Admin/AdminTrains.jsx";
import AdminBuses from "./components/Admin/AdminBuses.jsx";
import AdminAnnouncements from "./components/Admin/AdminAnnouncements.jsx";
import AdminAuditLogs from "./components/Admin/AdminAuditLogs.jsx";
import AdminSystemStatus from "./components/Admin/AdminSystemStatus.jsx";
import AdminBackupManager from "./components/Admin/AdminBackupManager.jsx";
import AdminLocations from "./components/Admin/AdminLocations.jsx";
import AdminHotels from "./components/Admin/AdminHotels.jsx";
import BookingHistory from "./components/Booking/BookingHistory.jsx";
import HotelSearch from "./components/Hotel/HotelSearch.jsx";
import HotelBookingHistory from "./components/Hotel/HotelBookingHistory.jsx";
import "./components/Admin/admin.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || `${window.location.protocol}//${window.location.hostname}:5000/api`;
let bootstrapRefreshPromise = null;

function App() {
  const dispatch = useDispatch();

  const theme = useSelector((state) => state.theme?.mode || "light");
  const location = useLocation();
  const isAdminArea = location.pathname.startsWith("/admin");

  useEffect(() => {
    if (typeof document !== "undefined") {
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, [theme]);

  useEffect(() => {
    let mounted = true;
    async function bootstrap() {
      dispatch(setAuthInitialized(false));

      try {
        if (!bootstrapRefreshPromise) {
          bootstrapRefreshPromise = axios.post(`${API_BASE_URL}/auth/refresh`, {}, { withCredentials: true })
            .finally(() => { bootstrapRefreshPromise = null; });
        }
        const res = await bootstrapRefreshPromise;
        if (res.status === 200 && mounted) {
          const token = res.data?.data?.accessToken;
          dispatch(setAccessToken(token));
        }
      } catch {
        // A login can complete while the initial refresh request is still in
        // flight. Do not let a stale 401 from that refresh clear the freshly
        // issued access token and immediately redirect the user back to login.
        if (mounted && !localStorage.getItem("token")) {
          dispatch(setAccessToken(null));
        }
      } finally {
        if (mounted) {
          dispatch(setAuthInitialized(true));
        }
      }
    }

    bootstrap();
    return () => (mounted = false);
  }, [dispatch]);

  useEffect(() => {
    // socket handled in separate effect when `user` is available
  }, [dispatch]);

  const user = useSelector((s) => s.auth.user);

  useEffect(() => {
    let socket;
    if (!user) return () => { };

    try {
      // Extract backend URL from API_BASE_URL and normalize trailing slashes
      const backendUrl = String(API_BASE_URL || "http://localhost:5000/api").replace(/\/?api\/?$/, '').replace(/\/$/, '') || "http://localhost:5000";
      socket = io(backendUrl, { withCredentials: true, transports: ['polling', 'websocket'], path: '/socket.io' });
      socket.on('connect', () => {
        socket.emit('join', user.userId || user._id || user.id);
      });
      socket.on('connect_error', (error) => {
        console.error('socket connect error', error);
      });
      socket.on('disconnect', (reason) => {
        console.warn('socket disconnected', reason);
      });
      socket.on('notification', (n) => {
        try { dispatch(receiveNotification(n)); } catch (e) { console.error(e); }
      });
      socket.on('notification:announcement', (n) => {
        try { dispatch(receiveNotification({ id: `ann-${Date.now()}`, title: n.title, message: n.message, createdAt: n.createdAt })); } catch (e) { console.error(e); }
      });
      dispatch(fetchUnreadCount());
    } catch (e) {
      console.error('socket init failed', e);
    }

    return () => {
      try { if (socket) socket.disconnect(); } catch (e) { }
    };
  }, [user, dispatch]);

  return (
    <>
      <div className={`flex flex-col min-h-screen ${theme === "dark" ? "bg-stone-950 text-stone-100" : "bg-orange-50 text-stone-900"}`}>
        {!isAdminArea && <Navbar />}
        {!isAdminArea && <div className="mb-10"></div>}
        <main className={`flex-grow ${theme === "dark" ? "bg-stone-950" : "bg-orange-50"}`}>
          <Routes>
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="bookings" element={<AdminBookings />} />
              <Route path="posts" element={<AdminPosts />} />
              <Route path="announcements" element={<AdminAnnouncements />} />
              <Route path="administrators" element={<AdminAdministrators />} />
              <Route path="flights" element={<AdminFlights />} />
              <Route path="trains" element={<AdminTrains />} />
              <Route path="buses" element={<AdminBuses />} />
              <Route path="locations" element={<AdminLocations />} />
              <Route path="audit-logs" element={<AdminAuditLogs />} />
              <Route path="system-status" element={<AdminSystemStatus />} />
              <Route path="backups" element={<AdminBackupManager />} />
              <Route path="hotels" element={<AdminHotels />} />
            </Route>
            <Route exact path="/" element={<Home />} />
            <Route exact path="/login" element={<Login />} />
            <Route exact path="/signup" element={<Signup />} />
            <Route exact path="/forgot-password" element={<ForgotPassword />} />
            <Route exact path="/reset-password" element={<ForgotPassword />} />
            <Route
              exact
              path="/bookings"
              element={
                <ProtectedRoutes>
                  <Bookings />
                </ProtectedRoutes>
              }
            />
            <Route path="/booking-history" element={<ProtectedRoutes><BookingHistory /></ProtectedRoutes>} />
            <Route
              path="/bookings/hotels"
              element={
                <ProtectedRoutes>
                  <HotelBookingHistory />
                </ProtectedRoutes>
              }
            />
            <Route
              exact
              path="/itinerary"
              element={
                <ProtectedRoutes>
                  <Itinerary />
                </ProtectedRoutes>
              }
            />
            <Route path="/itinerary/:id" element={<ItineraryPublicView />} />
            <Route exact path="/post" element={<PostsFeed />} />
            {/* Itinerary */}
            <Route
              exact
              path="/itinerary-fill"
              element={
                <ProtectedRoutes>
                  <ItineraryForm />
                </ProtectedRoutes>
              }
            />
            {/* Seat Booking Routes */}
            {/* train */}
            <Route
              path="/train-seat-book"
              element={
                <ProtectedRoutes>
                  <TrainSeatBooking />
                </ProtectedRoutes>
              }
            />
            {/* Bus Seat Book*/}
            {/* Select Seat */}
            <Route
              path="/bus-seat/:id"
              element={
                <ProtectedRoutes>
                  <BusSeatSelect />
                </ProtectedRoutes>
              }
            />
            {/* book seat form */}
            <Route
              path="/bus-seat-book"
              element={
                <ProtectedRoutes>
                  <BusBookingForm />
                </ProtectedRoutes>
              }
            />
            {/* Flight Seat Book */}
            {/* Select Seat */}
            <Route
              path="/flight-seat/:id"
              element={
                <ProtectedRoutes>
                  <FlightSeatSelection />
                </ProtectedRoutes>
              }
            />
            {/* book seat form */}
            <Route
              path="/flight-seat-book"
              element={
                <ProtectedRoutes>
                  <FlightBookingForm />
                </ProtectedRoutes>
              }
            />

            {/* Social Feed */}
            <Route
              path="/create-post"
              element={
                <ProtectedRoutes>
                  <CreatePost />
                </ProtectedRoutes>
              }
            />
            {/* Single Post View */}
            <Route path="/post/:id" element={<SinglePostView />} />
            {/* Update Post View */}
            <Route
              path="/post/update/:id"
              element={
                <ProtectedRoutes>
                  <EditPost />
                </ProtectedRoutes>
              }
            />
            {/* Saved Posts */}
            <Route
              path="/saved-posts"
              element={
                <ProtectedRoutes>
                  <SavedPostsPage />
                </ProtectedRoutes>
              }
            />
            <Route
              path="/liked-posts"
              element={
                <ProtectedRoutes>
                  <LikedPostsPage />
                </ProtectedRoutes>
              }
            />

            {/* Locations */}
            <Route path="/locations" element={<LocationBrowser />} />
            <Route path="/location/:id" element={<LocationDetail />} />
            <Route path="/hotels" element={<HotelSearch />} />

            {/* Separate Call for Search From Here {without Protection} */}
            <Route path="/train" element={<TrainPage />} />
            <Route path="/bus" element={<BusPage />} />
            <Route path="/flight" element={<FlightSearch />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsAndConditions />} />
            <Route path="/contact" element={<ContactUs />} />

            {/*Get Booking Routes */}
            <Route
              path="/train-bookings"
              element={
                <ProtectedRoutes>
                  <MyTrainBookings />
                </ProtectedRoutes>
              }
            />
            <Route
              path="/bus-bookings"
              element={
                <ProtectedRoutes>
                  <MyBusBookings />
                </ProtectedRoutes>
              }
            />
            <Route
              path="/flight-bookings"
              element={
                <ProtectedRoutes>
                  <MyFlightBookings />
                </ProtectedRoutes>
              }
            />
            {/* Profile Route */}
            <Route
              path="/profile"
              element={
                <ProtectedRoutes>
                  <ViewProfile />
                </ProtectedRoutes>
              }
            />
            <Route
              path="/recent-activity"
              element={
                <ProtectedRoutes>
                  <RecentActivity />
                </ProtectedRoutes>
              }
            />
            {/* For Non Existing Route */}
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </main>

        {!isAdminArea && <Footer />}
        <ToastContainer
          position="top-right"
          autoClose={2000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme={theme === "dark" ? "dark" : "light"}
          className="toast-container"
          toastClassName={theme === "dark" ? "custom-toast custom-toast-dark" : "custom-toast custom-toast-light"}
          bodyClassName="custom-toast-body"
          closeButton={false}
          style={{ top: isAdminArea ? "16px" : "73px", right: "16px" }}
        />
      </div>
    </>
  );
}

export default App;
