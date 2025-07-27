import { useState } from "react";
import { toast } from "react-toastify";
import { useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { bookTrainSeats } from "../../../AllStatesFeatures/Train/BookTrainTicketSlice";
const TrainSeatBooking = () => {
  const { state } = useLocation();
  const { loading, error } = useSelector((state) => state.bookTrainTicket);

  const dispatch = useDispatch();
  const [trainNumber, setTrainNumber] = useState(state?.trainNumber || "");
  const [trainName, setTrainName] = useState(state?.trainName || "");
  const [coachType, setCoachType] = useState(state?.coachType || "Sleeper");
  const [from, setFrom] = useState(state?.from || "");
  const [to, setTo] = useState(state?.to || "");
  const [journeyDate, setJourneyDate] = useState(
    state?.journeyDate || new Date().toISOString().split("T")[0]
  );

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [passengerNames, setPassengerNames] = useState([""]);

  const handlePassengerChange = (index, value) => {
    const updated = [...passengerNames];
    updated[index] = value;
    setPassengerNames(updated);
  };

  const addPassenger = () => setPassengerNames([...passengerNames, ""]);
  const removePassenger = (index) =>
    setPassengerNames(passengerNames.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !trainNumber ||
      !coachType ||
      !from ||
      !to ||
      !journeyDate ||
      !passengerNames
    ) {
      return toast.warn("All fields are required.");
    }

    if (passengerNames.some((name) => !name.trim())) {
      return toast.warn("Please fill in all passenger names.");
    }

    toast.success("✅ " + "Data is Received");
    const sampleObject = {
      userId: localStorage.getItem("userId"),
      trainNumber,
      trainName,
      coachType,
      passengerNames,
      from,
      to,
      journeyDate,
      ...(email && { email }),
      ...(phone && { phone }),
    };
    dispatch(bookTrainSeats(sampleObject));
    console.log(sampleObject);
  };

  return (
    <div className="max-w-xl mx-auto mt-12 mb-6 p-6 bg-gray-800 text-white rounded-lg shadow space-y-4">
      <h2 className="text-2xl font-bold text-blue-400 text-center mb-4">
        Book Train Tickets
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Train Name</label>
          <input
            type="text"
            value={trainName}
            disabled
            className="w-full px-3 py-2 cursor-not-allowed  rounded bg-gray-700 text-white border border-gray-600 outline-none focus:outline-none"
          />
        </div>
        <div>
          <label className="block mb-1">Train Number</label>
          <input
            type="text"
            value={trainNumber}
            disabled
            className="w-full px-3 py-2 rounded cursor-not-allowed  bg-gray-700 text-white border border-gray-600 outline-none focus:outline-none"
          />
        </div>

        <div>
          <label className="block mb-1">Coach Type</label>
          <input
            type="text"
            value={coachType}
            disabled
            className="w-full px-3 cursor-not-allowed py-2 rounded bg-gray-700 text-white border border-gray-600 outline-none focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">From</label>
            <input
              type="text"
              value={from}
              disabled
              className="w-full px-3 py-2 rounded cursor-not-allowed  bg-gray-700 text-white border border-gray-600 outline-none focus:outline-none"
            />
          </div>
          <div>
            <label className="block mb-1">To</label>
            <input
              type="text"
              value={to}
              disabled
              className="w-full px-3 py-2 rounded cursor-not-allowed  bg-gray-700 text-white border border-gray-600 outline-none focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block mb-1">Journey Date</label>
          <input
            type="date"
            value={journeyDate}
            onChange={(e) => setJourneyDate(e.target.value)}
            className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 outline-none focus:outline-none"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">Email (Optional)</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@mail.com"
              className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 outline-none focus:outline-none"
            />
          </div>
          <div>
            <label className="block mb-1">Phone (Optional)</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="9876543210"
              className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 outline-none focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block mb-2">Passenger Names</label>
          {passengerNames.map((name, index) => (
            <div key={index} className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={name}
                onChange={(e) => handlePassengerChange(index, e.target.value)}
                placeholder={`Passenger ${index + 1}`}
                className="flex-1 px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 outline-none focus:outline-none"
              />
              {passengerNames.length > 1 && (
                <button
                  type="button"
                  onClick={() => removePassenger(index)}
                  className="text-red-400 hover:text-red-600"
                >
                  ✖
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addPassenger}
            className="mt-2 text-blue-400 hover:text-blue-600 text-sm"
          >
            + Add Passenger
          </button>
        </div>

        <button
          type="submit"
          className="w-full py-2 bg-white hover:bg-gray-200 rounded font-bold text-black transition"
        >
          Book Now
        </button>
        {error && <p className="text-red-500">{error}</p>}
      </form>
    </div>
  );
};

export default TrainSeatBooking;
