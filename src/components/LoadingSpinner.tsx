import React from "react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  fullScreen?: boolean;
}

/**
 * Reusable loading spinner component
 * Can be used inline or as a full-screen loader
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  text,
  fullScreen = false,
}) => {
  const sizeClasses = {
    sm: "h-6 w-6 border-2",
    md: "h-12 w-12 border-2",
    lg: "h-16 w-16 border-4",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  const spinner = (
    <>
      <div
        className={`animate-spin rounded-full border-indigo-600 border-t-transparent ${sizeClasses[size]}`}
      />
      {text && (
        <p
          className={`mt-4 text-gray-600 dark:text-gray-400 ${textSizeClasses[size]}`}
        >
          {text}
        </p>
      )}
    </>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">{spinner}</div>
      </div>
    );
  }

  return <div className="flex flex-col items-center justify-center">{spinner}</div>;
};
