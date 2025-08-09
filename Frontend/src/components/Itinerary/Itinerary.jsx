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
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import {
  getAllItinerary,
  DeleteItinerary,
} from "../../../AllStatesFeatures/Itinerary/AllItinerarySlice";
import Loading from "../../General/Loading";
import { toast } from "react-toastify";

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
    <div className="min-w-full px-4 sm:px-6 py-8 max-w-6xl bg-gray-800">
      {/* Header Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-rose-600 mb-4">
          ✈️ Your Smart Itinerary Planner
        </h1>
        <p className="text-gray-500 text-base sm:text-lg max-w-2xl mx-auto">
          Plan and manage your perfect trip with AI-powered scheduling. Choose
          your destination, interests, time, and more — all in one place.
        </p>
        <button
          onClick={scrollToForm}
          className="mt-6 bg-rose-600 hover:bg-rose-700 text-white font-semibold px-8 py-3 rounded-full transition duration-300 shadow-lg hover:shadow-xl"
        >
          <Link to={"/itinerary-fill"}>Start Planning</Link>
        </button>
      </div>
      {/* Itineraries List */}
      {itineraries?.length > 0 ? (
        <div className="space-y-10">
          {itineraries?.map((itinerary) => (
            <div
              key={itinerary._id}
              className="bg-gray-300 p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition duration-300"
            >
              {/* Top Row: Trip Info + Delete */}
              <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Trip to{" "}
                    <span className="text-rose-600">
                      {itinerary.destination}
                    </span>
                  </h2>
                  <div className="text-gray-600 flex flex-wrap gap-4 items-center text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} /> {itinerary.startDate} –{" "}
                      {itinerary.endDate}
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={16} /> {itinerary.tripType}
                    </div>
                    {itinerary.transportMode === "public" && (
                      <div className="flex items-center gap-2">
                        <Bus size={16} /> {itinerary.transportMode}
                      </div>
                    )}
                    {itinerary.transportMode === "walking" && (
                      <div className="flex items-center gap-2">
                        <Footprints size={16} /> {itinerary.transportMode}
                      </div>
                    )}
                    {itinerary.transportMode === "private" && (
                      <div className="flex items-center gap-2">
                        <Car size={16} /> {itinerary.transportMode}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Wallet size={16} /> {itinerary.budget}
                    </div>
                  </div>
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => {
                    setSelectedId(itinerary._id);
                    setShowConfirm(true);
                  }}
                  className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-md transition"
                  title="Delete Itinerary"
                >
                  <Trash size={18} />
                </button>
              </div>

              {/* Interests */}
              {itinerary?.interests?.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Interests
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {itinerary?.interests?.map((interest, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-sm border border-orange-200"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Day Plan */}
              <div className="space-y-6">
                {itinerary?.plan?.map((dayObj) => (
                  <div
                    key={dayObj.day}
                    className="bg-gray-50 p-4 rounded-xl border border-gray-200 hover:border-rose-300 transition"
                  >
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">
                      Day {dayObj.day}:{" "}
                      <span className="text-gray-500">{dayObj.date}</span>
                    </h4>
                    <ul className="list-disc ml-6 space-y-1 text-gray-700">
                      {dayObj.activities?.map((activity, i) => (
                        <li key={i} className="leading-relaxed">
                          {activity}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">No itineraries found.</p>
      )}
      {error && <p className="text-center mt-5 mb-5 text-red-500">{error}</p>}{" "}
      {showConfirm && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowConfirm(false)} // Click outside = close
        >
          <div
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md text-black dark:text-white p-6 rounded-xl shadow-2xl border border-white/20 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()} // Prevent inner click from closing
          >
            <h3 className="text-lg font-semibold mb-2">Delete Itinerary?</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Are you sure you want to Delete this Itinerary? This action cannot
              be undone.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-black rounded"
              >
                No
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Itinerary;
