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
function App() {
  return (
    <>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="mb-10"></div>
        <main className="flex-grow bg-gray-900">
          <Routes>
            <Route exact path="/" element={<Home />} />
            <Route exact path="/login" element={<Login />} />
            <Route exact path="/signup" element={<Signup />} />
            <Route exact path="/bookings" element={<Bookings />} />
            <Route exact path="/itinerary" element={<Itinerary />} />
            <Route exact path="/diary" element={<Diary />} />
            <Route path="/train" element={<TrainPage />} />
            <Route path="/train-seat-book" element={<TrainSeatBooking />} />
            <Route
              path="/bus"
              element={<h1 className="text-rose-400 mt-10">Bus</h1>}
            />
            <Route
              path="/flight"
              element={<h1 className="text-rose-400 mt-10">Flight</h1>}
            />
            <Route
              path="*"
              element={
                <h1 className="text-center text-3xl text-red-600 mt-10">
                  404 - Page Not Found
                </h1>
              }
            />
          </Routes>
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
        />
      </div>
    </>
  );
}

export default App;
