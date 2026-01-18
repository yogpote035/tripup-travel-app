import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../../../AllStatesFeatures/Authentication/authSlice";
import { Link, useNavigate } from "react-router-dom";
import Loading from "../../General/Loading";
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Phone, 
  Lock, 
  LogIn,
  Plane,
  ArrowRight
} from "lucide-react";

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
      navigate("/", { replace: true });
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg mb-4">
            <Plane size={32} className="text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Welcome Back
          </h1>
          <p className="text-gray-400">Login to continue your journey with TripUp</p>
        </div>

        {/* Form Card */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 shadow-2xl rounded-2xl p-8 border border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email/Phone Input */}
            {!usePhone ? (
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-300">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    required
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-300">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    <Phone size={18} />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                    className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    required
                  />
                </div>
              </div>
            )}

            {/* Password Input */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-12 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-400 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center gap-2"
            >
              <LogIn size={20} strokeWidth={2} />
              Login
            </button>

            {/* Switch Login Method */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => setUsePhone(!usePhone)}
                className="text-sm text-gray-400 hover:text-blue-400 transition-colors inline-flex items-center gap-1 group"
              >
                <span>{usePhone ? "Use email instead" : "Use phone instead"}</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gray-800 text-gray-400">New to TripUp?</span>
            </div>
          </div>

          {/* Signup Link */}
          <div className="text-center">
            <Link
              to="/signup"
              className="text-sm text-gray-300 hover:text-white transition-colors inline-flex items-center gap-2 group"
            >
              <span>Create a new account</span>
              <ArrowRight size={14} className="text-blue-400 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-gray-500 text-xs mt-6">
          By logging in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}

export default Login;