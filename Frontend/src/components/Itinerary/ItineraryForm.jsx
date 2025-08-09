import { useState } from "react";
import DateRangePickerWithInlineButtons from "../../General/DateRangePickerWithInlineButtons";
import { toast } from "react-toastify";
import { generateItinerary } from "../../../AllStatesFeatures/Itinerary/AllItinerarySlice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Loading from "../../General/Loading";

const ItineraryForm = () => {
  const { loading, error } = useSelector((state) => state.itinerary);
  const [formData, setFormData] = useState({
    destination: "",
    startDate: "",
    endDate: "",
    interests: [],
    tripType: "",
    startTime: "",
    endTime: "",
    budget: "",
    transportMode: "",
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const interestsList = [
    "nature",
    "food",
    "heritage",
    "nightlife",
    "adventure",
    "shopping",
    "romantic",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleInterestToggle = (interest) => {
    setFormData((prev) => {
      const updated = prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest];
      return { ...prev, interests: updated };
    });
  };

  const handleDateRangeChange = ({ startDate, endDate }) => {
    setFormData((prev) => ({
      ...prev,
      startDate,
      endDate,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.budget ||
      !formData.destination ||
      !formData.endDate ||
      !formData.endTime ||
      !formData.interests ||
      !formData.interests.length ||
      !formData.startDate ||
      !formData.startTime ||
      !formData.transportMode ||
      !formData.tripType
    ) {
      return toast.warn("Please Fill All Fields For Planning.... ");
    }
    dispatch(generateItinerary(formData, navigate));
  };

  if (loading) {
    return <Loading message="Generating Itinerary for You....." />;
  }
  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 max-w-2xl mx-auto bg-gray-800 text-white mt-10 mb-10 shadow-xl rounded-xl space-y-6"
    >
      <h2 className="text-3xl font-bold text-cyan-400 text-center tracking-wide">
        ✈️ Plan Your Trip
      </h2>

      <div>
        <label className="block font-medium mb-1">Destination</label>
        <input
          name="destination"
          required
          value={formData.destination}
          onChange={handleChange}
          placeholder="Enter destination"
          className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400"
        />
      </div>

      <label className="font-medium mb-1">Trip Dates</label>
      <div className="flex justify-baseline items-start">
        <DateRangePickerWithInlineButtons onChange={handleDateRangeChange} />
      </div>

      <div>
        <label className="block font-medium mb-1">Select Interests</label>
        <div className="flex flex-wrap gap-3">
          {interestsList.map((interest) => (
            <span
              key={interest}
              className={`px-3 py-1 border rounded-full cursor-pointer transition text-sm  outline-none focus:outline-none
                ${
                  formData.interests.includes(interest)
                    ? "bg-cyan-500 text-white border-cyan-500"
                    : "bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700"
                }`}
              onClick={() => handleInterestToggle(interest)}
            >
              {interest}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block font-medium mb-1">Trip Type</label>
          <select
            name="tripType"
            required
            value={formData.tripType}
            onChange={handleChange}
            className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-4 py-2 outline-none focus:outline-none"
          >
            <option value="">Select Trip Type</option>
            <option value="solo">Solo</option>
            <option value="couple">Couple</option>
            <option value="family">Family</option>
            <option value="friends">Friends</option>
          </select>
        </div>

        <div>
          <label className="block font-medium mb-1">Budget</label>
          <select
            required
            name="budget"
            value={formData.budget}
            onChange={handleChange}
            className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-4 py-2  outline-none focus:outline-none"
          >
            <option value="">Select Budget</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div>
          <label className="block font-medium mb-1">Start Time</label>
          <input
            required
            type="time"
            name="startTime"
            value={formData.startTime}
            onChange={handleChange}
            className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-4 py-2  outline-none focus:outline-none"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">End Time</label>
          <input
            required
            type="time"
            name="endTime"
            value={formData.endTime}
            onChange={handleChange}
            className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-4 py-2  outline-none focus:outline-none"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Transport Mode</label>
          <select
            required
            name="transportMode"
            value={formData.transportMode}
            onChange={handleChange}
            className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-4 py-2  outline-none focus:outline-none"
          >
            <option value="">Mode of Transport</option>
            <option value="public">Public Transport</option>
            <option value="private">Private Vehicle</option>
            <option value="walking">Walking</option>
          </select>
        </div>
      </div>

      <div className="text-center pt-4">
        <button
          type="submit"
          className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition"
        >
          🚀 Generate Itinerary
        </button>
      </div>
      {error && <p className="text-red-500 mt-3 mb-3">{error}</p>}
    </form>
  );
};

export default ItineraryForm;
