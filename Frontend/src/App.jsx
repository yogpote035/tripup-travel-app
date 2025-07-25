import "./App.css";
import { Route, Routes } from "react-router-dom";
import Login from "./components/Authentication/Login.jsx";
import Signup from "./components/Authentication/Signup.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
function App() {
  return (
    <>
      <h1 className="text-rose-600 text-center mt-4 text-5xl">Welcome on TripUp</h1>
      <Routes>
        <Route
          path="/"
          element={<h2 className="text-emerald-300">Home Page</h2>}
        />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
}

export default App;
