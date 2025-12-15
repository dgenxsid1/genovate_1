
import { useState, useCallback } from 'react';
import { analyzeDataWithAPI } from '../services/apiService';

export const useLoanAnalyzer = () => {
  const [memoData, setMemoData] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeData = useCallback(async (content: string) => {
    if (!content.trim()) {
      setError("The provided input is empty.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setMemoData(null);

    try {
      const result = await analyzeDataWithAPI(content);
      setMemoData(result.memo);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { memoData, isLoading, error, analyzeData };
};
