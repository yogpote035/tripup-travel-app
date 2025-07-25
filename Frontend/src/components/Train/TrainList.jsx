import { useSelector } from "react-redux";
import Loading from "../../General/Loading";

const TrainList = () => {
  const { trains, loading, error } = useSelector((state) => state.train);

  if (loading) {
    return <Loading message="Fetching Trains"/>;
  }

  if (error) {
    return (
      <p className="text-center text-red-400 mt-10 text-lg">Error: {error}</p>
    );
  }

  if (!trains || trains.length === 0) {
    return (
      <p className="text-center text-gray-400 mt-10 text-lg">
        No trains found. Please search.
      </p>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4">
      <h3 className="text-2xl font-semibold text-white mb-6 text-center">
        Available Trains
      </h3>
      <div className="grid gap-6">
        {trains.map((train, index) => (
          <div
            key={index}
            className="bg-gray-800 text-white border border-gray-600 p-5 rounded-lg shadow hover:shadow-lg transition"
          >
            <div className="flex justify-between items-center">
              <h4 className="text-lg font-bold text-blue-400">
                {train.trainName} ({train.trainNumber})
              </h4>
              <p className="text-sm text-gray-400">{train.trainType}</p>
            </div>
            <div className="text-sm mt-2">
              Route:{" "}
              <span className="text-gray-300">{train.route?.join(" → ")}</span>
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span>🕓 Departure: {train.departure?.time}</span>
              <span>🕘 Arrival: {train.arrival?.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrainList;
