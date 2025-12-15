
import React from 'react';
import { BuildingLibraryIcon } from './icons/BuildingLibraryIcon';
import { ServerStatusIndicator } from './ServerStatusIndicator';

export const Header: React.FC = () => {
  return (
    <header className="bg-gray-900/80 backdrop-blur-lg border-b border-gray-700/50 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BuildingLibraryIcon className="h-8 w-8 text-cyan-400" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              AI Real Estate Analyst
            </h1>
          </div>
          <ServerStatusIndicator />
        </div>
      </div>
    </header>
  );
};
