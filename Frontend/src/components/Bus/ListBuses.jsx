import { useSelector } from "react-redux";
import Loading from "../../General/Loading";
import { useNavigate } from "react-router-dom";
import { 
  Bus, 
  MapPin, 
  Clock, 
  ArrowRight, 
  Users, 
  IndianRupee,
  Calendar,
  Armchair
} from "lucide-react";

const ListBuses = () => {
  const { buses, loading, error } = useSelector((state) => state.bus);
  const navigate = useNavigate();

  if (loading) return <Loading message="Fetching Buses...." />;
  if (error) return (
    <div className="flex flex-col items-center justify-center mt-12 px-4">
      <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 max-w-md">
        <p className="text-center text-red-400 text-lg">{error}</p>
      </div>
    </div>
  );
  
  if (buses.length === 0)
    return (
      <div className="flex flex-col items-center justify-center mt-12 px-4">
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 max-w-md text-center">
          <Bus size={48} className="text-gray-600 mx-auto mb-4" strokeWidth={1.5} />
          <p className="text-gray-400 text-lg mb-2">No buses available</p>
          <p className="text-gray-500 text-sm">Try searching for a different route or date</p>
        </div>
      </div>
    );

  return (
    <div className="mt-6 mb-8 max-w-5xl mx-auto px-4">
      {/* Results Header */}
      <div className="mb-6 flex items-center gap-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-4">
        <Bus size={24} className="text-green-400" strokeWidth={2} />
        <div>
          <h2 className="text-xl font-semibold text-white">Available Buses</h2>
          <p className="text-sm text-gray-400">{buses.length} bus{buses.length !== 1 ? 'es' : ''} found for your journey</p>
        </div>
      </div>

      {/* Bus Cards */}
      <div className="space-y-5">
        {buses.map((bus, index) => (
          <div
            key={index}
            className="border border-gray-700 bg-gradient-to-br from-gray-800 to-gray-900 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden hover:border-gray-600"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-b border-gray-700 p-5">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-start gap-3">
                  <div className="bg-green-500/20 p-3 rounded-xl">
                    <Bus size={24} className="text-green-400" strokeWidth={2} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{bus.company}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-gray-400 text-sm">{bus.busNumber}</span>
                      <span className="text-gray-600">•</span>
                      <span className="text-gray-400 text-sm">{bus.type}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1 text-2xl font-bold text-green-400">
                    <IndianRupee size={20} strokeWidth={2.5} />
                    <span>{bus.fare}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-400 mt-1">
                    <Users size={14} />
                    <span>{bus.availableSeats} seats left</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Journey Details */}
            <div className="p-5">
              <div className="flex justify-between items-center mb-5">
                {/* Departure */}
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin size={16} className="text-gray-400" />
                    <span className="text-gray-400 text-sm">{bus.source}</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{bus.departureAt}</p>
                </div>

                {/* Duration */}
                <div className="flex-1 flex flex-col items-center px-4">
                  <div className="flex items-center gap-1 text-gray-400 text-sm mb-2">
                    <Clock size={14} />
                    <span>{bus.duration}</span>
                  </div>
                  <div className="w-full max-w-[120px] relative">
                    <div className="h-1 bg-gradient-to-r from-green-400 via-emerald-400 to-green-400 rounded-full"></div>
                    <div className="absolute -top-1 left-0 w-3 h-3 bg-green-400 rounded-full"></div>
                    <div className="absolute -top-1 right-0 w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                </div>

                {/* Arrival */}
                <div className="flex-1 text-right">
                  <div className="flex items-center justify-end gap-2 mb-2">
                    <span className="text-gray-400 text-sm">{bus.destination}</span>
                    <MapPin size={16} className="text-gray-400" />
                  </div>
                  <p className="text-2xl font-bold text-white">{bus.arrivalAt}</p>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() =>
                  navigate(`/bus-seat/${bus.busId}`, {
                    state: {
                      bus,
                      seats: bus?.seats || 0,
                      journeyDate: bus.journeyDate,
                      source: bus.source,
                      destination: bus.destination,
                    },
                  })
                }
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 px-4 rounded-xl transition-all font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-[1.02]"
              >
                <Armchair size={20} strokeWidth={2} />
                View Seats & Book
                <ArrowRight size={20} strokeWidth={2} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListBuses;