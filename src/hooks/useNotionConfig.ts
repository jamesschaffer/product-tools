import { useState, useEffect, useCallback } from 'react';

export function useNotionConfig() {
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkConfig = useCallback(async () => {
    try {
      const response = await fetch('/api/notion/config');
      if (response.ok) {
        const data = await response.json();
        setIsConfigured(data.configured);
      } else {
        setIsConfigured(false);
      }
    } catch {
      setIsConfigured(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkConfig();
  }, [checkConfig]);

  return {
    isConfigured: isConfigured === true,
    isLoading,
    recheckConfig: checkConfig,
  };
}
