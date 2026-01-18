import { useSelector } from "react-redux";
import Loading from "../../General/Loading";
import { useNavigate } from "react-router-dom";
import { 
  Train, 
  MapPin, 
  Clock, 
  ArrowRight, 
  Calendar,
  Armchair,
  IndianRupee,
  AlertCircle,
  Route,
  Gauge
} from "lucide-react";

const TrainList = ({ searchDate }) => {
  const { trains, loading, error, from, to, total } = useSelector(
    (state) => state.train
  );

  const navigate = useNavigate();

  if (loading) return <Loading message="Fetching Trains For Your Route..." />;
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center mt-12 px-4">
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 max-w-md">
          <p className="text-center text-red-400 text-lg">{error}</p>
        </div>
      </div>
    );
  }

  if (!trains || trains.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center mt-12 px-4">
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 max-w-md text-center">
          <Train size={48} className="text-gray-600 mx-auto mb-4" strokeWidth={1.5} />
          <p className="text-gray-400 text-lg mb-2">No trains found</p>
          <p className="text-gray-500 text-sm">Try searching for a different route or date</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-2xl p-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <MapPin size={20} className="text-yellow-400" />
            <h2 className="text-2xl font-bold text-white text-center">
              {from} <ArrowRight size={20} className="inline text-gray-500" /> {to}
            </h2>
          </div>
          <p className="text-center text-gray-400">{total} train{total !== 1 ? 's' : ''} found</p>
        </div>
      </div>

      {/* Train Cards */}
      <div className="space-y-6">
        {trains.map((train, index) => (
          <div key={index} className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 hover:border-gray-600 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
            {/* Train Header */}
            <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-b border-gray-700 p-5">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-start gap-3">
                  <div className="bg-yellow-500/20 p-3 rounded-xl">
                    <Train size={24} className="text-yellow-400" strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {train.trainName}
                    </h3>
                    <p className="text-sm text-gray-400">{train.trainNumber}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-gray-700/50 px-3 py-1.5 rounded-full">
                  <Gauge size={14} className="text-orange-400" />
                  <span className="text-sm font-medium text-gray-300">{train.trainType}</span>
                </div>
              </div>
            </div>

            <div className="p-5 space-y-5">
              {/* Route & Days */}
              <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Route size={16} className="text-yellow-400" />
                  <span className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Route & Running Days</span>
                </div>
                <div className="text-center">
                  <p className="text-blue-300 font-medium mb-2">
                    {train.route?.join(" → ")}
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {train.days?.map((day, i) => (
                      <span key={i} className="bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full text-xs font-semibold">
                        {day}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Journey Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2 bg-gray-900/50 border border-gray-700 rounded-xl p-3">
                  <Clock size={16} className="text-green-400 flex-shrink-0" />
                  <div>
                    <p className="text-gray-400 text-xs">Departure</p>
                    <p className="text-white font-semibold">{train.departure?.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-gray-900/50 border border-gray-700 rounded-xl p-3">
                  <MapPin size={16} className="text-blue-400 flex-shrink-0" />
                  <div>
                    <p className="text-gray-400 text-xs">Distance</p>
                    <p className="text-white font-semibold">{train.distance} km</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-gray-900/50 border border-gray-700 rounded-xl p-3">
                  <Clock size={16} className="text-red-400 flex-shrink-0" />
                  <div>
                    <p className="text-gray-400 text-xs">Arrival</p>
                    <p className="text-white font-semibold">{train.arrival?.time}</p>
                  </div>
                </div>
              </div>

              {/* Coach Types */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Armchair size={18} className="text-yellow-400" />
                  <h4 className="font-semibold text-white">Available Classes</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {train.coaches?.map((coach, i) => (
                    <div
                      key={i}
                      className="bg-gray-900/50 border border-gray-700 hover:border-gray-600 rounded-xl p-4 transition-all"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-semibold text-yellow-300">{coach.coachType}</p>
                          <p className="text-xs text-gray-500">{coach.coachCode}</p>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          coach.availableSeats > 0 
                            ? "bg-green-500/20 text-green-400" 
                            : "bg-red-500/20 text-red-400"
                        }`}>
                          {coach.availableSeats > 0 ? `${coach.availableSeats} seats` : "Full"}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-4">
                        <IndianRupee size={16} className="text-yellow-400" />
                        <span className="text-xl font-bold text-white">
                          {coach.fare?.toFixed(2) || 0}
                        </span>
                      </div>

                      {coach.availableSeats > 0 ? (
                        <button
                          className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white py-2.5 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg hover:scale-[1.02] flex items-center justify-center gap-2"
                          onClick={() =>
                            navigate("/train-seat-book", {
                              state: {
                                trainNumber: train?.trainNumber,
                                coachType: coach?.coachType,
                                trainName: train?.trainName,
                                from: from,
                                to: to,
                                journeyDate: searchDate ? searchDate : "",
                              },
                            })
                          }
                        >
                          <Armchair size={16} strokeWidth={2} />
                          Book Now
                        </button>
                      ) : (
                        <button
                          disabled
                          className="w-full bg-gray-700 text-gray-500 py-2.5 rounded-lg font-semibold cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          <AlertCircle size={16} />
                          Not Available
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrainList;