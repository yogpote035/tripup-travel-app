import { useSelector } from "react-redux";
import Loading from "../../General/Loading";
import { useNavigate } from "react-router-dom";

const TrainList = () => {
  const { trains, loading, error, from, to, total } = useSelector(
    (state) => state.train
  );

  const navigate = useNavigate();

  if (loading) return <Loading message="Fetching Trains For Your Route..." />;
  if (error)
    return (
      <p className="text-center text-red-400 mt-10 text-lg font-medium">
        {error}
      </p>
    );
  if (!trains || trains.length === 0)
    return (
      <p className="text-center text-gray-400 mt-10 text-lg">
        No trains found. Please search again.
      </p>
    );

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-blue-400">
          Trains From <span className="text-white">{from}</span> ➝{" "}
          <span className="text-white">{to}</span>
        </h2>
        <p className="text-gray-400 mt-1">{total} trains found</p>
      </div>

      <div className="grid gap-6">
        {trains &&
          trains.map((train, index) => (
            <div
              key={index}
              className="bg-gray-800 text-white border border-gray-700 p-5 rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-bold text-blue-300">
                  {train.trainName}{" "}
                  <span className="text-gray-400">({train.trainNumber})</span>
                </h3>
                <span className="text-sm px-2 py-1 bg-gray-700 rounded-full text-gray-300">
                  {train.trainType}
                </span>
              </div>

              <div className="text-sm mb-1">
                <strong>Route:</strong>{" "}
                <span className="text-gray-300">
                  {train.route?.join(" → ")}
                </span>
              </div>

              <div className="text-sm mb-1">
                <strong>Distance:</strong>{" "}
                <span className="text-gray-300">{train.distance} km</span>
              </div>

              <div className="text-sm mb-1">
                <strong>Running Days:</strong>{" "}
                <span className="text-gray-300">{train.days?.join(" | ")}</span>
              </div>

              <div className="flex flex-col sm:flex-row justify-between text-sm mt-3 gap-1">
                <span>
                  <strong>Departure from {from}:</strong>{" "}
                  {train.departure?.time}
                </span>
                <span>
                  <strong>Arrival to {to}:</strong> {train.arrival?.time}
                </span>
              </div>

              {/* Coaches */}
              <div className="mt-4 text-sm">
                <strong>Coach Types:</strong>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {train.coaches?.map((coach, i) => (
                    <div
                      key={i}
                      className="bg-gray-700 rounded-md p-3 text-gray-200 border border-gray-600 flex flex-col justify-between"
                    >
                      <div className="font-medium text-blue-300">
                        {coach.coachType} ({coach.coachCode})
                      </div>

                      <div className="mt-1 text-sm">
                        <span className="text-gray-300">
                          Seats:{" "}
                          {coach.availableSeats > 0 ? (
                            <span className="text-green-400 font-semibold">
                              {coach.availableSeats}
                            </span>
                          ) : (
                            <span className="text-red-500 font-semibold">
                              0 (Unavailable)
                            </span>
                          )}
                        </span>
                      </div>

                      <div className="text-sm mt-1 text-gray-300">
                        Fare:{" "}
                        <span className="text-white font-bold">
                          ₹{coach.fare?.toFixed(2) || 0}
                        </span>
                      </div>

                      {coach.availableSeats > 0 && (
                        <button
                          className="mt-3 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm font-semibold text-white transition outline-none focus:outline-none"
                          onClick={() =>
                            navigate("/train-seat-book", {
                              state: {
                                trainNumber: train?.trainNumber,
                                coachType: train?.coachType,
                                trainName: train?.trainName,
                                from: from,
                                to: to,
                              },
                            })
                          }
                        >
                          Book Now
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default TrainList;
