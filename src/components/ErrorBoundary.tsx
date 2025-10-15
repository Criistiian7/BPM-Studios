import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Error Boundary component to catch and handle errors gracefully
 * Prevents the entire app from crashing when an error occurs
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details to console in development
    console.error("Uncaught error:", error, errorInfo);
    
    // In production, you might want to send this to an error tracking service
    // Example: Sentry.captureException(error);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
          <div className="max-w-md w-full text-center">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
              <div className="mb-6">
                <svg
                  className="mx-auto h-16 w-16 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>

              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Oops! Ceva nu a mers bine
              </h1>

              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Ne pare rău, dar a apărut o eroare neașteptată. Te rugăm să reîncarci pagina.
              </p>

              {import.meta.env.DEV && this.state.error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-left">
                  <p className="text-sm font-mono text-red-800 dark:text-red-300 break-all">
                    {this.state.error.toString()}
                  </p>
                </div>
              )}

              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
                >
                  Reîncarcă pagina
                </button>
                <button
                  onClick={() => (window.location.href = "/")}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-lg transition-colors"
                >
                  Înapoi la Home
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
