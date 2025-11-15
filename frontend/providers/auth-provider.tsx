'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { authApi } from '@/lib/api';

// Global flag to prevent multiple auth initializations
let isAuthInitialized = false;
let authInitPromise: Promise<void> | null = null;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setAuth, clearAuth, setLoading } = useAuthStore();

  useEffect(() => {
    // If already initialized or currently initializing, skip
    if (isAuthInitialized || authInitPromise) {
      return;
    }

    const initAuth = async () => {
      try {
        setLoading(true);
        // Call /me endpoint to verify authentication using httpOnly cookie
        const response = await authApi.getMe();

        if (response.success && response.data.user) {
          setAuth(response.data.user);
        } else {
          clearAuth();
        }
      } catch  {
        // If /me fails (401), user is not authenticated
        clearAuth();
      } finally {
        setLoading(false);
        isAuthInitialized = true;
        authInitPromise = null;
      }
    };

    // Store the promise to prevent concurrent calls
    authInitPromise = initAuth();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
}
