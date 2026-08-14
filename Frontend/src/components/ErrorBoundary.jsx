import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * Error Boundary Component
 * Catches and displays errors from child components
 * Provides fallback UI and error tracking
 */
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            errorCount: 0,
        };
    }

    /**
     * Update state so the next render will show the fallback UI
     */
    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    /**
     * Log error to error reporting service
     */
    componentDidCatch(error, errorInfo) {
        // Log error details
        console.error('Error caught by boundary:', error);
        console.error('Error info:', errorInfo);

        // Update state
        this.setState((prevState) => ({
            error,
            errorInfo,
            errorCount: prevState.errorCount + 1,
        }));

        // Log to error tracking service (e.g., Sentry, Rollbar)
        if (process.env.NODE_ENV === 'production') {
            this.logErrorToService(error, errorInfo);
        }
    }

    /**
     * Send error to external logging service
     */
    logErrorToService = (error, errorInfo) => {
        try {
            // Replace with your error tracking service
            console.log('📊 Error logged to service:', {
                message: error.toString(),
                stack: errorInfo.componentStack,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
            });
        } catch (e) {
            console.error('Failed to log error:', e);
        }
    };

    /**
     * Reset error boundary
     */
    resetError = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center px-4">
                    <div className="max-w-md w-full">
                        {/* Error Icon */}
                        <div className="mb-6 text-center">
                            <AlertTriangle className="w-16 h-16 mx-auto text-yellow-500 animate-pulse" />
                        </div>

                        {/* Error Title */}
                        <h1 className="text-2xl font-bold text-white text-center mb-3">
                            Oops! Something went wrong
                        </h1>

                        {/* Error Message */}
                        <p className="text-gray-300 text-center mb-6">
                            We encountered an unexpected error. Our team has been notified.
                        </p>

                        {/* Error Details (Development Only) */}
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <div className="mb-6 p-4 bg-red-900 bg-opacity-20 rounded-lg border border-red-500">
                                <p className="text-xs font-mono text-red-300 mb-3 font-bold">
                                    Error Details:
                                </p>
                                <p className="text-xs text-red-200 mb-3 break-words">
                                    {this.state.error.toString()}
                                </p>

                                {this.state.errorInfo && (
                                    <details className="text-xs text-red-200">
                                        <summary className="cursor-pointer hover:text-red-100 mb-2">
                                            Component Stack
                                        </summary>
                                        <pre className="text-xs overflow-auto max-h-32 bg-black bg-opacity-30 p-2 rounded">
                                            {this.state.errorInfo.componentStack}
                                        </pre>
                                    </details>
                                )}
                            </div>
                        )}

                        {/* Error Count */}
                        <p className="text-xs text-gray-500 text-center mb-6">
                            Error occurrences: {this.state.errorCount}
                        </p>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={this.resetError}
                                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-semibold transition w-full"
                            >
                                <RefreshCw size={20} />
                                Try Again
                            </button>

                            <button
                                onClick={() => (window.location.href = '/')}
                                className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-lg font-semibold transition w-full"
                            >
                                Go Home
                            </button>
                        </div>

                        {/* Support Info */}
                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-400 mb-2">
                                If the problem persists, please contact support
                            </p>
                            <a
                                href="mailto:support@tripup.com"
                                className="text-blue-400 hover:text-blue-300 transition text-sm"
                            >
                                support@tripup.com
                            </a>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
