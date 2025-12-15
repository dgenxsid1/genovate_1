
import { useState, useEffect } from 'react';

type ServerStatus = 'checking' | 'online' | 'offline';

// This URL is a placeholder and will be replaced by the deploy.sh script on the server.
const API_BASE_URL = 'http://127.0.0.1:8000';

export const useServerStatus = () => {
  const [status, setStatus] = useState<ServerStatus>('checking');

  useEffect(() => {
    const checkStatus = async () => {
      try {
        // Use a timeout to prevent long waits on connection attempts
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const response = await fetch(`${API_BASE_URL}/health`, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          if (data.status === 'ok') {
            setStatus('online');
          } else {
            setStatus('offline');
          }
        } else {
          setStatus('offline');
        }
      } catch (error) {
        setStatus('offline');
      }
    };

    // Check immediately on mount
    checkStatus();

    // Then check every 5 seconds
    const intervalId = setInterval(checkStatus, 5000);

    // Cleanup on unmount
    return () => clearInterval(intervalId);
  }, []);

  return status;
};
