
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
  const [isLoading, setIsLoading] = useState(true); // To manage initial check
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Check login status on mount
    const loggedInCookie = getCookie('isLoggedIn');
    setIsLoggedIn(loggedInCookie === 'true');
    setIsLoading(false);
  }, []);

  const logout = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      if (response.ok) {
        document.cookie = "isLoggedIn=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"; // Clear client-side cookie
        setIsLoggedIn(false);
        toast({ title: "Logged Out", description: "You have been successfully logged out." });
        router.push('/login');
        router.refresh(); // Refresh to update server-side state potentially used by middleware
      } else {
        toast({ title: "Logout Failed", description: "Could not log out. Please try again.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Logout Error", description: "An error occurred during logout.", variant: "destructive" });
    }
  }, [router, toast]);

  return { isLoggedIn, isLoading, logout };
}
