import React from 'react';

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  onClick?: () => void;
}

const SIZES = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-12 h-12 text-lg', 
  lg: 'w-20 h-20 text-2xl',
  xl: 'w-24 h-24 text-3xl',
  '2xl': 'w-32 h-32 text-4xl'
};

export const Avatar: React.FC<AvatarProps> = ({ 
  src, 
  name, 
  size = 'md', 
  className = '',
  onClick
}) => {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const sizeClasses = SIZES[size];
  const baseClasses = `${sizeClasses} rounded-full flex-shrink-0`;
  const interactiveClasses = onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : '';

  return src ? (
    <img
      src={src}
      alt={name}
      onClick={onClick}
      className={`${baseClasses} object-cover border-4 border-gray-200 dark:border-gray-700 ${interactiveClasses} ${className}`}
    />
  ) : (
    <div 
      onClick={onClick}
      className={`${baseClasses} bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold ${interactiveClasses} ${className}`}
    >
      {getInitials(name)}
    </div>
  );
};