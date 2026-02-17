import { useSelector } from "react-redux";
import Loading from "../../General/Loading";
import { useNavigate } from "react-router-dom";
import {
  Train,
  MapPin,
  Clock,
  ArrowRight,
  Armchair,
  AlertCircle,
  Route,
  Gauge,
  IndianRupee,
} from "lucide-react";

const TrainList = ({ searchDate }) => {
  const { trains, loading, error, from, to, total } = useSelector(
    (state) => state.train
  );
  const navigate = useNavigate();

  if (loading) return <Loading message="Fetching Trains For Your Route..." />;

  if (error) {
    return (
      <div className="flex justify-center px-4 py-16">
        <div className="bg-white border border-red-200 rounded-2xl p-8 max-w-sm w-full">
          <p className="text-center text-red-500 text-sm font-medium">{error}</p>
        </div>
      </div>
    );
  }

  if (!trains || trains.length === 0) {
    return (
      <div className="flex justify-center px-4 py-16">
        <div className="bg-white border border-orange-200 rounded-2xl p-10 max-w-sm w-full text-center">
          <Train size={44} className="text-orange-200 mx-auto mb-4" strokeWidth={1.5} />
          <p className="text-stone-500 font-semibold text-base">No trains found</p>
          <p className="text-stone-400 text-sm mt-1.5">Try a different route or date</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50 px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Route Header — mimics "1 FLIGHT FOUND" bar from image */}
        <div className="bg-white border border-orange-200 rounded-2xl px-6 py-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <MapPin size={17} className="text-orange-500" />
            <span className="text-lg font-bold text-stone-800">{from}</span>
            <ArrowRight size={17} className="text-stone-300" />
            <span className="text-lg font-bold text-stone-800">{to}</span>
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-stone-400">
            {total} Train{total !== 1 ? "s" : ""} Found
          </span>
        </div>

        {/* Train Cards */}
        {trains.map((train, index) => (
          <div
            key={index}
            className="bg-white border border-orange-200 hover:border-orange-300 rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden"
          >
            {/* Card Header */}
            <div className="border-b border-orange-100 px-6 py-4 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-4">
                {/* Train Icon Box */}
                <div className="bg-orange-50 border border-orange-200 rounded-xl w-12 h-12 flex items-center justify-center flex-shrink-0">
                  <Train size={22} className="text-orange-500" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-base font-bold text-stone-800 leading-tight">{train.trainName}</p>
                  <p className="text-xs text-stone-400 mt-0.5">{train.trainNumber}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-200 rounded-full px-3 py-1.5">
                <Gauge size={13} className="text-orange-500" />
                <span className="text-xs font-bold text-orange-600">{train.trainType}</span>
              </div>
            </div>

            <div className="px-6 py-5 space-y-5">

              {/* Route & Days */}
              <div className="bg-orange-50 border border-orange-100 rounded-xl px-4 py-3">
                <div className="flex items-center gap-2 mb-2.5">
                  <Route size={13} className="text-orange-400" />
                  <span className="text-xs font-bold uppercase tracking-widest text-stone-400">Route & Running Days</span>
                </div>
                <p className="text-sm font-semibold text-blue-600 text-center mb-2.5">
                  {train.route?.join(" → ")}
                </p>
                <div className="flex flex-wrap justify-center gap-1.5">
                  {train.days?.map((day, i) => (
                    <span
                      key={i}
                      className="bg-orange-100 text-orange-600 border border-orange-200 px-2.5 py-0.5 rounded-full text-xs font-bold"
                    >
                      {day}
                    </span>
                  ))}
                </div>
              </div>

              {/* Journey Timeline — matches flight card in image */}
              <div className="flex items-center gap-4">
                {/* Departure */}
                <div className="flex-1">
                  <p className="text-xs text-stone-400 mb-0.5">Departure</p>
                  <p className="text-3xl font-bold text-stone-800 leading-none">{train.departure?.time}</p>
                  <p className="text-xs text-stone-400 mt-1">{from}</p>
                </div>

                {/* Timeline Line */}
                <div className="flex-[2] flex flex-col items-center gap-1">
                  <div className="flex items-center gap-1 text-stone-400">
                    <Clock size={11} />
                    <span className="text-xs">{train.distance} km</span>
                  </div>
                  <div className="flex items-center w-full gap-1">
                    <div className="w-2 h-2 rounded-full bg-orange-400 flex-shrink-0" />
                    <div className="flex-1 h-px bg-orange-200" />
                    <Train size={14} className="text-orange-400 flex-shrink-0" />
                    <div className="flex-1 h-px bg-orange-200" />
                    <div className="w-2 h-2 rounded-full bg-orange-400 flex-shrink-0" />
                  </div>
                </div>

                {/* Arrival */}
                <div className="flex-1 text-right">
                  <p className="text-xs text-stone-400 mb-0.5">Arrival</p>
                  <p className="text-3xl font-bold text-stone-800 leading-none">{train.arrival?.time}</p>
                  <p className="text-xs text-stone-400 mt-1">{to}</p>
                </div>
              </div>

              {/* Coach Classes */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Armchair size={15} className="text-orange-500" />
                  <span className="text-sm font-bold text-stone-700">Available Classes</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {train.coaches?.map((coach, i) => (
                    <div
                      key={i}
                      className="bg-orange-50 border border-orange-100 hover:border-orange-300 rounded-xl p-4 transition-all"
                    >
                      {/* Coach Type + Seat Badge */}
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-bold text-stone-800 text-sm">{coach.coachType}</p>
                          <p className="text-xs text-stone-400 mt-0.5">{coach.coachCode}</p>
                        </div>
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                            coach.availableSeats > 0
                              ? "bg-green-50 text-green-600 border-green-200"
                              : "bg-red-50 text-red-500 border-red-200"
                          }`}
                        >
                          {coach.availableSeats > 0 ? `${coach.availableSeats} seats` : "Full"}
                        </span>
                      </div>

                      {/* Fare */}
                      <div className="flex items-center gap-1 mb-4">
                        <IndianRupee size={17} className="text-orange-500" />
                        <span className="text-2xl font-bold text-orange-500">
                          {coach.fare?.toFixed(2) || 0}
                        </span>
                      </div>

                      {/* Button */}
                      {coach.availableSeats > 0 ? (
                        <button
                          className="w-full bg-orange-500 hover:bg-orange-400 active:scale-95 text-white py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2"
                          onClick={() =>
                            navigate("/train-seat-book", {
                              state: {
                                trainNumber: train?.trainNumber,
                                coachType: coach?.coachType,
                                trainName: train?.trainName,
                                from,
                                to,
                                journeyDate: searchDate || "",
                              },
                            })
                          }
                        >
                          <Armchair size={14} strokeWidth={2} />
                          Book Now
                        </button>
                      ) : (
                        <button
                          disabled
                          className="w-full bg-stone-100 text-stone-400 py-2.5 rounded-lg text-sm font-semibold cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          <AlertCircle size={14} />
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