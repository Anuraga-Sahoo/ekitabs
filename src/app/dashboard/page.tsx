
"use client";

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';
import { Smile, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const { userName, isLoggedIn, isLoading: authLoading } = useAuth();
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const popupTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isLoggedIn && !authLoading) {
      setIsPopupVisible(true);
    } else if (!isLoggedIn && !authLoading) {
      setIsPopupVisible(false); 
    }
  }, [isLoggedIn, authLoading]);

  useEffect(() => {
    if (isPopupVisible) {
      popupTimerRef.current = setTimeout(() => {
        setIsPopupVisible(false);
      }, 5000);
    }
    return () => {
      if (popupTimerRef.current) {
        clearTimeout(popupTimerRef.current);
      }
    };
  }, [isPopupVisible]);

  const handleClosePopup = () => {
    setIsPopupVisible(false);
    if (popupTimerRef.current) {
      clearTimeout(popupTimerRef.current);
    }
  };

  // The main dashboard content can be minimal if the popup is the primary welcome
  // For now, we'll just render the popup if it's visible.
  // The rest of the dashboard can be built out below or around this.

  return (
    <div className="w-full h-full relative">
      {/* Popup Welcome Message */}
      {isPopupVisible && (
        <div 
          className={cn(
            "fixed top-5 right-5 z-50 w-full max-w-xs sm:max-w-sm",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-top-[2%]",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-[2%]"
          )}
          data-state={isPopupVisible ? "open" : "closed"}
        >
          <Card className="shadow-xl border-primary/30 bg-background">
            <CardHeader className="flex flex-row items-center justify-between py-3 px-4">
              <div className="flex items-center">
                <Smile className="h-6 w-6 text-primary mr-2 flex-shrink-0" />
                {authLoading ? (
                   <Skeleton className="h-6 w-32" />
                ) : (
                  <CardTitle className="text-md font-semibold text-primary leading-tight">
                    Hi, {userName || 'User'}! Welcome 👋
                  </CardTitle>
                )}
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={handleClosePopup}>
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </CardHeader>
            <CardContent className="pt-0 pb-3.5 px-4">
              {authLoading ? (
                <Skeleton className="h-4 w-full" />
              ) : (
                <p className="text-sm text-muted-foreground">
                  Use the sidebar to navigate your test preparation journey.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* You can add other dashboard content here if needed */}
      {/* For example, a placeholder if no other content is present yet:
      {!isPopupVisible && (
        <div className="p-4 text-center text-muted-foreground">
          <p>Dashboard content will appear here.</p>
        </div>
      )}
      */}
    </div>
  );
}
