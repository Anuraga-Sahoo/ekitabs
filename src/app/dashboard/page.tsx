
"use client";

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';
import { Smile, X, BookOpen, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Subject } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function DashboardPage() {
  const { userName, isLoggedIn, isLoading: authLoading } = useAuth();
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const popupTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true);
  const [subjectError, setSubjectError] = useState<string | null>(null);
  const { toast } = useToast();

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

  useEffect(() => {
    async function fetchSubjects() {
      setIsLoadingSubjects(true);
      setSubjectError(null);
      try {
        const response = await fetch('/api/subjects');
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Failed to fetch subjects' }));
          throw new Error(errorData.message || `Error: ${response.statusText}`);
        }
        const data = await response.json();
        setSubjects(data.subjects || []);
      } catch (error) {
        console.error("Failed to fetch subjects:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred while fetching subjects.";
        setSubjectError(errorMessage);
        toast({
          title: "Error Loading Subjects",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsLoadingSubjects(false);
      }
    }
    if (isLoggedIn) { 
        fetchSubjects();
    } else if (!authLoading && !isLoggedIn) { 
        setIsLoadingSubjects(false); 
        setSubjects([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, authLoading]); 

  const handleClosePopup = () => {
    setIsPopupVisible(false);
    if (popupTimerRef.current) {
      clearTimeout(popupTimerRef.current);
    }
  };

  return (
    <div className="w-full h-full relative space-y-8">
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

      <section>
        <div className="flex items-center mb-6">
          <div className="w-1.5 h-8 bg-primary rounded-full mr-3"></div>
          <h2 className="text-3xl font-bold text-foreground">Subjects</h2>
        </div>

        {isLoadingSubjects && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => ( // Show 4 skeletons for a typical row
              <Card key={index} className="p-4 rounded-lg shadow-md bg-card">
                <Skeleton className="h-40 w-full rounded-md mb-3" /> 
                <Skeleton className="h-6 w-3/4 mx-auto" />
              </Card>
            ))}
          </div>
        )}

        {!isLoadingSubjects && subjectError && (
          <Card className="bg-destructive/10 border-destructive text-destructive-foreground p-4">
            <CardHeader>
              <CardTitle>Failed to load subjects</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{subjectError}</p>
              <p>Please try refreshing the page or contact support if the issue persists.</p>
            </CardContent>
          </Card>
        )}

        {!isLoadingSubjects && !subjectError && subjects.length === 0 && (
          <Card className="p-6 text-center text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-3 text-primary" />
            <p className="text-lg">No subjects found.</p>
            <p>Please check back later or contact an administrator if you believe this is an error.</p>
          </Card>
        )}

        {!isLoadingSubjects && !subjectError && subjects.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {subjects.map((subject) => (
              <Link key={subject.id} href={`/practice-test?subject=${encodeURIComponent(subject.name)}`} passHref>
                <Card className="group h-full flex flex-col p-0 overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer bg-card">
                  <div className="relative w-full h-40 bg-muted flex items-center justify-center overflow-hidden">
                    {subject.imgUrl ? (
                      <Image
                        src={subject.imgUrl}
                        alt={subject.name}
                        width={400} 
                        height={160} 
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-200"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null; 
                          target.src = `https://placehold.co/400x160.png`; 
                          target.setAttribute('data-ai-hint', subject.name.toLowerCase().split(" ").slice(0,2).join(" "));
                        }}
                      />
                    ) : (
                      <Image
                        src={`https://placehold.co/400x160.png`}
                        alt={`${subject.name} placeholder`}
                        width={400}
                        height={160}
                        className="object-cover w-full h-full" 
                        data-ai-hint={subject.name.toLowerCase().split(" ").slice(0,2).join(" ")}
                      />
                    )}
                  </div>
                  <CardContent className="p-4 flex-grow flex items-center justify-center">
                    <h3 className="text-md font-semibold text-center text-card-foreground group-hover:text-primary transition-colors">
                      {subject.name}
                    </h3>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
