import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../../../AllStatesFeatures/Authentication/authSlice";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Loading from "../../General/Loading";
function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [usePhone, setUsePhone] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    password: "",
  });

  const loading = useSelector((state) => state.auth.loading);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true }); //if logged in
    }
  }, [isAuthenticated, navigate]);
  if (loading) {
    return <Loading message="Verifying Your Credentials" />;
  }

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      password: formData.password,
      ...(usePhone ? { phone: formData.phone } : { email: formData.email }),
    };
    dispatch(loginUser(payload));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="bg-gray-800 shadow-md rounded-xl p-6 w-full max-w-md  border border-white">
        <h2 className="text-center text-2xl font-bold text-white mb-6">
          Login on TripUp
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {!usePhone ? (
            <div>
              <label className="block mb-1 text-sm font-medium text-white">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full px-3 py-2 border rounded-md outline-none text-white"
                required
              />
            </div>
          ) : (
            <div>
              <label className="block mb-1 text-sm font-medium text-white">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
                className="w-full px-3 py-2 border rounded-md outline-none text-white"
                required
              />
            </div>
          )}

          {/* Password */}
          <div className="relative">
            <label className="block mb-1 text-sm font-medium text-white">
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="w-full px-3 py-2 border rounded-md pr-10 outline-none text-white"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute top-[38px] right-3 text-gray-600 hover:text-indigo-600"
              tabIndex={-1}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <button
            type="submit"
            className={`w-full 
             text-black font-semibold py-2 rounded-md bg-white hover:bg-gray-300 transition-colors`}
          >
            Login
          </button>

          <p className="text-sm text-center text-white">
            {usePhone ? "Prefer email login?" : "Prefer phone login?"}{" "}
            <button
              type="button"
              onClick={() => setUsePhone(!usePhone)}
              className="text-white hover:underline font-medium"
            >
              Switch to {usePhone ? "Email" : "Phone"}
            </button>
          </p>
          <p className="text-sm text-center text-white">
            Not Have a Account?{" "}
            <Link to={"/signup"}>
              {" "}
              <span className="font-bold hover:underline hover:text-yellow-300">Signup</span>
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
