import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearErrors, signupUser } from "../../../AllStatesFeatures/Authentication/authSlice";
import { useNavigate, Link } from "react-router-dom";
import Loading from "../../General/Loading";
import {
  Eye,
  EyeOff,
  Mail,
  Phone,
  Lock,
  User,
  UserPlus,
  ArrowRight,
} from "lucide-react";

const inputCls =
  "w-full pl-10 pr-4 py-2.5 rounded-xl bg-orange-50 border border-orange-200 text-stone-800 placeholder-stone-400 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all";

const Field = ({ label, icon: Icon, children, required }) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-semibold tracking-wide uppercase text-stone-400">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <Icon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
      {children}
    </div>
  </div>
);

function Signup() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ name: "", email: "", phone: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const loading = useSelector((s) => s.auth.loading);
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);
  const authError = useSelector((s) => s.auth.error);

  useEffect(() => {
    if (isAuthenticated) navigate("/", { replace: true });
  }, [isAuthenticated, navigate]);

  if (loading) return <Loading message="Creating your account…, this may take a few moments." color="border-t-orange-500" />;

  const handleChange = (e) => {
    if (authError) dispatch(clearErrors());
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (authError) dispatch(clearErrors());
    const errs = {};
    if (!formData.name) errs.name = "Name is required";
    if (!formData.email) errs.email = "Email is required";
    if (!formData.phone) errs.phone = "Phone is required";
    if (!formData.password) errs.password = "Password is required";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    dispatch(signupUser(formData));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50 px-4 py-16">
      <div className="w-full max-w-sm">

        {/* Brand */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-stone-800">Create an account</h1>
          <p className="text-sm text-stone-500 mt-1">Join TripUp and start your journey today.</p>
        </div>

        {/* Card */}
        <div className="bg-white border border-orange-200 rounded-2xl shadow-sm overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 space-y-4">

            <Field label="Full Name" icon={User} required>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className={inputCls}
                required
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </Field>

            <Field label="Email Address" icon={Mail} required>
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
            </Field>

            <Field label="Phone Number" icon={Phone} required>
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
            </Field>

            <Field label="Password" icon={Lock} required>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a strong password"
                className={`${inputCls} pr-10`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-orange-500 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </Field>

            {authError ? <p className="text-xs text-red-500">{authError}</p> : null}

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-semibold py-3 rounded-xl transition-all active:scale-95 text-sm mt-2"
            >
              <UserPlus size={15} strokeWidth={2} />
              Create account
            </button>
          </form>

          {/* Footer */}
          <div className="border-t border-orange-100 px-6 py-4 flex items-center justify-between bg-orange-50/50">
            <p className="text-xs text-stone-400">Already have an account?</p>
            <Link
              to="/login"
              className="inline-flex items-center gap-1 text-orange-500 hover:text-orange-400 text-xs font-semibold transition-colors"
            >
              Sign in
              <ArrowRight size={11} />
            </Link>
          </div>
        </div>

        <p className="text-center text-stone-400 text-xs mt-5">
          By signing up, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}

export default Signup;