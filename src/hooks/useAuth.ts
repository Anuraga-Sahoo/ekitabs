
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
    setUserName(newIsLoggedIn ? nameCookie : null);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    updateAuthState();
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

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const currentLoggedInCookie = getCookie('isLoggedIn') === 'true';
        if (currentLoggedInCookie !== isLoggedIn && !isLoading) {
          updateAuthState();
          router.refresh();
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isLoggedIn, isLoading, router, updateAuthState]);

  return { isLoggedIn, userEmail, userName, isLoading, logout, updateAuthState };
}
