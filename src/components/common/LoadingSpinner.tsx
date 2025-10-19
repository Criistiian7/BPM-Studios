import React from "react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  message?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  message = "Se încarcă...",
  fullScreen = false,
}) => {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-12 h-12",
    lg: "w-20 h-20",
  };

  const Spinner = (
    <div className="text-center">
      <div className={`relative ${sizeClasses[size]} mx-auto mb-4`}>
        <div className="absolute inset-0 rounded-full border-4 border-purple-200 dark:border-purple-900"></div>
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-600 dark:border-t-pink-500 animate-spin"></div>
      </div>
      <p className="text-gray-600 dark:text-gray-400 font-medium">{message}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        {Spinner}
      </div>
    );
  }

  return Spinner;
};

