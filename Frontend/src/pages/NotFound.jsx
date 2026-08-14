import React from 'react';
import { AlertCircle, Home, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * 404 Not Found Page
 * Displayed when a requested route doesn't exist
 */
const NotFound = () => {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
                {/* Animated 404 */}
                <div className="mb-8">
                    <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 animate-pulse">
                        404
                    </h1>
                </div>

                {/* Icon */}
                <div className="mb-6">
                    <AlertCircle className="w-20 h-20 mx-auto text-orange-500 animate-bounce" />
                </div>

                {/* Content */}
                <h2 className="text-3xl font-bold text-white mb-3">
                    Page Not Found
                </h2>

                <p className="text-gray-300 mb-8">
                    The page you're looking for doesn't exist. It might have been moved or
                    deleted.
                </p>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        to="/"
                        className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
                    >
                        <Home size={20} />
                        Go Home
                    </Link>

                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition"
                    >
                        <RefreshCw size={20} />
                        Go Back
                    </button>
                </div>

                {/* Additional Info */}
                <div className="mt-12 p-4 bg-slate-700 bg-opacity-50 rounded-lg">
                    <p className="text-sm text-gray-400">
                        Error Code: 404 | {new Date().toLocaleString()}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
