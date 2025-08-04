import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const INTERESTS = ["Nature", "Food", "History", "Shopping", "Adventure"];

const ItineraryPlanner = () => {
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [interests, setInterests] = useState([]);
  const [generatedPlan, setGeneratedPlan] = useState(null);

  const toggleInterest = (interest) => {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const handleGenerate = () => {
    if (!destination || !startDate || !endDate || interests.length === 0) {
      alert("Please fill all fields.");
      return;
    }

    const days = Math.max(
      1,
      Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1
    );

    const plan = Array.from({ length: days }, (_, i) => ({
      day: `Day ${i + 1}`,
      activities: interests.map((interest) => `Explore ${interest} spots`),
    }));

    setGeneratedPlan({
      destination,
      dateRange: `${startDate.toDateString()} - ${endDate.toDateString()}`,
      plan,
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6 text-white">
      <div className="max-w-4xl mx-auto bg-gray-800 border border-yellow-300 p-6 rounded-md shadow-md">
        <h1 className="text-2xl font-bold text-yellow-400 mb-4">
          🧳 TripUp Itinerary Planner
        </h1>

        {/* Destination */}
        <div className="mb-4">
          <label className="text-sm font-semibold block text-gray-300">Destination</label>
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Enter city"
            className="w-full border border-gray-600 bg-gray-700 text-white p-2 rounded mt-1 focus:outline-none"
          />
        </div>

        {/* Dates */}
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <label className="text-sm font-semibold block text-gray-300">Start Date</label>
            <DatePicker
              selected={startDate}
              onChange={setStartDate}
              className="w-full border border-gray-600 bg-gray-700 text-white p-2 rounded mt-1"
              placeholderText="Select start date"
              calendarClassName="bg-white text-black"
            />
          </div>
          <div className="flex-1">
            <label className="text-sm font-semibold block text-gray-300">End Date</label>
            <DatePicker
              selected={endDate}
              onChange={setEndDate}
              className="w-full border border-gray-600 bg-gray-700 text-white p-2 rounded mt-1"
              placeholderText="Select end date"
              calendarClassName="bg-white text-black"
            />
          </div>
        </div>

        {/* Interests */}
        <div className="mb-6">
          <label className="text-sm font-semibold block text-gray-300">Interests</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {INTERESTS.map((interest) => (
              <button
                key={interest}
                type="button"
                onClick={() => toggleInterest(interest)}
                className={`px-3 py-1 border rounded-full text-sm transition-all ${
                  interests.includes(interest)
                    ? "bg-yellow-500 text-black border-yellow-500"
                    : "bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600"
                }`}
              >
                {interest}
              </button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          className="bg-yellow-500 text-black px-6 py-2 rounded hover:bg-yellow-400 font-semibold"
        >
          🧠 Generate Plan
        </button>

        {/* Output */}
        {generatedPlan && (
          <div className="mt-8 border-t border-gray-700 pt-6">
            <h2 className="text-xl font-bold mb-2 text-yellow-300">
              🗓️ Itinerary for {generatedPlan.destination}
            </h2>
            <p className="text-sm text-gray-400 mb-4">{generatedPlan.dateRange}</p>
            <div className="space-y-4">
              {generatedPlan.plan.map((day, idx) => (
                <div
                  key={idx}
                  className="bg-gray-700 p-4 rounded shadow-sm border border-gray-600"
                >
                  <h3 className="font-semibold text-yellow-200">{day.day}</h3>
                  <ul className="list-disc ml-5 text-gray-100 mt-1">
                    {day.activities.map((act, i) => (
                      <li key={i}>{act}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItineraryPlanner;
