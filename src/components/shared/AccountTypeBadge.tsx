import React from 'react';
import { ACCOUNT_TYPES } from '../../constants';

interface AccountTypeBadgeProps {
  accountType: string;
  className?: string;
}

export const AccountTypeBadge: React.FC<AccountTypeBadgeProps> = ({ 
  accountType, 
  className = '' 
}) => {
  const getLabel = () => {
    switch (accountType) {
      case ACCOUNT_TYPES.PRODUCER:
        return "Producător";
      case ACCOUNT_TYPES.STUDIO:
        return "Studio";
      default:
        return "Artist";
    }
  };

  const getColorClasses = () => {
    switch (accountType) {
      case ACCOUNT_TYPES.PRODUCER:
        return "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300";
      case ACCOUNT_TYPES.STUDIO:
        return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300";
      default:
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300";
    }
  };

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getColorClasses()} ${className}`}>
      {getLabel()}
    </span>
  );
};