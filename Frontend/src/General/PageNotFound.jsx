import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Home,
  ArrowLeft,
  Compass,
  Search,
  AlertCircle,
} from "lucide-react";

const PageNotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center py-5">
        {/* Icon */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
          <div className="relative inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-gray-800 to-gray-900 border-4 border-gray-700 rounded-full shadow-2xl">
            <div className="relative">
              <MapPin size={64} className="text-blue-400" strokeWidth={1.5} />
              <div className="absolute -top-1 -right-1 bg-red-500 rounded-full p-1">
                <AlertCircle
                  size={24}
                  className="text-white"
                  strokeWidth={2.5}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 404 Text */}
        <div className="mb-6">
          <h1 className="text-9xl font-bold bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent mb-4">
            404
          </h1>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Oops! Lost in Transit
          </h2>
          <p className="text-lg text-gray-400 mb-2">
            Looks like this route doesn't exist in our travel map.
          </p>
          <p className="text-gray-500">
            The page you're looking for might have been moved, deleted, or never
            existed.
          </p>
        </div>

        {/* Decorative Elements */}
        <div className="flex justify-center gap-4 mb-8">
          <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 px-4 py-2 rounded-full">
            <Compass size={16} className="text-blue-400" />
            <span className="text-gray-400 text-sm">Route not found</span>
          </div>
          <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 px-4 py-2 rounded-full">
            <Search size={16} className="text-purple-400" />
            <span className="text-gray-400 text-sm">Error 404</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 text-white px-6 py-3 rounded-xl transition-all shadow-lg hover:shadow-xl font-semibold"
          >
            <ArrowLeft size={20} strokeWidth={2} />
            Go Back
          </button>

          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105 font-semibold"
          >
            <Home size={20} strokeWidth={2} />
            Back to Home
          </button>
        </div>

        {/* Additional Help Text */}
        <div className="mt-12 p-6 bg-gray-800/50 border border-gray-700 rounded-2xl">
          <h3 className="text-lg font-semibold text-white mb-3">Need Help?</h3>
          <p className="text-gray-400 text-sm mb-4">
            If you think this is a mistake, try these options:
          </p>
          <ul className="text-gray-500 text-sm space-y-2">
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
              Check the URL for typos
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></div>
              Return to the homepage and navigate from there
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
              Use the navigation menu to find what you're looking for
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PageNotFound;
