
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from './use-toast';

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

function processUserName(name: string | null): string | null {
  if (!name) return null;
  try {
    const decodedName = decodeURIComponent(name);
    return decodedName.split(' ')[0]; // Get the first name
  } catch (e) {
    // If decoding fails, return the first part of the original string or the string itself
    return name.split(' ')[0];
  }
}

export function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  const updateAuthState = useCallback(() => {
    const loggedInCookie = getCookie('isLoggedIn');
    const emailCookie = getCookie('userEmail');
    const nameCookie = getCookie('userName');
    const newIsLoggedIn = loggedInCookie === 'true';

    setIsLoggedIn(newIsLoggedIn);
    setUserEmail(newIsLoggedIn ? emailCookie : null);
    setUserName(newIsLoggedIn ? processUserName(nameCookie) : null);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    updateAuthState();
    // Listen for storage events to sync across tabs (if cookies are also updated by other means)
    // However, cookie changes themselves don't fire 'storage' events.
    // For robust cross-tab sync of cookie-based auth, a more complex solution might be needed,
    // like polling or using BroadcastChannel, but for now, focus and visibility changes are good.
    window.addEventListener('storage', updateAuthState); 
    return () => {
      window.removeEventListener('storage', updateAuthState);
    };
  }, [updateAuthState]);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      if (response.ok) {
        setIsLoggedIn(false);
        setUserEmail(null);
        setUserName(null);
        // Explicitly clear cookies on client-side as a fallback, though API should do it.
        if (typeof document !== 'undefined') {
            document.cookie = "isLoggedIn=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
            document.cookie = "userEmail=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
            document.cookie = "userName=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
            document.cookie = "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        }
        toast({ title: "Logged Out", description: "You have been successfully logged out." });
        router.push('/'); 
        router.refresh(); 
      } else {
        toast({ title: "Logout Failed", description: "Could not log out. Please try again.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Logout Error", description: "An error occurred during logout.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [router, toast]);

  // Effect to re-check auth state on window focus or tab visibility change
  useEffect(() => {
    const handleActivity = () => {
      // Only update if not currently loading to avoid redundant checks
      // And if the document is visible (for visibilitychange)
      if (!isLoading && (document.visibilityState === 'visible' || document.hasFocus())) {
        const currentLoggedInCookie = getCookie('isLoggedIn') === 'true';
         // Only refresh if the cookie state has changed from the hook's state
        if (currentLoggedInCookie !== isLoggedIn) {
            updateAuthState();
            // router.refresh(); // Potentially refresh page, consider if this is too disruptive
        }
      }
    };

    window.addEventListener('focus', handleActivity);
    document.addEventListener('visibilitychange', handleActivity);

    return () => {
      window.removeEventListener('focus', handleActivity);
      document.removeEventListener('visibilitychange', handleActivity);
    };
  }, [isLoggedIn, isLoading, updateAuthState]); // router not needed here as it's used in logout

  return { isLoggedIn, userEmail, userName, isLoading, logout, updateAuthState };
}
