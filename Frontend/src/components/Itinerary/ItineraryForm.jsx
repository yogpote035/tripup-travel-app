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
  const [touched, setTouched] = useState({});
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const interestsList = [
    { value: "nature", icon: "🌿", label: "Nature" },
    { value: "food", icon: "🍜", label: "Food" },
    { value: "heritage", icon: "🏛️", label: "Heritage" },
    { value: "nightlife", icon: "🌃", label: "Nightlife" },
    { value: "adventure", icon: "🏔️", label: "Adventure" },
    { value: "shopping", icon: "🛍️", label: "Shopping" },
    { value: "romantic", icon: "💑", label: "Romantic" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleInterestToggle = (interest) => {
    setFormData((prev) => {
      const updated = prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest];
      return { ...prev, interests: updated };
    });
    setTouched((prev) => ({ ...prev, interests: true }));
  };

  const handleDateRangeChange = ({ startDate, endDate }) => {
    setFormData((prev) => ({
      ...prev,
      startDate,
      endDate,
    }));
    setTouched((prev) => ({ ...prev, startDate: true, endDate: true }));
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.destination.trim()) {
      errors.push("Destination is required");
    }
    if (!formData.startDate) {
      errors.push("Start date is required");
    }
    if (!formData.endDate) {
      errors.push("End date is required");
    }
    if (!formData.interests.length) {
      errors.push("Please select at least one interest");
    }
    if (!formData.tripType) {
      errors.push("Trip type is required");
    }
    if (!formData.startTime) {
      errors.push("Start time is required");
    }
    if (!formData.endTime) {
      errors.push("End time is required");
    }
    if (!formData.budget) {
      errors.push("Budget is required");
    }
    if (!formData.transportMode) {
      errors.push("Transport mode is required");
    }

    // Time validation
    if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
      errors.push("End time must be after start time");
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    
    if (errors.length > 0) {
      errors.forEach(error => toast.warn(error));
      return;
    }

    dispatch(generateItinerary(formData, navigate));
  };

  if (loading) {
    return <Loading message="Generating Itinerary for You....." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 py-12 px-4">
      <form
        onSubmit={handleSubmit}
        className="max-w-4xl mx-auto bg-gradient-to-br from-gray-800 to-gray-900 text-white shadow-2xl rounded-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-8 text-center">
          <h2 className="text-4xl font-bold tracking-wide mb-2">
            ✈️ Plan Your Dream Trip
          </h2>
          <p className="text-cyan-50 text-sm">Create a personalized itinerary in minutes</p>
        </div>

        <div className="p-8 space-y-8">
          {/* Destination */}
          <div className="space-y-2">
            <label className="block font-semibold text-lg text-cyan-300">
              📍 Destination
            </label>
            <input
              name="destination"
              value={formData.destination}
              onChange={handleChange}
              placeholder="Where are you heading?"
              className="w-full bg-gray-700/50 text-white border-2 border-gray-600 rounded-xl px-5 py-3 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all placeholder:text-gray-400"
            />
            {touched.destination && !formData.destination && (
              <p className="text-red-400 text-sm">Destination is required</p>
            )}
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <label className="block font-semibold text-lg text-cyan-300">
              📅 Trip Dates
            </label>
            <div className="bg-gray-700/30 rounded-xl p-4 border-2 border-gray-600">
              <DateRangePickerWithInlineButtons onChange={handleDateRangeChange} />
            </div>
            {touched.startDate && (!formData.startDate || !formData.endDate) && (
              <p className="text-red-400 text-sm">Please select trip dates</p>
            )}
          </div>

          {/* Interests */}
          <div className="space-y-3">
            <label className="block font-semibold text-lg text-cyan-300">
              ❤️ Select Your Interests
            </label>
            <div className="flex flex-wrap gap-3">
              {interestsList.map((interest) => (
                <button
                  type="button"
                  key={interest.value}
                  className={`px-5 py-3 border-2 rounded-xl cursor-pointer transition-all transform hover:scale-105 font-medium text-sm
                    ${
                      formData.interests.includes(interest.value)
                        ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-cyan-400 shadow-lg shadow-cyan-500/50"
                        : "bg-gray-700/50 text-gray-300 border-gray-600 hover:bg-gray-600/50 hover:border-gray-500"
                    }`}
                  onClick={() => handleInterestToggle(interest.value)}
                >
                  <span className="mr-2">{interest.icon}</span>
                  {interest.label}
                </button>
              ))}
            </div>
            {touched.interests && !formData.interests.length && (
              <p className="text-red-400 text-sm">Please select at least one interest</p>
            )}
          </div>

          {/* Grid Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Trip Type */}
            <div className="space-y-2">
              <label className="block font-semibold text-cyan-300">
                👥 Trip Type
              </label>
              <select
                name="tripType"
                value={formData.tripType}
                onChange={handleChange}
                className="w-full bg-gray-700/50 text-white border-2 border-gray-600 rounded-xl px-5 py-3 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all cursor-pointer"
              >
                <option value="">Select Trip Type</option>
                <option value="solo">🧳 Solo</option>
                <option value="couple">💑 Couple</option>
                <option value="family">👨‍👩‍👧‍👦 Family</option>
                <option value="friends">👯 Friends</option>
              </select>
              {touched.tripType && !formData.tripType && (
                <p className="text-red-400 text-sm">Trip type is required</p>
              )}
            </div>

            {/* Budget */}
            <div className="space-y-2">
              <label className="block font-semibold text-cyan-300">
                💰 Budget
              </label>
              <select
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                className="w-full bg-gray-700/50 text-white border-2 border-gray-600 rounded-xl px-5 py-3 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all cursor-pointer"
              >
                <option value="">Select Budget</option>
                <option value="low">💵 Low</option>
                <option value="medium">💴 Medium</option>
                <option value="high">💎 High</option>
              </select>
              {touched.budget && !formData.budget && (
                <p className="text-red-400 text-sm">Budget is required</p>
              )}
            </div>

            {/* Start Time */}
            <div className="space-y-2">
              <label className="block font-semibold text-cyan-300">
                🌅 Start Time
              </label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                className="w-full bg-gray-700/50 text-white border-2 border-gray-600 rounded-xl px-5 py-3 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
              />
              {touched.startTime && !formData.startTime && (
                <p className="text-red-400 text-sm">Start time is required</p>
              )}
            </div>

            {/* End Time */}
            <div className="space-y-2">
              <label className="block font-semibold text-cyan-300">
                🌇 End Time
              </label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                className="w-full bg-gray-700/50 text-white border-2 border-gray-600 rounded-xl px-5 py-3 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
              />
              {touched.endTime && !formData.endTime && (
                <p className="text-red-400 text-sm">End time is required</p>
              )}
            </div>

            {/* Transport Mode */}
            <div className="space-y-2 md:col-span-2">
              <label className="block font-semibold text-cyan-300">
                🚗 Transport Mode
              </label>
              <select
                name="transportMode"
                value={formData.transportMode}
                onChange={handleChange}
                className="w-full bg-gray-700/50 text-white border-2 border-gray-600 rounded-xl px-5 py-3 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all cursor-pointer"
              >
                <option value="">Select Mode of Transport</option>
                <option value="public">🚌 Public Transport</option>
                <option value="private">🚙 Private Vehicle</option>
                <option value="walking">🚶 Walking</option>
              </select>
              {touched.transportMode && !formData.transportMode && (
                <p className="text-red-400 text-sm">Transport mode is required</p>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border-2 border-red-500 rounded-xl p-4">
              <p className="text-red-400 font-medium">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="text-center pt-6">
            <button
              type="submit"
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold px-10 py-4 rounded-xl shadow-lg shadow-emerald-500/30 transition-all transform hover:scale-105 hover:shadow-xl hover:shadow-emerald-500/40 text-lg"
            >
              🚀 Generate Your Itinerary
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ItineraryForm;