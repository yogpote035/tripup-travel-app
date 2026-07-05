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
  ArrowRight,
} from "lucide-react";

const inputCls =
  "w-full pl-10 pr-4 py-2.5 rounded-xl bg-orange-50 border border-orange-200 text-stone-800 placeholder-stone-400 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all";

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [usePhone, setUsePhone] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", phone: "", password: "" });
  const [errors, setErrors] = useState({});

  const loading = useSelector((s) => s.auth.loading);
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) navigate("/", { replace: true });
  }, [isAuthenticated, navigate]);

  if (loading) return <Loading message="Verifying credentials…, this may take a few moments." color="border-t-orange-500" />;

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    // client-side validation
    const errs = {};
    if (!formData.password) errs.password = "Password is required";
    if (usePhone) {
      if (!formData.phone) errs.phone = "Phone number is required";
    } else {
      if (!formData.email) errs.email = "Email is required";
    }
    setErrors(errs);
    if (Object.keys(errs).length) return;
    const payload = {
      password: formData.password,
      ...(usePhone ? { phone: formData.phone } : { email: formData.email }),
    };
    dispatch(loginUser(payload));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50 px-4 py-16">
      <div className="w-full max-w-sm">

        {/* Brand */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-stone-800">Welcome back</h1>
          <p className="text-sm text-stone-500 mt-1">Log in to continue your journey with TripUp.</p>
        </div>

        {/* Card */}
        <div className="bg-white border border-orange-200 rounded-2xl shadow-sm overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 space-y-4">

            {/* Email / Phone toggle */}
            {!usePhone ? (
              <div className="space-y-1.5">
                  <label className="block text-xs font-semibold tracking-wide uppercase text-stone-400">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className={inputCls}
                    required
                  />
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold tracking-wide uppercase text-stone-400">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 XXXXXXXXXX"
                    className={inputCls}
                    required
                  />
                  {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                </div>
              </div>
            )}

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold tracking-wide uppercase text-stone-400">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className={`${inputCls} pr-10`}
                  required
                />
                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-orange-500 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-semibold py-3 rounded-xl transition-all active:scale-95 text-sm mt-2"
            >
              <LogIn size={15} strokeWidth={2} />
              Log in
            </button>

            {/* Switch method */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => setUsePhone(!usePhone)}
                className="text-xs text-stone-400 hover:text-orange-500 transition-colors inline-flex items-center gap-1 font-medium"
              >
                {usePhone ? "Use email instead" : "Use phone instead"}
                <ArrowRight size={11} />
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="border-t border-orange-100 px-6 py-4 flex items-center justify-between bg-orange-50/50">
            <p className="text-xs text-stone-400">New to TripUp?</p>
            <Link
              to="/signup"
              className="inline-flex items-center gap-1 text-orange-500 hover:text-orange-400 text-xs font-semibold transition-colors"
            >
              Create an account
              <ArrowRight size={11} />
            </Link>
          </div>
        </div>

        <p className="text-center text-stone-400 text-xs mt-5">
          By logging in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}

export default Login;