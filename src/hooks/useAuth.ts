import { useState, useEffect, useCallback } from 'react';

interface AuthStatus {
  authenticated: boolean;
  authRequired: boolean;
}

export function useAuth() {
  const [status, setStatus] = useState<AuthStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/status');
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      } else {
        setStatus({ authenticated: false, authRequired: true });
      }
    } catch {
      setStatus({ authenticated: false, authRequired: true });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = useCallback(async (key: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key }),
      });

      if (response.ok) {
        await checkAuth();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [checkAuth]);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      await checkAuth();
    } catch {
      // Ignore errors
    }
  }, [checkAuth]);

  return {
    isAuthenticated: status?.authenticated ?? false,
    authRequired: status?.authRequired ?? true,
    isLoading,
    login,
    logout,
    recheckAuth: checkAuth,
  };
}
