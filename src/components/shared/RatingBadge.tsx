import React from 'react';
import { FiStar } from 'react-icons/fi';

interface RatingBadgeProps {
  rating: number;
  className?: string;
}

export const RatingBadge: React.FC<RatingBadgeProps> = ({ 
  rating, 
  className = '' 
}) => {
  return (
    <span className={`inline-flex items-center gap-1 text-white bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium ${className}`}>
      <FiStar className="fill-current text-yellow-300" />
      {rating.toFixed(1)}
    </span>
  );
};