import ItineraryPlanner from "./ItineraryPlanner";

const Itinerary = () => {
  return (
    <div className="p-6 text-center">
      <h1 className="text-2xl font-semibold text-rose-600">Itinerary</h1>
      <p className="text-gray-500 mt-2">Manage your journey schedule here.</p>
      <ItineraryPlanner/>
    </div>
  );
};

export default Itinerary;
