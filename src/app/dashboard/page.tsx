
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';
import { Smile } from 'lucide-react';

export default function DashboardPage() {
  const { userName, isLoggedIn, isLoading } = useAuth();

  return (
    <div className="w-full"> {/* This outer div allows the card to be placed at the start (top-left) */}
      <Card className="shadow-md max-w-md"> {/* Make card smaller, it will be left-aligned by default */}
        <CardHeader className="pb-3 pt-5 px-5"> {/* Adjusted padding for a smaller card */}
          {isLoading ? (
            <>
              <Skeleton className="h-7 w-3/4 mb-1" /> {/* Skeleton for title */}
            </>
          ) : isLoggedIn ? (
            <div className="flex items-center"> {/* Default left alignment */}
              <Smile className="h-7 w-7 text-primary mr-2" />
              <CardTitle className="text-xl font-semibold text-primary">
                Hi, {userName}! Welcome 👋
              </CardTitle>
            </div>
          ) : (
            <>
              <CardTitle className="text-xl font-semibold text-primary">Welcome to TestPrep AI</CardTitle>
            </>
          )}
        </CardHeader>
        
        <CardContent className="pt-0 pb-4 px-5"> {/* Consistent padding */}
          {isLoading ? (
            <Skeleton className="h-4 w-full" />
          ) : isLoggedIn ? (
            <p className="text-sm text-muted-foreground">
              Use the sidebar to navigate your test preparation journey.
            </p>
          ) : (
             <p className="text-sm text-muted-foreground">
                Please log in or sign up to get started.
              </p>
          )}
        </CardContent>
      </Card>
      {/* Other dashboard content would go here, below this card */}
    </div>
  );
}
