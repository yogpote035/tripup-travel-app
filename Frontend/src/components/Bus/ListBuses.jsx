import { useSelector } from "react-redux";

const ListBuses = () => {
  const { buses, loading, error } = useSelector((state) => state.bus);

  if (loading) {
    return <p className="text-center text-blue-400 mt-6">Loading buses...</p>;
  }

  if (error) {
    return <p className="text-center text-red-400 mt-6">{error}</p>;
  }

  if (buses.length === 0) {
    return (
      <p className="text-center text-gray-400 mt-6">
        No buses available for the selected route.
      </p>
    );
  }

  return (
    <div className="mt-6 max-w-4xl mx-auto px-4">
      {buses.map((bus, index) => (
        <div
          key={index}
          className="border border-gray-700 bg-gray-800 text-white rounded-2xl shadow-md p-5 mb-5"
        >
          <div className="flex flex-col md:flex-row justify-between items-center mb-3">
            <div>
              <h2 className="text-xl font-bold">{bus.company}</h2>
              <p className="text-gray-400">
                {bus.busNumber} • {bus.type}
              </p>
            </div>
            <div className="text-right mt-3 md:mt-0">
              <p className="text-lg font-semibold text-green-400">₹{bus.fare}</p>
              <p className="text-sm text-gray-400">
                {bus.availableSeats} seats left
              </p>
            </div>
          </div>

          <div className="flex justify-between items-center text-sm md:text-base text-gray-200 border-t border-b border-gray-600 py-3">
            <div className="text-center w-1/3">
              <p className="font-bold text-white">{bus.departureAt}</p>
              <p className="text-gray-400">{bus.source}</p>
            </div>

            <div className="text-center w-1/3">
              <p>{bus.duration}</p>
              <div className="w-16 h-1 bg-gray-600 mx-auto my-1 rounded-full" />
            </div>

            <div className="text-center w-1/3">
              <p className="font-bold text-white">{bus.arrivalAt}</p>
              <p className="text-gray-400">{bus.destination}</p>
            </div>
          </div>

          <div className="mt-4">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition">
              View Seats
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ListBuses;
