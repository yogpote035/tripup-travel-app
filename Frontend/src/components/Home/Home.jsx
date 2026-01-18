import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import React from "react";
import {
  TrainFront,
  Bus,
  PlaneTakeoff,
  BookOpen,
  MapPin,
  Camera,
  Sparkles,
  ArrowRight,
} from "lucide-react";

const Home = () => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  const services = [
    {
      icon: <TrainFront className="text-5xl" strokeWidth={1.5} />,
      title: "Train Booking",
      description: "Reserve your seats on Indian Railways. Easy and secure!",
      path: "/train",
      gradient: "from-yellow-500 to-orange-500",
      bgGradient: "from-yellow-500/10 to-orange-500/10",
    },
    {
      icon: <Bus className="text-5xl" strokeWidth={1.5} />,
      title: "Bus Booking",
      description: "Book comfortable and affordable bus tickets in seconds.",
      path: "/bus",
      gradient: "from-green-400 to-emerald-500",
      bgGradient: "from-green-400/10 to-emerald-500/10",
    },
    {
      icon: <PlaneTakeoff className="text-5xl" strokeWidth={1.5} />,
      title: "Flight Booking",
      description: "Compare flights, get deals, and fly to your dream places.",
      path: "/flight",
      gradient: "from-purple-400 to-indigo-500",
      bgGradient: "from-purple-400/10 to-indigo-500/10",
    },
  ];

  const features = [
    {
      icon: <BookOpen size={24} strokeWidth={2} className="text-yellow-500" />,
      title: "Manage Bookings",
      desc: "View your past, upcoming, and canceled journeys in one place.",
    },
    {
      icon: <MapPin size={24} strokeWidth={2} className="text-yellow-500" />,
      title: "Full Itinerary",
      desc: "Track all your trip segments including stopovers and transfers.",
    },
    {
      icon: <Camera size={24} strokeWidth={2} className="text-yellow-500" />,
      title: "Travel Diary",
      desc: "Save pictures and notes to remember your travel experiences.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 text-gray-100 pt-20">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 py-24 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent"></div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded-full px-4 py-2 mb-6">
            <Sparkles size={16} className="text-blue-400" />
            <span className="text-sm text-blue-300 font-medium">Your Journey Begins Here</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Welcome to <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">TripUp</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Your one-stop platform for booking tickets, planning itineraries, and
            recording your travel moments — via Train, Bus, or Flight.
          </p>
          <Link
            to="/itinerary"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-105"
          >
            Create Your Plan
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Services (Mode Selection) */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-4 text-white">
          Book with TripUp
        </h2>
        <p className="text-center text-gray-400 mb-12 text-lg">Choose your preferred mode of travel</p>
        <div className="grid grid-cols-1 md:grid-cols-3 sm:grid-cols-2 gap-8">
          {services.map((service, idx) => (
            <Link
              to={service.path}
              key={idx}
              className="group relative bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-gray-600 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 text-center overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${service.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
              <div className="relative z-10">
                <div className="mb-6 flex justify-center">
                  <div className={`bg-gradient-to-br ${service.gradient} p-4 rounded-2xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                    <div className="text-white">
                      {React.cloneElement(service.icon, { className: "w-12 h-12", strokeWidth: 2 })}
                    </div>
                  </div>
                </div>
                <h3 className="text-2xl font-semibold mb-3 text-white">
                  {service.title}
                </h3>
                <p className="text-gray-400 leading-relaxed mb-4">{service.description}</p>
                <div className="inline-flex items-center gap-2 text-sm font-medium bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent group-hover:gap-3 transition-all">
                  Book Now
                  <ArrowRight size={16} className="text-blue-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-16 px-6 max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-white">
          What You Can Do
        </h2>
        <p className="text-center text-gray-400 mb-12 text-lg">Explore all the features TripUp offers</p>
        <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-8">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-8 shadow-md hover:shadow-xl hover:border-gray-600 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-yellow-500/10 p-3 rounded-lg">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
              </div>
              <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      {!isAuthenticated && (
        <section className="relative bg-gradient-to-br from-gray-800 via-blue-900/20 to-gray-800 py-16 text-center mt-12 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-600/10 via-transparent to-transparent"></div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              Start Your Journey Now
            </h2>
            <p className="text-gray-300 mb-8 text-lg">Join thousands of travelers exploring the world</p>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              Sign Up Free
              <ArrowRight size={20} />
            </Link>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;