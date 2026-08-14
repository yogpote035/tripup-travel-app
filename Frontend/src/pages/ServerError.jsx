import React from 'react';
import { AlertTriangle, Home, RefreshCw, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * 500 Internal Server Error Page
 * Displayed when the server encounters an unexpected error
 */
const ServerError = ({ error = null }) => {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
                {/* Animated 500 */}
                <div className="mb-8">
                    <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-400 animate-pulse">
                        500
                    </h1>
                </div>

                {/* Icon */}
                <div className="mb-6">
                    <AlertTriangle className="w-20 h-20 mx-auto text-red-500 animate-bounce" />
                </div>

                {/* Content */}
                <h2 className="text-3xl font-bold text-white mb-3">
                    Server Error
                </h2>

                <p className="text-gray-300 mb-4">
                    Something went wrong on our end. Our team has been notified and is
                    working to fix it.
                </p>

                {/* Error Details (Dev Mode) */}
                {error && process.env.NODE_ENV === 'development' && (
                    <div className="mb-6 p-3 bg-red-900 bg-opacity-30 rounded-lg text-left border border-red-500">
                        <p className="text-xs text-red-300 font-mono">
                            {error}
                        </p>
                    </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                    <Link
                        to="/"
                        className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
                    >
                        <Home size={20} />
                        Go Home
                    </Link>

                    <button
                        onClick={() => window.location.reload()}
                        className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition"
                    >
                        <RefreshCw size={20} />
                        Retry
                    </button>
                </div>

                {/* Support Contact */}
                <div className="p-4 bg-slate-700 bg-opacity-50 rounded-lg">
                    <p className="text-sm text-gray-300 mb-3">Need help?</p>
                    <a
                        href="mailto:support@tripup.com"
                        className="flex items-center justify-center gap-2 text-blue-400 hover:text-blue-300 transition"
                    >
                        <Mail size={18} />
                        Contact Support
                    </a>
                </div>

                {/* Status Info */}
                <div className="mt-6 text-xs text-gray-500">
                    Error Code: 500 | {new Date().toLocaleString()}
                </div>
            </div>
        </div>
    );
};

export default ServerError;
