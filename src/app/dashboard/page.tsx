
"use client";

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'; // Added CardDescription, CardFooter
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';
import { Smile, X, BookOpen, Loader2, ChevronRight, Layers, ChevronsUpDown } from 'lucide-react'; // Added ChevronsUpDown for Select
import { cn } from '@/lib/utils';
import type { Subject, Exam, ClientQuiz } from '@/types'; // Changed ExamCategory to Exam
import Image from 'next/image';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Added Select components

export default function DashboardPage() {
  const { userName, isLoggedIn, isLoading: authLoading } = useAuth();
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const popupTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true);
  const [subjectError, setSubjectError] = useState<string | null>(null);
  
  const [examListings, setExamListings] = useState<Exam[]>([]); // Changed from examCategories to examListings, type to Exam[]
  const [isLoadingExamListings, setIsLoadingExamListings] = useState(true); // Renamed
  const [examListingError, setExamListingError] = useState<string | null>(null); // Renamed
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null); // Renamed from selectedCategoryId

  const [mockQuizzes, setMockQuizzes] = useState<ClientQuiz[]>([]);
  const [isLoadingMockQuizzes, setIsLoadingMockQuizzes] = useState(false);
  const [mockQuizError, setMockQuizError] = useState<string | null>(null);

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
    async function fetchExamListingsForDropdown() { // Renamed function
      setIsLoadingExamListings(true);
      setExamListingError(null);
      try {
        // This API now fetches from 'exams' collection for names and IDs
        const response = await fetch('/api/exam-categories'); // API route name is still exam-categories
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Failed to fetch exam listings' }));
          throw new Error(errorData.message || `Error: ${response.statusText}`);
        }
        const data = await response.json();
        setExamListings(data.categories || []); // data.categories now contains {id, name} from exams collection
        // Do not automatically select an exam
      } catch (error) {
        console.error("Failed to fetch exam listings:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred while fetching exam listings.";
        setExamListingError(errorMessage);
        toast({
          title: "Error Loading Exam Listings",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsLoadingExamListings(false);
      }
    }

    if (isLoggedIn) { 
        fetchSubjects();
        fetchExamListingsForDropdown(); // Call renamed function
    } else if (!authLoading && !isLoggedIn) { 
        setIsLoadingSubjects(false); 
        setSubjects([]);
        setIsLoadingExamListings(false); // Update loading state
        setExamListings([]); // Update state variable
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, authLoading]); 

  useEffect(() => {
    async function fetchQuizzesForSelectedExam() { // Renamed function
      if (!selectedExamId) {
        setMockQuizzes([]);
        return;
      }
      setIsLoadingMockQuizzes(true);
      setMockQuizError(null);
      try {
        const response = await fetch(`/api/exams?examId=${selectedExamId}`); // Changed to examId
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: `Failed to fetch mock quizzes for exam ${selectedExamId}` }));
          throw new Error(errorData.message || `Error: ${response.statusText}`);
        }
        const data = await response.json();
        setMockQuizzes(data.quizzes || []);
      } catch (error) {
        console.error("Failed to fetch mock quizzes:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred while fetching mock quizzes.";
        setMockQuizError(errorMessage);
        toast({
          title: "Error Loading Mock Quizzes",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsLoadingMockQuizzes(false);
      }
    }
    if (selectedExamId) {
      fetchQuizzesForSelectedExam(); // Call renamed function
    } else {
      setMockQuizzes([]); // Clear quizzes if no exam is selected
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedExamId]);


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
          <Card className="shadow-xl border-primary/30 bg-card"> {/* Changed from bg-background */}
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
                 <p className="text-sm text-muted-foreground">
                  Use the sidebar to navigate your test preparation journey.
                </p>
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
              <Card key={index} className="p-0 rounded-xl shadow-md bg-card overflow-hidden">
                <Skeleton className="h-40 w-full" /> 
                <div className="p-4">
                  <Skeleton className="h-6 w-3/4 mx-auto" />
                </div>
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

        {isLoadingExamListings && (
            <Skeleton className="h-10 w-full max-w-sm rounded-md mb-6" />
        )}
        {!isLoadingExamListings && examListingError && (
            <Card className="bg-destructive/10 border-destructive text-destructive-foreground p-4 mb-6">
                <CardHeader><CardTitle>Failed to load exam list</CardTitle></CardHeader>
                <CardContent><p>{examListingError}</p></CardContent>
            </Card>
        )}
        {!isLoadingExamListings && !examListingError && examListings.length > 0 && (
            <Select 
              onValueChange={(value) => setSelectedExamId(value)} 
              value={selectedExamId || ""}
            >
              <SelectTrigger className="w-full max-w-sm mb-6 text-base py-3 h-auto">
                <ChevronsUpDown className="mr-2 h-4 w-4 opacity-50" />
                <SelectValue placeholder="Select an Exam" />
              </SelectTrigger>
              <SelectContent>
                {examListings.map((exam) => (
                  <SelectItem key={exam.id} value={exam.id} className="text-base py-2">
                    {exam.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
        )}
         {!isLoadingExamListings && !examListingError && examListings.length === 0 && (
            <Card className="p-6 text-center text-muted-foreground mb-6">
              <Layers className="h-12 w-12 mx-auto mb-3 text-primary" />
              <p className="text-lg">No exams found to select.</p>
            </Card>
        )}


        {isLoadingMockQuizzes && selectedExamId && ( // Show loading only if an exam is selected
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
        {!isLoadingMockQuizzes && mockQuizError && selectedExamId && ( // Show error only if an exam is selected
          <Card className="bg-destructive/10 border-destructive text-destructive-foreground p-4">
            <CardHeader><CardTitle>Failed to load mock quizzes</CardTitle></CardHeader>
            <CardContent><p>{mockQuizError}</p></CardContent>
          </Card>
        )}
        {!isLoadingMockQuizzes && !mockQuizError && mockQuizzes.length === 0 && selectedExamId && ( // Show 'no quizzes' only if an exam is selected
            <Card className="p-6 text-center text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-3 text-primary" />
              <p className="text-lg">No published mock quizzes found for this exam.</p>
            </Card>
        )}
        {/* Display quizzes only if an exam is selected, not loading, and no error */}
        {!isLoadingMockQuizzes && !mockQuizError && mockQuizzes.length > 0 && selectedExamId && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockQuizzes.map((quiz) => (
                <Link key={quiz.id} href={`/mock-test?quizId=${quiz.id}`} passHref> 
                    <Card className="group p-4 rounded-lg shadow bg-card hover:shadow-md transition-shadow cursor-pointer">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <Image
                                    src={quiz.iconUrl || `https://placehold.co/40x40.png`}
                                    alt={quiz.title}
                                    width={40}
                                    height={40}
                                    className="rounded-full object-cover"
                                    data-ai-hint={quiz.title.toLowerCase().split(" ").slice(0,2).join(" ")}
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.onerror = null;
                                        target.src = `https://placehold.co/40x40.png`;
                                    }}
                                />
                                <span className="text-sm font-medium text-card-foreground group-hover:text-primary">
                                    {quiz.title} 
                                </span>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                        </div>
                    </Card>
                </Link>
                ))}
            </div>
        )}
      </section>
    </div>
  );
}
