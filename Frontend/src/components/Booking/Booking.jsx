import { TrainFront, Bus, PlaneTakeoff, History, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Loading from "../../General/Loading";
import { useSelector } from "react-redux";

const Bookings = () => {
  const { loading, error } = useSelector((state) => state.train);

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
      icon: <TrainFront strokeWidth={2} />,
      title: "Train Booking",
      path: "/train-bookings",
      gradient: "from-yellow-500 to-orange-500",
      bgGradient: "from-yellow-500/10 to-orange-500/10",
      description: "View your train journey history"
    },
    {
      icon: <Bus strokeWidth={2} />,
      title: "Bus Booking",
      path: "/bus-bookings",
      gradient: "from-green-400 to-emerald-500",
      bgGradient: "from-green-400/10 to-emerald-500/10",
      description: "View your bus journey history"
    },
    {
      icon: <PlaneTakeoff strokeWidth={2} />,
      title: "Flight Booking",
      path: "/flight-bookings",
      gradient: "from-purple-400 to-indigo-500",
      bgGradient: "from-purple-400/10 to-indigo-500/10",
      description: "View your flight journey history"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 text-white p-6">
      <section className="py-16 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col items-center mb-12">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur-2xl opacity-30 animate-pulse"></div>
            <img
              src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYzJ4cXE3YmRhc2I4Ymh2cmxkcjk4djg1a3RjNHQ5ZXJrZHplajg3ciZlcD12MV9naWZzX3NlYXJjaCZjdD1n/uY4CJ1kPx3gxpn9HD5/giphy.gif"
              alt="Travel"
              className="relative rounded-full h-60 w-60 object-cover shadow-2xl border-4 border-indigo-500/30"
            />
          </div>
          
          <div className="text-center mb-4">
            <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 rounded-full px-4 py-2 mb-4">
              <History size={16} className="text-indigo-400" />
              <span className="text-sm text-indigo-300 font-medium">Your Travel Records</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              History of Your Journey
            </h2>
            <p className="text-gray-400 text-lg">Explore all your past bookings and travel memories</p>
          </div>
        </div>

        {/* Service Cards */}
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 px-4">
          {services.map((service, idx) => (
            <Link
              to={service.path}
              key={idx}
              className="group relative bg-gray-800 border border-gray-700 hover:border-gray-600 rounded-2xl p-8 text-center shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden"
            >
              {/* Gradient Background on Hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${service.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
              
              <div className="relative z-10">
                {/* Icon Badge */}
                <div className="mb-6 flex justify-center">
                  <div className={`bg-gradient-to-br ${service.gradient} p-5 rounded-2xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                    <div className="text-white w-12 h-12 flex items-center justify-center">
                      {service.icon}
                    </div>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-2xl font-semibold mb-2 text-white">
                  {service.title}
                </h3>

                {/* Description */}
                <p className="text-gray-400 text-sm mb-4">{service.description}</p>

                {/* Call to Action */}
                <div className="inline-flex items-center gap-2 text-sm font-medium bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent group-hover:gap-3 transition-all">
                  View History
                  <ArrowRight size={16} className="text-indigo-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Bookings;