
import React, { useState, useEffect } from 'react';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { ScaleIcon } from './icons/ScaleIcon';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { ArrowDownTrayIcon } from './icons/ArrowDownTrayIcon';

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
  <div className="flex items-start gap-4">
    <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-gray-700 rounded-lg text-cyan-400">
      {icon}
    </div>
    <div>
      <h4 className="font-semibold text-gray-200">{title}</h4>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  </div>
);

export const WelcomeScreen: React.FC = () => {
  const [sampleData, setSampleData] = useState('');
  const [copyButtonText, setCopyButtonText] = useState('Copy to Clipboard');

  useEffect(() => {
    fetch('/sample-data.txt')
      .then(response => response.text())
      .then(text => setSampleData(text))
      .catch(error => console.error('Error fetching sample data:', error));
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(sampleData).then(() => {
      setCopyButtonText('Copied!');
      setTimeout(() => setCopyButtonText('Copy to Clipboard'), 2000);
    });
  };

  const handleDownload = () => {
    const blob = new Blob([sampleData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample-data.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-8 space-y-6">
        <h3 className="text-xl font-bold text-center text-gray-200">Welcome to the Future of Real Estate Analysis</h3>
        <p className="text-center text-gray-400">
          Leverage AI to transform hours of research into minutes of insight. Get started by using the sample data below or providing your own.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <FeatureCard 
            icon={<DocumentTextIcon className="h-6 w-6" />}
            title="Comprehensive Memos"
            description="Generate full deal memos including executive summaries, property details, and risk assessments."
          />
          <FeatureCard 
            icon={<ChartBarIcon className="h-6 w-6" />}
            title="Data-Driven Insights"
            description="Analyze market trends and financial scenarios using real-time public data."
          />
          <FeatureCard 
            icon={<ScaleIcon className="h-6 w-6" />}
            title="Rapid Valuations"
            description="Receive preliminary collateral valuations based on sales comps and income approaches."
          />
        </div>
      </div>

      {sampleData && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-cyan-400 mb-4">Test with Sample Data</h3>
          <pre className="bg-gray-900/70 p-4 rounded-lg text-gray-300 text-sm whitespace-pre-wrap overflow-x-auto">
            <code>{sampleData}</code>
          </pre>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <button onClick={handleCopy} className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-cyan-600 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 transition-all duration-200">
              <ClipboardIcon className="h-5 w-5" />
              <span>{copyButtonText}</span>
            </button>
            <button onClick={handleDownload} className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-gray-500 transition-all duration-200">
              <ArrowDownTrayIcon className="h-5 w-5" />
              <span>Download Sample File</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
