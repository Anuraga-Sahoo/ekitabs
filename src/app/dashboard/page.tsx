
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton'; // For loading state
import { Smile } from 'lucide-react';

export default function DashboardPage() {
  const { userName, isLoggedIn, isLoading } = useAuth();

  return (
    <div className="w-full">
      <Card className="shadow-lg">
        <CardHeader className="text-center">
          {isLoading ? (
            <>
              <Skeleton className="h-8 w-48 mx-auto mb-2" />
              <Skeleton className="h-5 w-64 mx-auto" />
            </>
          ) : isLoggedIn ? (
            <>
              <div className="flex items-center justify-center mb-2">
                 <Smile className="h-10 w-10 text-primary mr-2" />
                 <CardTitle className="text-3xl font-bold text-primary">
                    Hi, {userName}! Welcome 👋
                 </CardTitle>
              </div>
              {/* Informational text removed from here */}
            </>
          ) : (
            <>
              <CardTitle className="text-3xl font-bold text-primary">Welcome to TestPrep AI</CardTitle>
              <CardDescription className="text-lg text-muted-foreground">
                Please log in to access your dashboard.
              </CardDescription>
            </>
          )}
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          {isLoading ? (
            <>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4 mx-auto" />
            </>
          ) : isLoggedIn ? (
            <>
              {/* Supporting text removed from CardContent as well */}
               <p className="text-muted-foreground">
                Your AI-powered test preparation journey starts here. Use the sidebar to navigate.
              </p>
            </>
          ) : (
             <p className="text-muted-foreground">
                Log in or sign up to begin your personalized test preparation journey.
              </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
