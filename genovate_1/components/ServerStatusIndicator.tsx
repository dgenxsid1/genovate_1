
import React from 'react';
import { useServerStatus } from '../hooks/useServerStatus';

export const ServerStatusIndicator: React.FC = () => {
  const status = useServerStatus();

  const statusConfig = {
    online: {
      text: 'Backend Online',
      color: 'bg-green-500',
      textColor: 'text-green-300',
    },
    offline: {
      text: 'Backend Offline',
      color: 'bg-red-500',
      textColor: 'text-red-300',
    },
    checking: {
      text: 'Checking...',
      color: 'bg-yellow-500',
      textColor: 'text-yellow-300',
    },
  };

  const { text, color, textColor } = statusConfig[status];

  return (
    <div className="flex items-center space-x-2" title={status === 'offline' ? 'The Python backend server is not running or is unreachable. See README.md for setup instructions.' : 'Server connection status'}>
      <span className={`relative flex h-3 w-3`}>
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${color} opacity-75`}></span>
        <span className={`relative inline-flex rounded-full h-3 w-3 ${color}`}></span>
      </span>
      <span className={`hidden sm:inline text-sm font-medium ${textColor}`}>{text}</span>
    </div>
  );
};
