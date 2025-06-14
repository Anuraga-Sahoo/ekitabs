
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
              <CardDescription className="text-lg text-muted-foreground">
                Everything you need is in the sidebar. Explore and make the most of TestPrep AI!
              </CardDescription>
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
              <p className="text-muted-foreground">
                You can manage your tests, review history, and update your profile using the links in the sidebar.
              </p>
              <p className="text-muted-foreground">
                Ready to start? Select an option from the navigation menu.
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
