import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, LogIn, Mail, ShieldCheck } from "lucide-react";
import { loginAdmin } from "../../../AllStatesFeatures/Authentication/authSlice";

export default function AdminLogin() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, user, isAuthenticated } = useSelector((state) => state.auth);

  if (isAuthenticated && user?.role === "admin") return <Navigate to="/admin" replace />;

  const submit = async (event) => {
    event.preventDefault();
    const result = await dispatch(loginAdmin(form));
    if (result.success) navigate("/admin");
  };

  return (
    <div className="admin-login">
      <div className="admin-login-wrap">
        <div className="admin-login-heading">
          <span className="admin-brand">TripUp</span>
          <span className="admin-access">
            <ShieldCheck size={14} /> Administrator access
          </span>
          <h1>Welcome back</h1>
          <p>Sign in to manage TripUp operations securely.</p>
        </div>

        <div className="admin-login-card">
          <form onSubmit={submit}>
            <label>
              Email address
              <div>
                <Mail size={16} />
                <input
                  required
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  placeholder="admin@example.com"
                />
              </div>
            </label>

            <label>
              Password
              <div className="password-field">
                <Lock size={16} />
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={form.password}
                  onChange={(event) => setForm({ ...form, password: event.target.value })}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </label>

            <button disabled={loading} className="admin-login-submit">
              <LogIn size={16} />
              {loading ? "Signing in…" : "Sign in to admin panel"}
            </button>
          </form>

          <div className="admin-login-footer">
            <span>Need a customer account?</span>
            <Link to="/login">Customer sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
