import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  FaTrain,
  FaBusAlt,
  FaPlaneDeparture,
  FaBook,
  FaMapMarkedAlt,
  FaCameraRetro,
} from "react-icons/fa";

const Home = () => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  const services = [
    {
      icon: <FaTrain className="text-4xl text-blue-400" />,
      title: "Train Booking",
      description: "Reserve your seats on Indian Railways. Easy and secure!",
      path: "/train",
    },
    {
      icon: <FaBusAlt className="text-4xl text-green-400" />,
      title: "Bus Booking",
      description: "Book comfortable and affordable bus tickets in seconds.",
      path: "/bus",
    },
    {
      icon: <FaPlaneDeparture className="text-4xl text-purple-400" />,
      title: "Flight Booking",
      description: "Compare flights, get deals, and fly to your dream places.",
      path: "/flight",
    },
  ];

  const features = [
    {
      icon: <FaBook className="text-xl text-blue-400" />,
      title: "Manage Bookings",
      desc: "View your past, upcoming, and canceled journeys in one place.",
    },
    {
      icon: <FaMapMarkedAlt className="text-xl text-blue-400" />,
      title: "Full Itinerary",
      desc: "Track all your trip segments including stopovers and transfers.",
    },
    {
      icon: <FaCameraRetro className="text-xl text-blue-400" />,
      title: "Travel Diary",
      desc: "Save pictures and notes to remember your travel experiences.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 pt-20">
      {/* Hero Section */}
      <section className="bg-gray-800 py-20 px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Welcome to TripUp
        </h1>
        <p className="text-lg md:text-xl text-gray-300 mb-6 max-w-xl mx-auto">
          Your one-stop platform for booking tickets, planning itineraries, and
          recording your travel moments — via Train, Bus, or Flight.
        </p>
        <Link
          to="/bookings"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-lg font-medium transition"
        >
          Book Your Journey
        </Link>
      </section>

      {/* Services (Mode Selection) */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-100">
          Book with TripUp
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 sm:grid-cols-2 gap-8">
          {services.map((service, idx) => (
            <Link
              to={service.path}
              key={idx}
              className="bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg shadow-md hover:shadow-xl transition-all p-6 text-center"
            >
              <div className="mb-4 flex justify-center">{service.icon}</div>
              <h3 className="text-xl font-semibold mb-2 text-white">
                {service.title}
              </h3>
              <p className="text-gray-400">{service.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-12 px-6 max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10 text-gray-200">
          What You Can Do
        </h2>
        <div className="grid md:grid-cols-3  sm:grid-cols-2 gap-8">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-md hover:shadow-lg transition"
            >
              <div className="flex items-center gap-2 mb-2">{feature.icon}<h3 className="text-lg font-semibold text-white">{feature.title}</h3></div>
              <p className="text-gray-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      {!isAuthenticated && (
        <section className="bg-gray-800 py-12 text-center mt-10">
          <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-white">
            Start Your Journey Now
          </h2>
          <Link
            to="/signup"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-lg font-medium transition"
          >
            Sign Up Free
          </Link>
        </section>
      )}
    </div>
  );
};

export default Home;
