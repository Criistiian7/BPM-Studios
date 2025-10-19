import React from "react";
import { getInitials } from "../../utils/formatters";

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  fallbackIcon?: React.ReactNode;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = "md",
  className = "",
  fallbackIcon,
}) => {
  const sizeClasses = {
    xs: "w-6 h-6 text-xs",
    sm: "w-10 h-10 text-sm",
    md: "w-16 h-16 text-xl",
    lg: "w-24 h-24 text-2xl",
    xl: "w-32 h-32 text-4xl",
  };

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        loading="lazy"
        className={`${sizeClasses[size]} rounded-full object-cover border-2 border-gray-200 dark:border-gray-700 ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold border-2 border-gray-200 dark:border-gray-700 ${className}`}
    >
      {fallbackIcon || getInitials(name)}
    </div>
  );
};

