import React from 'react';

/**
 * Async Error Boundary
 * Catches errors from async operations and Promise rejections
 * Should be used with React Router's error handling
 */
export const withAsyncErrorBoundary = (Component) => {
    return (props) => {
        React.useEffect(() => {
            const handleRejection = (event) => {
                console.error('Unhandled promise rejection:', event.reason);
                // Could trigger error UI here
            };

            window.addEventListener('unhandledrejection', handleRejection);

            return () => {
                window.removeEventListener('unhandledrejection', handleRejection);
            };
        }, []);

        return <Component {...props} />;
    };
};

/**
 * Hook for handling errors in functional components
 */
export const useErrorHandler = () => {
    const [error, setError] = React.useState(null);

    const handleError = React.useCallback((err) => {
        console.error('Error:', err);
        setError(err);
    }, []);

    const clearError = React.useCallback(() => {
        setError(null);
    }, []);

    return { error, handleError, clearError };
};

/**
 * Hook for API error handling
 */
export const useApiErrorHandler = () => {
    const { error, handleError, clearError } = useErrorHandler();

    const handleApiError = React.useCallback((axiosError) => {
        if (axiosError.response) {
            // Server responded with error status
            const { status, data } = axiosError.response;

            switch (status) {
                case 400:
                    handleError({
                        type: 'validation',
                        message: data.message || 'Invalid input',
                    });
                    break;
                case 401:
                    handleError({
                        type: 'auth',
                        message: 'Please log in to continue',
                    });
                    break;
                case 403:
                    handleError({
                        type: 'forbidden',
                        message: 'You do not have permission to perform this action',
                    });
                    break;
                case 404:
                    handleError({
                        type: 'notfound',
                        message: 'Resource not found',
                    });
                    break;
                case 429:
                    handleError({
                        type: 'ratelimit',
                        message: 'Too many requests. Please try again later.',
                    });
                    break;
                case 500:
                case 502:
                case 503:
                    handleError({
                        type: 'server',
                        message: 'Server error. Please try again later.',
                    });
                    break;
                default:
                    handleError({
                        type: 'unknown',
                        message: data.message || 'An error occurred',
                    });
            }
        } else if (axiosError.request) {
            // Request made but no response
            handleError({
                type: 'network',
                message: 'Network error. Please check your connection.',
            });
        } else {
            // Error in request setup
            handleError({
                type: 'unknown',
                message: axiosError.message || 'An unexpected error occurred',
            });
        }
    }, [handleError]);

    return { error, handleApiError, clearError };
};
