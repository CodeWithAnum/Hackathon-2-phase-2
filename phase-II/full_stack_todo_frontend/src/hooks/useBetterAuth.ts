import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import apiClient from '@/lib/api/client';

// For now, since BetterAuth uses atoms instead of standard hooks, we'll create a simple wrapper
// that works with our existing system but represents the BetterAuth integration
interface User {
  id: string;
  email: string;
  token?: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshAuth: () => void;
}

export function useBetterAuth(): AuthContextType {
  const router = useRouter();

  // Direct API calls to match our backend endpoints
  const signInHandler = useCallback(async (email: string, password: string) => {
    try {
      const response = await apiClient.post('/auth/signin', {
        email,
        password
      });

      if (response.data.access_token) {
        // Store the token in localStorage for use with API calls
        localStorage.setItem('access_token', response.data.access_token);
        // Force a longer delay to ensure state updates
        await new Promise(resolve => setTimeout(resolve, 200));
        // Use window.location for a hard redirect to ensure state resets
        window.location.href = '/tasks';
      } else {
        throw new Error('Sign in failed - no token received');
      }
    } catch (error: unknown) {
      const message = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { detail?: { message?: string } } }; message?: string }).response?.data?.detail?.message
        : error instanceof Error ? error.message : 'Sign in failed';
      const errorMessage = message || (error instanceof Error ? error.message : 'Invalid email or password');
      throw new Error(errorMessage);
    }
  }, []);

  const signUpHandler = useCallback(async (email: string, password: string) => {
    try {
      const response = await apiClient.post('/auth/signup', {
        email,
        password
      });

      if (response.data.access_token) {
        // Store the token in localStorage for use with API calls
        localStorage.setItem('access_token', response.data.access_token);
        // Force a longer delay to ensure state updates
        await new Promise(resolve => setTimeout(resolve, 200));
        // Use window.location for a hard redirect to ensure state resets
        window.location.href = '/tasks';
      } else {
        throw new Error('Sign up failed - no token received');
      }
    } catch (error: unknown) {
      const message = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { detail?: { message?: string; code?: string } } }; message?: string }).response?.data?.detail?.message
        : error instanceof Error ? error.message : 'Sign up failed';

      // Check if it's an email exists error
      const errorCode = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { detail?: { code?: string } } } }).response?.data?.detail?.code
        : null;

      const errorMessage = errorCode === 'EMAIL_EXISTS'
        ? 'This email is already registered. Please sign in instead.'
        : message || 'Sign up failed. Please try again.';

      throw new Error(errorMessage);
    }
  }, []);

  const signOutHandler = useCallback(async () => {
    // Clear the stored token
    localStorage.removeItem('access_token');
    router.push('/signin');
  }, [router]);

  const refreshAuth = useCallback(() => {
    // Session refreshing would happen automatically with JWT
  }, []);

  // Return initial state - the actual state will be managed by AuthContext
  return {
    user: null,
    loading: false,
    error: null,
    isAuthenticated: false,
    signIn: signInHandler,
    signUp: signUpHandler,
    signOut: signOutHandler,
    refreshAuth,
  };
}