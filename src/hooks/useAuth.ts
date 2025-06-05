
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from './use-toast';

// Helper to get a cookie by name (client-side only)
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

export function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // To manage initial check
  const router = useRouter();
  const { toast } = useToast();

  const updateAuthState = useCallback(() => {
    const loggedInCookie = getCookie('isLoggedIn');
    const emailCookie = getCookie('userEmail');
    const newIsLoggedIn = loggedInCookie === 'true';
    setIsLoggedIn(newIsLoggedIn);
    setUserEmail(newIsLoggedIn ? emailCookie : null);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    updateAuthState();
    // Listen for storage events that might indicate login/logout from other tabs
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
        // Cookies are cleared by the API route. Client-side state update:
        setIsLoggedIn(false);
        setUserEmail(null);
        toast({ title: "Logged Out", description: "You have been successfully logged out." });
        router.push('/login');
        router.refresh(); // Refresh to update server-side state
      } else {
        toast({ title: "Logout Failed", description: "Could not log out. Please try again.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Logout Error", description: "An error occurred during logout.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [router, toast]);

  // This effect handles router.refresh() on login state change from external source (e.g. another tab)
  // It should ideally be done more gracefully, perhaps by re-validating data instead of full refresh
  // if `isLoggedIn` changes not due to direct action in this tab.
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const currentLoggedInCookie = getCookie('isLoggedIn') === 'true';
        if (currentLoggedInCookie !== isLoggedIn && !isLoading) {
          router.refresh();
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isLoggedIn, isLoading, router]);


  return { isLoggedIn, userEmail, isLoading, logout, updateAuthState };
}
