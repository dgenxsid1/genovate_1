
interface AnalysisResponse {
  memo: string;
}

// This URL is a placeholder and will be replaced by the deploy.sh script on the server.
// For local development, it points to the local backend server.
const API_BASE_URL = 'http://127.0.0.1:8000';

export const analyzeDataWithAPI = async (fileContent: string): Promise<AnalysisResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ file_content: fileContent }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'An unknown API error occurred.' }));
      throw new Error(errorData.detail || `API request failed with status ${response.status}`);
    }

    return await response.json() as AnalysisResponse;
  } catch (error) {
    console.error("Error calling analysis API:", error);
    if (error instanceof Error) {
      // Prepend a user-friendly message for network errors
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Could not connect to the analysis server. Please ensure the backend is running and check the README.md for setup instructions.');
      }
      throw error;
    }
    throw new Error("An unknown error occurred while communicating with the API.");
  }
};
