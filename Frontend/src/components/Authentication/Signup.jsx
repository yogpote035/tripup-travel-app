import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { signupUser } from "../../../AllStatesFeatures/Authentication/authSlice";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Loading from "../../General/Loading";

function Signup() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const loading = useSelector((state) => state.auth.loading);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true }); //if logged in
    }
  }, [isAuthenticated]);
  if (loading) {
    return <Loading message="Creating your account" />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(signupUser(formData));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white px-4 py-10 ">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 text-white p-10 rounded-lg shadow-lg w-full max-w-2xl space-y-6 border border-white"
      >
        <h2 className="text-3xl font-bold text-center text-white mb-4">
          Welcome on TripUp Please SignUp
        </h2>

        <div>
          <label className="block font-medium text-white mb-1">Full Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:outline-none "
            required
          />
        </div>

        <div>
          <label className="block font-medium text-white mb-1">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block font-medium text-white mb-1">
            Phone Number
          </label>
          <input
            type="number"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:outline-none "
            required
          />
        </div>

        <div className="relative">
          <label className="block font-medium text-white mb-1">Password</label>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-2 pr-10 border rounded focus:outline-none"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-[38px] text-gray-600 hover:text-indigo-600"
            tabIndex={-1}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        <button
          type="submit"
          className="w-full py-2 font-semibold rounded shadow bg-white text-black hover:bg-gray-300          "
        >
          Signup
        </button>
      <p className="text-sm text-center text-white">
        Already Have an Account?
        <Link to={"/login"}>
          {" "}
          <span className="font-bold hover:underline hover:text-yellow-300">
            Login
          </span>
        </Link>
      </p>
      </form>

    </div>
  );
}

export default Signup;
