import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { GetUserProfile } from "../../../AllStatesFeatures/UserProfile/UserProfileSlice";
import Loading from "../../General/Loading";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Train,
  Bus,
  Plane,
  MapPin,
  FileText,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

const ViewProfile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    profile,
    totalFlightBookings,
    totalBusBookings,
    totalTrainBookings,
    totalPosts,
    totalPlans,
    loading,
    error,
  } = useSelector((state) => state.userProfile);

  useEffect(() => {
    dispatch(GetUserProfile());
  }, [dispatch]);

  if (loading) return <Loading message="Loading your profile…" color="border-t-orange-500" />;

  if (error)
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center p-6">
        <div className="bg-white border border-orange-200 rounded-2xl p-8 max-w-sm w-full text-center shadow-sm">
          <AlertCircle size={28} className="text-orange-400 mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-stone-500 text-sm">{error}</p>
        </div>
      </div>
    );

  const stats = [
    {
      icon: <Train size={18} className="text-orange-500" />,
      label: "Train Bookings",
      count: totalTrainBookings || 0,
      route: "/train-bookings",
    },
    {
      icon: <Bus size={18} className="text-orange-500" />,
      label: "Bus Bookings",
      count: totalBusBookings || 0,
      route: "/bus-bookings",
    },
    {
      icon: <Plane size={18} className="text-orange-500" />,
      label: "Flight Bookings",
      count: totalFlightBookings || 0,
      route: "/flight-bookings",
    },
    {
      icon: <MapPin size={18} className="text-orange-500" />,
      label: "Travel Plans",
      count: totalPlans || 0,
      route: "/itinerary",
    },
    {
      icon: <FileText size={18} className="text-orange-500" />,
      label: "Posts",
      count: totalPosts || 0,
      route: "/post",
    },
  ];

  const infoFields = profile
    ? [
        { icon: <User size={14} />, label: "Name", value: profile.name },
        { icon: <Mail size={14} />, label: "Email", value: profile.email },
        { icon: <Phone size={14} />, label: "Phone", value: profile.phone },
        {
          icon: <Calendar size={14} />,
          label: "Member since",
          value: new Date(profile.createdAt).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
          }),
        },
      ]
    : [];

  return (
    <div className="min-h-screen bg-orange-50 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-5">

        {/* Page heading */}
        <div>
          <h1 className="text-2xl font-bold text-stone-800">My Profile</h1>
          <p className="text-sm text-stone-500 mt-1">Your account details and travel activity.</p>
        </div>

        {profile && (
          <>
            {/* Personal info card */}
            <div className="bg-white border border-orange-200 rounded-2xl shadow-sm overflow-hidden">
              {/* Avatar strip */}
              <div className="px-6 pt-6 pb-4 flex items-center gap-4 border-b border-orange-100">
                <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center shrink-0">
                  <User size={22} className="text-orange-500" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="font-bold text-stone-800 text-base">{profile.name}</p>
                  <p className="text-xs text-stone-400 mt-0.5">{profile.email}</p>
                </div>
              </div>

              {/* Fields grid */}
              <div className="grid grid-cols-2 divide-x divide-orange-100">
                {infoFields.map((field, idx) => (
                  <div
                    key={idx}
                    className={`px-6 py-4 ${idx >= 2 ? "border-t border-orange-100" : ""}`}
                  >
                    <div className="flex items-center gap-1.5 text-stone-400 mb-1">
                      {field.icon}
                      <span className="text-xs font-semibold tracking-wide uppercase">
                        {field.label}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-stone-700 break-all">{field.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity card */}
            <div className="bg-white border border-orange-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-orange-100">
                <h2 className="text-sm font-semibold text-stone-700">Activity</h2>
              </div>

              <div className="divide-y divide-orange-100">
                {stats.map((stat, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-6 py-4 hover:bg-orange-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center shrink-0">
                        {stat.icon}
                      </div>
                      <p className="text-sm font-medium text-stone-700">{stat.label}</p>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-xl font-bold text-stone-800 w-8 text-right">
                        {stat.count}
                      </span>
                      <button
                        onClick={() => navigate(stat.route)}
                        className="flex items-center gap-1.5 border border-orange-200 hover:border-orange-400 hover:bg-orange-50 text-stone-600 hover:text-stone-800 px-3 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-95"
                      >
                        View
                        <ArrowRight size={12} strokeWidth={2} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Info note */}
            <div className="flex items-start gap-2.5 px-4 py-3 bg-orange-100/60 border border-orange-200 rounded-xl">
              <AlertCircle size={14} className="text-orange-400 shrink-0 mt-0.5" strokeWidth={2} />
              <p className="text-xs text-stone-500">
                Your booking history and travel plans are always accessible from the navigation menu or the buttons above.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ViewProfile;