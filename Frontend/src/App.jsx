import "./App.css";
import { Route, Routes } from "react-router-dom";
import Login from "./components/Authentication/Login.jsx";
import Signup from "./components/Authentication/Signup.jsx";
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
    </>
  );
}

export default App;
