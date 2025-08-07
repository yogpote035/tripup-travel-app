import "./App.css";
import { Route, Routes } from "react-router-dom";
import Login from "./components/Authentication/Login.jsx";
import Signup from "./components/Authentication/Signup.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "./General/Navbar.jsx";
import Home from "./components/Home/Home.jsx";
import Footer from "./General/Footer.jsx";
import Bookings from "./components/Booking/Booking.jsx";
import Itinerary from "./components/Itinerary/Itinerary.jsx";
import Diary from "./components/Diary/Diary.jsx";
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

function App() {
  return (
    <>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow bg-gray-900">
          <div className="mb-13"></div>
          <Routes>
            <Route exact path="/" element={<Home />} />
            <Route exact path="/login" element={<Login />} />
            <Route exact path="/signup" element={<Signup />} />
            <Route
              exact
              path="/bookings"
              element={
                <ProtectedRoutes>
                  <Bookings />
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
            <Route
              exact
              path="/diary"
              element={
                <ProtectedRoutes>
                  <Diary />
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

            {/* Separate Call for Search From Here {without Protection} */}
            <Route path="/train" element={<TrainPage />} />
            <Route path="/bus" element={<BusPage />} />
            <Route path="/flight" element={<FlightSearch />} />

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
            {/* For Non Existing Route */}
            <Route
              path="*"
              element={
                <h1 className="text-center text-3xl text-red-600 mt-10">
                  404 - Page Not Found
                </h1>
              }
            />
          </Routes>
          <div className="mt-13"></div>
        </main>

        <Footer />
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
          theme="light"
          style={{ top: "73px", right: "2px" }}
          toastClassName="!rounded-none !bg-gray-800 !text-white"
        />
      </div>
    </>
  );
}

export default App;
