import { useAuth, useUser } from '@clerk/clerk-react';
import { useRef, useCallback } from 'react';

export const useApiAuth = () => {
  const { getToken } = useAuth();
  const { user, isSignedIn } = useUser();
  const tokenCache = useRef<{ token: string; timestamp: number } | null>(null);
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  const getAuthHeaders = useCallback(async () => {
    try {
      if (!isSignedIn) {
        console.log('🔧 User not signed in, returning null for dev authentication fallback');
        return null; // Return null instead of throwing error
      }

      // Check cache first
      const now = Date.now();
      if (tokenCache.current && (now - tokenCache.current.timestamp) < CACHE_DURATION) {
        return {
          'Authorization': `Bearer ${tokenCache.current.token}`,
          'Content-Type': 'application/json',
        };
      }

      const token = await getToken();
      
      if (!token) {
        throw new Error('Failed to get JWT token from Clerk');
      }

      // Cache the token
      tokenCache.current = { token, timestamp: now };
      
      console.log('🔐 Got JWT token from Clerk:', token.substring(0, 50) + '...');
      
      return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
    } catch (error) {
      console.error('❌ Authentication error:', error);
      return null; // Return null instead of throwing error for dev authentication fallback
    }
  }, [isSignedIn, getToken]);

  return { getAuthHeaders, isSignedIn, user };
};

// Fallback for when useAuth is not available
export const getStoredToken = () => {
  return localStorage.getItem('clerk-jwt-token');
};

export const setStoredToken = (token: string) => {
  localStorage.setItem('clerk-jwt-token', token);
}; 