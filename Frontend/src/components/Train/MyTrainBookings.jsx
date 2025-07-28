import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getUserTrainBookings,
  downloadTicket,
  MailTicketPdf,
} from "../../../AllStatesFeatures/Train/BookTrainTicketSlice";
import Loading from "../../General/Loading";
import { SiGmail } from "react-icons/si";
import { IoMdDownload } from "react-icons/io";

const MyTrainBookings = () => {
  const dispatch = useDispatch();
  const { booking, loading, error } = useSelector(
    (state) => state.bookTrainTicket
  );

  useEffect(() => {
    dispatch(getUserTrainBookings());
  }, [dispatch]);

  if (loading) return <Loading message="Getting Your Travel Memories..." />;

  if (error)
    return (
      <p className="text-center text-red-400 mt-20 text-lg font-medium">
        {error}
      </p>
    );

  if (!booking || booking.length === 0)
    return (
      <p className="text-center text-gray-400 mt-20 text-lg">
        You have no bookings yet.
      </p>
    );

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h2 className="text-2xl font-bold text-blue-400 mb-6 text-center">
        My Train Bookings
      </h2>

      <div className="grid gap-6">
        {Array.isArray(booking) &&
          booking.length > 0 &&
          booking.map((b, i) => (
            <div
              key={i}
              className="bg-gray-800 text-white border border-gray-700 p-5 rounded-xl shadow-md hover:shadow-lg transition-all relative"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-bold text-blue-300">
                    {b.trainName}{" "}
                    <span className="text-gray-400">({b.trainNumber})</span>
                  </h3>
                  <span className="text-sm px-2 py-1 bg-gray-700 rounded-full text-gray-300 inline-block mt-1">
                    {b.coachType}
                  </span>
                </div>

                {/* Buttons on the right */}
                <div className="flex flex-col gap-2 items-end">
                  <button
                    type="button"
                    onClick={() => dispatch(downloadTicket(b._id))}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-gray-200 hover:font-bold text-sm text-black rounded-md shadow-sm transition"
                  >
                    <IoMdDownload className="text-lg" />
                    <span>Download Ticket</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => dispatch(MailTicketPdf(b._id))}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-gray-200 hover:font-bold text-sm text-black rounded-md shadow-sm transition"
                  >
                    <SiGmail className="text-base text-red-500" />
                    <span>Mail Ticket</span>
                  </button>
                </div>
              </div>

              <div className="text-sm text-gray-300 mb-1 space-y-1">
                <p>
                  <strong>Route:</strong> {b.from} ➝ {b.to}
                </p>
                <p>
                  <strong>Journey Date:</strong>{" "}
                  {new Date(b.journeyDate).toDateString()}
                </p>
                <p>
                  <strong>Passengers:</strong> {b.passengerNames.join(", ")}
                </p>
                <p>
                  <strong>Seat Numbers:</strong>{" "}
                  <span className="text-green-400 font-semibold">
                    {b.seatNumbers.join(", ")}
                  </span>
                </p>
                <p>
                  <strong>Total Fare:</strong>{" "}
                  <span className="text-yellow-300 font-bold">₹{b.fare}</span>
                </p>
              </div>

              <div className="text-xs text-right text-gray-500 mt-3">
                Booked At: {new Date(b.bookedAt).toLocaleString()}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default MyTrainBookings;
