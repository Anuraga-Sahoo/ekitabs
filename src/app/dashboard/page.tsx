
"use client";

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';
import { Smile, X, BookOpen, Loader2, ChevronRight, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Subject, ExamCategory, Exam } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export default function DashboardPage() {
  const { userName, isLoggedIn, isLoading: authLoading } = useAuth();
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const popupTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true);
  const [subjectError, setSubjectError] = useState<string | null>(null);
  
  const [examCategories, setExamCategories] = useState<ExamCategory[]>([]);
  const [isLoadingExamCategories, setIsLoadingExamCategories] = useState(true);
  const [examCategoryError, setExamCategoryError] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoadingExams, setIsLoadingExams] = useState(false);
  const [examError, setExamError] = useState<string | null>(null);

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
    async function fetchExamCategories() {
      setIsLoadingExamCategories(true);
      setExamCategoryError(null);
      try {
        const response = await fetch('/api/exam-categories');
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Failed to fetch exam categories' }));
          throw new Error(errorData.message || `Error: ${response.statusText}`);
        }
        const data = await response.json();
        setExamCategories(data.categories || []);
        if (data.categories && data.categories.length > 0) {
          setSelectedCategoryId(data.categories[0].id); // Select first category by default
        }
      } catch (error) {
        console.error("Failed to fetch exam categories:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred while fetching exam categories.";
        setExamCategoryError(errorMessage);
        toast({
          title: "Error Loading Exam Categories",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsLoadingExamCategories(false);
      }
    }

    if (isLoggedIn) { 
        fetchSubjects();
        fetchExamCategories();
    } else if (!authLoading && !isLoggedIn) { 
        setIsLoadingSubjects(false); 
        setSubjects([]);
        setIsLoadingExamCategories(false);
        setExamCategories([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, authLoading]); 

  useEffect(() => {
    async function fetchExamsForCategory() {
      if (!selectedCategoryId) {
        setExams([]);
        return;
      }
      setIsLoadingExams(true);
      setExamError(null);
      try {
        const response = await fetch(`/api/exams?categoryId=${selectedCategoryId}`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: `Failed to fetch exams for category ${selectedCategoryId}` }));
          throw new Error(errorData.message || `Error: ${response.statusText}`);
        }
        const data = await response.json();
        setExams(data.exams || []);
      } catch (error) {
        console.error("Failed to fetch exams:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred while fetching exams.";
        setExamError(errorMessage);
        toast({
          title: "Error Loading Exams",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsLoadingExams(false);
      }
    }
    if (selectedCategoryId) {
      fetchExamsForCategory();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategoryId]);


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
            {[...Array(4)].map((_, index) => ( 
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
            </CardContent>
          </Card>
        )}

        {!isLoadingSubjects && !subjectError && subjects.length === 0 && (
          <Card className="p-6 text-center text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-3 text-primary" />
            <p className="text-lg">No subjects found.</p>
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
                        data-ai-hint={subject.name.toLowerCase().split(" ").slice(0,2).join(" ")}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null; 
                          target.src = `https://placehold.co/400x160.png`;
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

      <section>
        <div className="flex items-center mb-4">
            <div className="w-1.5 h-8 bg-primary rounded-full mr-3"></div>
            <h2 className="text-3xl font-bold text-foreground">Mock Tests</h2>
        </div>
        <p className="text-muted-foreground mb-6">
            Get exam-ready with concepts, questions and study notes as per the latest pattern.
        </p>

        {isLoadingExamCategories && (
            <div className="flex space-x-2 mb-6">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 w-32 rounded-full" />)}
            </div>
        )}
        {!isLoadingExamCategories && examCategoryError && (
            <Card className="bg-destructive/10 border-destructive text-destructive-foreground p-4 mb-6">
                <CardHeader><CardTitle>Failed to load exam categories</CardTitle></CardHeader>
                <CardContent><p>{examCategoryError}</p></CardContent>
            </Card>
        )}
        {!isLoadingExamCategories && !examCategoryError && examCategories.length > 0 && (
            <ScrollArea className="w-full whitespace-nowrap rounded-md mb-6">
                <div className="flex space-x-2 pb-2">
                {examCategories.map((category) => (
                    <Button
                    key={category.id}
                    variant={selectedCategoryId === category.id ? "default" : "outline"}
                    onClick={() => setSelectedCategoryId(category.id)}
                    className="rounded-full px-4 py-2 text-sm"
                    >
                    {category.name}
                    </Button>
                ))}
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        )}
         {!isLoadingExamCategories && !examCategoryError && examCategories.length === 0 && (
            <Card className="p-6 text-center text-muted-foreground mb-6">
              <Layers className="h-12 w-12 mx-auto mb-3 text-primary" />
              <p className="text-lg">No exam categories found.</p>
            </Card>
        )}


        {isLoadingExams && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                    <Card key={i} className="p-4 rounded-lg shadow bg-card">
                        <div className="flex items-center space-x-3">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <Skeleton className="h-5 flex-grow" />
                            <Skeleton className="h-5 w-5 rounded" />
                        </div>
                    </Card>
                ))}
            </div>
        )}
        {!isLoadingExams && examError && (
          <Card className="bg-destructive/10 border-destructive text-destructive-foreground p-4">
            <CardHeader><CardTitle>Failed to load exams</CardTitle></CardHeader>
            <CardContent><p>{examError}</p></CardContent>
          </Card>
        )}
        {!isLoadingExams && !examError && exams.length === 0 && selectedCategoryId && (
            <Card className="p-6 text-center text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-3 text-primary" />
              <p className="text-lg">No mock exams found for this category.</p>
            </Card>
        )}
        {!isLoadingExams && !examError && exams.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {exams.map((exam) => (
                <Link key={exam.id} href={`/mock-test?examId=${exam.id}`} passHref>
                    <Card className="group p-4 rounded-lg shadow bg-card hover:shadow-md transition-shadow cursor-pointer">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <Image
                                    src={exam.iconUrl || `https://placehold.co/40x40.png`}
                                    alt={exam.name}
                                    width={40}
                                    height={40}
                                    className="rounded-full object-cover"
                                    data-ai-hint={exam.name.toLowerCase().split(" ").slice(0,2).join(" ")}
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.onerror = null;
                                        target.src = `https://placehold.co/40x40.png`;
                                    }}
                                />
                                <span className="text-sm font-medium text-card-foreground group-hover:text-primary">
                                    {exam.name}
                                </span>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                        </div>
                    </Card>
                </Link>
                ))}
            </div>
        )}
        {/* Optionally, add an "Explore all exams" link/button if needed, similar to the image */}
        {/* <div className="mt-6 text-center">
            <Button variant="link" asChild>
                <Link href="/all-exams">Explore all exams</Link>
            </Button>
        </div> */}

      </section>
    </div>
  );
}
