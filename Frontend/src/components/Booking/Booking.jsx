import { FaBusAlt, FaPlaneDeparture } from "react-icons/fa";
import { FaTrain } from "react-icons/fa6";
import { Link } from "react-router-dom";
import Loading from "../../General/Loading";
import { useSelector } from "react-redux";

const Bookings = () => {
  const { loading, error, total } = useSelector((state) => state.train);

  if (loading)
    return (
      <Loading message="Fetching Your Journey's and Revise Your Moments" />
    );

  if (error)
    return (
      <p className="text-center text-red-400 mt-10 text-lg font-medium">
        {error}
      </p>
    );

  const services = [
    {
      icon: <FaTrain className="text-5xl text-gray-100" />,
      title: "Train Booking",
      path: "/train-bookings",
    },
    {
      icon: <FaBusAlt className="text-5xl text-gray-100" />,
      title: "Bus Booking",
      path: "/bus-bookings",
    },
    {
      icon: <FaPlaneDeparture className="text-5xl text-gray-100" />,
      title: "Flight Booking",
      path: "/flight-bookings",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <section className="py-16 max-w-7xl mx-auto">
        <div className="flex justify-center mb-10">
          <img
            src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYzJ4cXE3YmRhc2I4Ymh2cmxkcjk4djg1a3RjNHQ5ZXJrZHplajg3ciZlcD12MV9naWZzX3NlYXJjaCZjdD1n/uY4CJ1kPx3gxpn9HD5/giphy.gif"
            alt="Travel"
            className="rounded-full h-60 w-60 object-cover shadow-lg"
          />
        </div>
        <h2 className="text-4xl font-bold text-center mb-12 text-indigo-200">
          History of Your Journey
        </h2>
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 px-4">
          {services.map((service, idx) => (
            <Link
              to={service.path}
              key={idx}
              className="bg-gray-800 border border-gray-700 rounded-xl p-6 text-center shadow-md hover:shadow-2xl hover:scale-105 transition-transform duration-100"
            >
              <div className="mb-4 flex justify-center">{service.icon}</div>
              <h3 className="text-2xl font-semibold">{service.title}</h3>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Bookings;
