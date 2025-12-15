
import React from 'react';
import { Header } from './components/Header';
import { LoanAnalysisForm } from './components/LoanAnalysisForm';
import { MemoDisplay } from './components/MemoDisplay';
import { LoadingIndicator } from './components/LoadingIndicator';
import { useLoanAnalyzer } from './hooks/useLoanAnalyzer';
import { WelcomeScreen } from './components/WelcomeScreen';
import { ErrorDisplay } from './components/ErrorDisplay';

export default function App() {
  const {
    memoData,
    isLoading,
    error,
    analyzeData,
  } = useLoanAnalyzer();

  const handleAnalysisRequest = async (content: string) => {
    await analyzeData(content);
  };

  return (
    <div className="min-h-screen bg-gray-900 font-sans">
      <Header />
      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl shadow-2xl shadow-black/20 p-6 md:p-8 mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-cyan-400 mb-4">
              Real Estate Deal Analysis
            </h2>
            <p className="text-gray-400 mb-6">
              Use the tabs below to either upload a data file or enter text directly. The AI will generate a comprehensive loan analysis memo based on your input and enriched with market data.
            </p>
            <LoanAnalysisForm
              onSubmit={handleAnalysisRequest}
              isLoading={isLoading}
            />
          </div>

          {isLoading && <LoadingIndicator />}
          {error && <ErrorDisplay message={error} />}
          
          {memoData && (
            <div className="space-y-8">
              <MemoDisplay memoContent={memoData} />
            </div>
          )}

          {!isLoading && !error && !memoData && <WelcomeScreen />}
        </div>
      </main>
      <footer className="text-center py-6 text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} AI Commercial Real Estate Analyst. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
