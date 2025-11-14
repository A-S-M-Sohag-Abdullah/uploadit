'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { apiGet } from '@/lib/api/client';
import { toast } from 'sonner';
import { User } from '@/types';

export default function OAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      const error = searchParams.get('error');

      if (error) {
        toast.error(`Authentication failed: ${error}`);
        router.push('/auth/login');
        return;
      }

      if (!token) {
        toast.error('No authentication token received');
        router.push('/auth/login');
        return;
      }

      try {
        // Store token temporarily
        localStorage.setItem('token', token);

        console.log('Token stored, fetching user data...');
        console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
        console.log('Token:', token.substring(0, 20) + '...');

        // Fetch user data
        const response = await apiGet<{ success: boolean; data: { user: User } }>('/auth/me');

        console.log('API Response:', response);
        console.log('Extracted user data to store:', response.data.user);

        if (response.success && response.data.user) {
          // Set auth state
          setAuth(response.data.user, token);
          toast.success('Successfully logged in!');
          router.push('/');
        } else {
          throw new Error('Failed to fetch user data');
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
        toast.error(errorMessage);
        localStorage.removeItem('token');
        router.push('/auth/login');
      }
    };

    handleCallback();
  }, [searchParams, router, setAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 w-full">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
        </div>
        <h2 className="text-2xl font-semibold">Completing authentication...</h2>
        <p className="text-muted-foreground">Please wait while we log you in</p>
      </div>
    </div>
  );
}
