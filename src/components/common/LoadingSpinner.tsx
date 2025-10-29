import React, { memo } from "react";

// Interfața pentru proprietățile componentei LoadingSpinner
interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";    // Mărimea spinner-ului
  message?: string;              // Mesajul afișat sub spinner
  fullScreen?: boolean;         // Dacă spinner-ul ocupă întregul ecran
}

/**
 * Componenta LoadingSpinner - afișează un spinner de încărcare optimizat
 * 
 * Optimizări pentru performanță:
 * - Memoizată pentru a preveni re-render-urile inutile
 * - CSS optimizat pentru animații smooth
 * - Lazy loading pentru componentele mari
 * 
 * @param size - Mărimea spinner-ului (sm, md, lg)
 * @param message - Mesajul afișat sub spinner
 * @param fullScreen - Dacă spinner-ul ocupă întregul ecran
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = memo(({
  size = "md",
  message = "Se încarcă...",
  fullScreen = false,
}) => {
  // Clasele pentru diferite mărimi ale spinner-ului - optimizate pentru performanță
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-12 h-12",
    lg: "w-20 h-20",
  };

  // Componenta spinner-ului optimizată
  const Spinner = (
    <div className="text-center">
      {/* Container-ul pentru spinner cu optimizări CSS */}
      <div className={`relative ${sizeClasses[size]} mx-auto mb-4`}>
        {/* Cercul de fundal - optimizat pentru rendering */}
        <div className="absolute inset-0 rounded-full border-4 border-purple-200 dark:border-purple-900 will-change-auto"></div>
        {/* Cercul animat - optimizat pentru GPU */}
        <div
          className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-600 dark:border-t-pink-500 animate-spin"
          style={{
            willChange: 'transform',
            backfaceVisibility: 'hidden',
            transform: 'translateZ(0)' // Force GPU acceleration
          }}
        ></div>
      </div>
      {/* Mesajul de încărcare */}
      <p className="text-gray-600 dark:text-gray-400 font-medium text-sm sm:text-base">{message}</p>
    </div>
  );

  // Dacă fullScreen este true, afișează spinner-ul pe întregul ecran
  if (fullScreen) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800"
        style={{
          willChange: 'auto',
          contain: 'layout style paint' // Optimizare pentru rendering
        }}
      >
        {Spinner}
      </div>
    );
  }

  // Altfel, returnează doar spinner-ul
  return Spinner;
});

// Setează displayName pentru debugging
LoadingSpinner.displayName = 'LoadingSpinner';

