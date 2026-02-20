// Global error handling utilities

// Suppress ResizeObserver errors globally
export const suppressResizeObserverErrors = () => {
    // Suppress console errors
    const originalError = console.error;
    console.error = (...args) => {
        if (typeof args[0] === 'string' && args[0].includes('ResizeObserver loop completed with undelivered notifications')) {
            return;
        }
        originalError.call(console, ...args);
    };

    // Suppress window errors
    const originalWindowError = window.onerror;
    window.onerror = (message, source, lineno, colno, error) => {
        if (typeof message === 'string' && message.includes('ResizeObserver loop completed with undelivered notifications')) {
            return true; // Prevent default error handling
        }
        if (originalWindowError) {
            return originalWindowError.call(window, message, source, lineno, colno, error);
        }
        return false;
    };

    // Suppress unhandled promise rejections related to ResizeObserver
    const originalUnhandledRejection = window.onunhandledrejection;
    window.onunhandledrejection = (event) => {
        if (event.reason && typeof event.reason.message === 'string' && 
            event.reason.message.includes('ResizeObserver loop completed with undelivered notifications')) {
            event.preventDefault();
            return;
        }
        if (originalUnhandledRejection) {
            return originalUnhandledRejection.call(window, event);
        }
    };
};

// Initialize error suppression
suppressResizeObserverErrors();