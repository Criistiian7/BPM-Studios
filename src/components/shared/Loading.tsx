import React from 'react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

const SIZES = {
  sm: 'h-6 w-6',
  md: 'h-12 w-12', 
  lg: 'h-16 w-16'
};

export const Loading: React.FC<LoadingProps> = ({ 
  size = 'md', 
  text, 
  fullScreen = false,
  className = ''
}) => {
  const spinner = (
    <div className={`text-center ${className}`}>
      <div className={`animate-spin rounded-full border-b-2 border-indigo-600 mx-auto ${SIZES[size]}`}></div>
      {text && <p className="mt-4 text-gray-600 dark:text-gray-400">{text}</p>}
    </div>
  );

  return fullScreen ? (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      {spinner}
    </div>
  ) : spinner;
};