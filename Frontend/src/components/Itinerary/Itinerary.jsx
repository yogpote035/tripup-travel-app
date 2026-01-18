import { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  Users,
  Wallet,
  Bus,
  Car,
  Footprints,
  Trash,
  MapPin,
  Sparkles,
  Plus,
  AlertTriangle,
  Clock
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import {
  getAllItinerary,
  DeleteItinerary,
} from "../../../AllStatesFeatures/Itinerary/AllItinerarySlice";
import Loading from "../../General/Loading";
import { toast } from "react-toastify";
import { format } from "date-fns";

const Itinerary = () => {
  const dispatch = useDispatch();
  const formRef = useRef(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [actionMsg, setActionMsg] = useState("");

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  async function getAllItineraryFunction() {
    dispatch(getAllItinerary());
  }

  useEffect(() => {
    getAllItineraryFunction();
  }, [dispatch]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") setShowConfirm(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const itineraries = useSelector((state) => state.itinerary.itinerary);
  const { loading, error } = useSelector((state) => state.itinerary);

  const handleDelete = async () => {
    if (!selectedId) return toast.warn("Itinerary Id Missing");

    setActionMsg("Deleting your Itinerary...");
    try {
      await dispatch(DeleteItinerary(selectedId));
      setShowConfirm(false);
      setTimeout(() => {
        getAllItineraryFunction();
      }, 1300);
    } catch (err) {
      alert("Failed to Delete Itinerary.");
    }
  };

  if (loading) {
    return (
      <Loading
        message={actionMsg || "Fetching All Itineraries...."}
        color="border-t-red-500"
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 text-white px-4 sm:px-6 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl shadow-lg mb-6">
            <MapPin size={40} className="text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-rose-400 to-pink-400 bg-clip-text text-transparent mb-4">
            Smart Itinerary Planner
          </h1>
          <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto mb-8">
            Plan and manage your perfect trip with AI-powered scheduling. Choose
            your destination, interests, time, and more — all in one place.
          </p>
          <Link to="/itinerary-fill">
            <button className="bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-semibold px-8 py-4 rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105 inline-flex items-center gap-2">
              <Plus size={20} strokeWidth={2} />
              Start Planning
            </button>
          </Link>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 flex items-center gap-3">
            <AlertTriangle size={20} className="text-red-400" />
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Itineraries List */}
        {itineraries?.length > 0 ? (
          <div className="space-y-6">
            {itineraries.map((itinerary) => (
              <div
                key={itinerary._id}
                className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 hover:border-gray-600 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-rose-500/10 to-pink-500/10 border-b border-gray-700 p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="bg-rose-500/20 p-2 rounded-lg">
                          <MapPin size={20} className="text-rose-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">
                          Trip to{" "}
                          <span className="text-rose-400">
                            {itinerary.destination}
                          </span>
                        </h2>
                      </div>

                      <div className="flex flex-wrap gap-3 text-sm">
                        <div className="flex items-center gap-2 bg-gray-700/50 px-3 py-1.5 rounded-full">
                          <Calendar size={14} className="text-gray-400" />
                          <span className="text-gray-300">
                            {format(new Date(itinerary.startDate), "dd MMM")} –{" "}
                            {format(new Date(itinerary.endDate), "dd MMM yyyy")}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 bg-gray-700/50 px-3 py-1.5 rounded-full">
                          <Users size={14} className="text-gray-400" />
                          <span className="text-gray-300">{itinerary.tripType}</span>
                        </div>

                        {itinerary.transportMode === "public" && (
                          <div className="flex items-center gap-2 bg-gray-700/50 px-3 py-1.5 rounded-full">
                            <Bus size={14} className="text-gray-400" />
                            <span className="text-gray-300">Public Transport</span>
                          </div>
                        )}
                        {itinerary.transportMode === "walking" && (
                          <div className="flex items-center gap-2 bg-gray-700/50 px-3 py-1.5 rounded-full">
                            <Footprints size={14} className="text-gray-400" />
                            <span className="text-gray-300">Walking</span>
                          </div>
                        )}
                        {itinerary.transportMode === "private" && (
                          <div className="flex items-center gap-2 bg-gray-700/50 px-3 py-1.5 rounded-full">
                            <Car size={14} className="text-gray-400" />
                            <span className="text-gray-300">Private</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 bg-gray-700/50 px-3 py-1.5 rounded-full">
                          <Wallet size={14} className="text-gray-400" />
                          <span className="text-gray-300">{itinerary.budget}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                        <Clock size={12} />
                        Created: {format(new Date(itinerary.createdAt), "dd MMM yyyy, hh:mm a")}
                      </div>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={() => {
                        setSelectedId(itinerary._id);
                        setShowConfirm(true);
                      }}
                      className="p-3 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-105"
                      title="Delete Itinerary"
                    >
                      <Trash size={18} strokeWidth={2} />
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Interests */}
                  {itinerary?.interests?.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles size={18} className="text-pink-400" />
                        <h3 className="text-lg font-semibold text-white">Interests</h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {itinerary.interests.map((interest, i) => (
                          <span
                            key={i}
                            className="px-3 py-1.5 bg-pink-500/20 text-pink-300 rounded-full text-sm border border-pink-500/30 font-medium"
                          >
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Day Plan */}
                  <div className="space-y-4">
                    {itinerary?.plan?.map((dayObj) => (
                      <div
                        key={dayObj.day}
                        className="bg-gray-900/50 border border-gray-700 hover:border-gray-600 p-5 rounded-xl transition-all"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="bg-rose-500/20 w-10 h-10 rounded-full flex items-center justify-center">
                            <span className="text-rose-400 font-bold">{dayObj.day}</span>
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-white">
                              Day {dayObj.day}
                            </h4>
                            <p className="text-sm text-gray-400">
                              {format(new Date(dayObj.date), "EEEE, dd MMM yyyy")}
                            </p>
                          </div>
                        </div>
                        <ul className="space-y-2 ml-13">
                          {dayObj.activities?.map((activity, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-3 text-gray-300 leading-relaxed"
                            >
                              <span className="text-rose-400 mt-1">•</span>
                              <span>{activity}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-12 text-center">
            <MapPin size={64} className="text-gray-600 mx-auto mb-4" strokeWidth={1.5} />
            <p className="text-gray-400 text-lg mb-2">No itineraries found</p>
            <p className="text-gray-500 text-sm">Start planning your first trip!</p>
          </div>
        )}

        {/* Confirmation Modal */}
        {showConfirm && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowConfirm(false)}
          >
            <div
              className="bg-gray-800 border border-gray-700 text-white p-6 rounded-2xl shadow-2xl w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-red-500/20 p-3 rounded-xl">
                  <AlertTriangle size={24} className="text-red-400" />
                </div>
                <h3 className="text-xl font-bold">Delete Itinerary?</h3>
              </div>

              <p className="text-gray-300 mb-6">
                Are you sure you want to delete this itinerary? This action cannot be undone.
              </p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-semibold transition-all"
                >
                  No, Keep It
                </button>
                <button
                  onClick={handleDelete}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Itinerary;