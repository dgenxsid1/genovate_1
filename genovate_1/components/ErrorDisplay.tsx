
import React from 'react';
import { ExclamationTriangleIcon } from './icons/ExclamationTriangleIcon';

interface ErrorDisplayProps {
  message: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message }) => {
  return (
    <div className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-lg relative" role="alert">
      <div className="flex items-center">
        <ExclamationTriangleIcon className="h-6 w-6 mr-3" />
        <div>
          <strong className="font-bold">Analysis Failed</strong>
          <span className="block sm:inline ml-2">{message}</span>
        </div>
      </div>
    </div>
  );
};
