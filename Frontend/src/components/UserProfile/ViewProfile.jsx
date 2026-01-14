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
  UserCircle,
  AlertCircle
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

  if (loading) return <Loading message="Loading Your Information..." />;
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center mt-12 px-4">
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 max-w-md">
          <p className="text-center text-red-400 text-lg">{error}</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      icon: <Train size={24} className="text-yellow-400" />,
      label: "Train Bookings",
      count: totalTrainBookings || 0,
      route: "/train-bookings",
      gradient: "from-yellow-500/20 to-orange-500/20",
      borderColor: "border-yellow-500/30"
    },
    {
      icon: <Bus size={24} className="text-green-400" />,
      label: "Bus Bookings",
      count: totalBusBookings || 0,
      route: "/bus-bookings",
      gradient: "from-green-500/20 to-emerald-500/20",
      borderColor: "border-green-500/30"
    },
    {
      icon: <Plane size={24} className="text-purple-400" />,
      label: "Flight Bookings",
      count: totalFlightBookings || 0,
      route: "/flight-bookings",
      gradient: "from-purple-500/20 to-indigo-500/20",
      borderColor: "border-purple-500/30"
    },
    {
      icon: <MapPin size={24} className="text-blue-400" />,
      label: "Travel Plans",
      count: totalPlans || 0,
      route: "/itinerary",
      gradient: "from-blue-500/20 to-cyan-500/20",
      borderColor: "border-blue-500/30"
    },
    {
      icon: <FileText size={24} className="text-pink-400" />,
      label: "Posts",
      count: totalPosts || 0,
      route: "/post",
      gradient: "from-pink-500/20 to-rose-500/20",
      borderColor: "border-pink-500/30"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 text-white p-6 mt-10 mb-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg mb-4">
            <UserCircle size={40} className="text-white" strokeWidth={2.5} />
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mb-2">
            User Profile
          </h2>
          <p className="text-gray-400">Manage your account and view your activity</p>
        </div>

        {profile && (
          <div className="space-y-6">
            {/* Profile Information Card */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <User size={20} className="text-blue-400" />
                Personal Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-500/20 p-3 rounded-xl">
                    <User size={18} className="text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Name</p>
                    <p className="text-white font-semibold">{profile.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-green-500/20 p-3 rounded-xl">
                    <Mail size={18} className="text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Email</p>
                    <p className="text-white font-semibold break-all">{profile.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-purple-500/20 p-3 rounded-xl">
                    <Phone size={18} className="text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Phone</p>
                    <p className="text-white font-semibold">{profile.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-orange-500/20 p-3 rounded-xl">
                    <Calendar size={18} className="text-orange-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Member Since</p>
                    <p className="text-white font-semibold">
                      {new Date(profile.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Statistics */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-semibold text-white mb-6">
                Your Activity
              </h3>

              <div className="space-y-4">
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className={`bg-gradient-to-r ${stat.gradient} border ${stat.borderColor} rounded-xl p-5 hover:shadow-lg transition-all duration-300`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="bg-gray-900/50 p-3 rounded-xl">
                          {stat.icon}
                        </div>
                        <div>
                          <p className="text-gray-300 text-sm mb-1">{stat.label}</p>
                          <p className="text-3xl font-bold text-white">{stat.count}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => navigate(stat.route)}
                        className="bg-white hover:bg-gray-100 text-gray-900 py-2.5 px-4 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg hover:scale-105 flex items-center gap-2"
                      >
                        View All
                        <ArrowRight size={16} strokeWidth={2} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle size={20} className="text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-300">
                  Your booking history and travel plans are always accessible from the navigation menu or the buttons above.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewProfile;