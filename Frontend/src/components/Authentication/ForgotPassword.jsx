import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { clearErrors, requestPasswordReset, resetPassword } from "../../../AllStatesFeatures/Authentication/authSlice";
import Loading from "../../General/Loading";
import { ArrowRight, Lock, Mail, RotateCw } from "lucide-react";

const inputCls =
    "w-full pl-10 pr-4 py-2.5 rounded-xl bg-orange-50 border border-orange-200 text-stone-800 placeholder-stone-400 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all";

function ForgotPassword() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const loading = useSelector((state) => state.auth.loading);
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
    const token = useMemo(() => searchParams.get("token") || "", [searchParams]);
    const loadingMessage = token ? "Resetting your password…" : "Sending password reset link…";

    useEffect(() => {
        if (isAuthenticated) navigate("/", { replace: true });
    }, [isAuthenticated, navigate]);

    if (loading) return <Loading message={loadingMessage} color="border-t-orange-500" />;

    const handleForgotSubmit = async (event) => {
        event.preventDefault();
        setError("");
        if (!email.trim()) {
            setError("Please enter your email address.");
            return;
        }

        const result = await dispatch(requestPasswordReset({ email }));
        if (result?.success) {
            setSubmitted(true);
        }
    };

    const handleResetSubmit = async (event) => {
        event.preventDefault();
        setError("");
        if (!token) {
            setError("Missing reset token.");
            return;
        }
        if (password.length < 8) {
            setError("Password must be at least 8 characters long.");
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        const result = await dispatch(resetPassword({ token, password }));
        if (result?.success) {
            navigate("/login", { replace: true });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-orange-50 px-4 py-16">
            <div className="w-full max-w-sm">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-stone-800">{token ? "Reset your password" : "Forgot your password?"}</h1>
                    <p className="text-sm text-stone-500 mt-1">
                        {token ? "Choose a new password for your TripUp account." : "We’ll help you recover access to your account."}
                    </p>
                </div>

                <div className="bg-white border border-orange-200 rounded-2xl shadow-sm overflow-hidden">
                    {token ? (
                        <form onSubmit={handleResetSubmit} className="p-6 space-y-4">
                            <div className="space-y-1.5">
                                <label className="block text-xs font-semibold tracking-wide uppercase text-stone-400">New password</label>
                                <div className="relative">
                                    <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className={inputCls}
                                        placeholder="Create a new password"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-xs font-semibold tracking-wide uppercase text-stone-400">Confirm password</label>
                                <div className="relative">
                                    <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className={inputCls}
                                        placeholder="Repeat your new password"
                                    />
                                </div>
                            </div>
                            {error ? <p className="text-xs text-red-500">{error}</p> : null}
                            <button type="submit" className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-semibold py-3 rounded-xl transition-all active:scale-95 text-sm mt-2">
                                <RotateCw size={15} />
                                Reset password
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleForgotSubmit} className="p-6 space-y-4">
                            <div className="space-y-1.5">
                                <label className="block text-xs font-semibold tracking-wide uppercase text-stone-400">Email address</label>
                                <div className="relative">
                                    <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className={inputCls}
                                        placeholder="you@example.com"
                                    />
                                </div>
                            </div>
                            {error ? <p className="text-xs text-red-500">{error}</p> : null}
                            {submitted ? <p className="text-sm text-green-600">Please check your inbox for the next step.</p> : null}
                            <button type="submit" className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-semibold py-3 rounded-xl transition-all active:scale-95 text-sm mt-2">
                                <ArrowRight size={15} />
                                Send reset link
                            </button>
                        </form>
                    )}
                </div>

                <div className="text-center mt-4">
                    <Link to="/login" className="text-sm text-orange-500 hover:text-orange-400">Back to login</Link>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;
