
"use client";

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';
import { Smile, X, BookOpen, Loader2, ChevronRight, Layers, ChevronsUpDown, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Subject, Exam, ClientQuiz } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { userName, isLoggedIn, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const popupTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true);
  const [subjectError, setSubjectError] = useState<string | null>(null);
  
  const [examListings, setExamListings] = useState<Exam[]>([]);
  const [isLoadingExamListings, setIsLoadingExamListings] = useState(true);
  const [examListingError, setExamListingError] = useState<string | null>(null);
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);

  const [mockQuizzes, setMockQuizzes] = useState<ClientQuiz[]>([]);
  const [isLoadingMockQuizzes, setIsLoadingMockQuizzes] = useState(false);
  const [mockQuizError, setMockQuizError] = useState<string | null>(null);

  const [selectedQuizForDialog, setSelectedQuizForDialog] = useState<ClientQuiz | null>(null);

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
        if (!response.ok) throw new Error('Failed to fetch subjects');
        const data = await response.json();
        setSubjects(data.subjects || []);
      } catch (error) {
        setSubjectError(error instanceof Error ? error.message : 'An unknown error occurred');
      } finally {
        setIsLoadingSubjects(false);
      }
    }
    async function fetchExamListingsForDropdown() {
      setIsLoadingExamListings(true);
      setExamListingError(null);
      try {
        const response = await fetch('/api/exam-categories');
        if (!response.ok) throw new Error('Failed to fetch exam listings');
        const data = await response.json();
        setExamListings(data.categories || []);
      } catch (error) {
        setExamListingError(error instanceof Error ? error.message : 'An unknown error occurred');
      } finally {
        setIsLoadingExamListings(false);
      }
    }

    if (isLoggedIn) { 
        fetchSubjects();
        fetchExamListingsForDropdown();
    } else if (!authLoading && !isLoggedIn) { 
        setIsLoadingSubjects(false); 
        setSubjects([]);
        setIsLoadingExamListings(false);
        setExamListings([]);
    }
  }, [isLoggedIn, authLoading]);

  useEffect(() => {
    async function fetchQuizzesForSelectedExam() {
      if (!selectedExamId) {
        setMockQuizzes([]);
        return;
      }
      setIsLoadingMockQuizzes(true);
      setMockQuizError(null);
      try {
        const response = await fetch(`/api/exams?examId=${selectedExamId}`);
        if (!response.ok) throw new Error('Failed to fetch mock quizzes');
        const data = await response.json();
        setMockQuizzes(data.quizzes || []);
      } catch (error) {
        setMockQuizError(error instanceof Error ? error.message : 'An unknown error occurred');
        toast({ title: "Error Loading Mock Quizzes", description: error instanceof Error ? error.message : 'An unknown error occurred', variant: "destructive" });
      } finally {
        setIsLoadingMockQuizzes(false);
      }
    }
    if (selectedExamId) {
      fetchQuizzesForSelectedExam();
    } else {
      setMockQuizzes([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedExamId]);

  const handleClosePopup = () => {
    setIsPopupVisible(false);
    if (popupTimerRef.current) {
      clearTimeout(popupTimerRef.current);
    }
  };
  
  const handleStartTest = (quizId: string) => {
    router.push(`/mock-test?quizId=${quizId}`);
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
          <Card className="shadow-xl border-primary/30 bg-card">
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
                <div className="p-4"><Skeleton className="h-6 w-3/4 mx-auto" /></div>
              </Card>
            ))}
          </div>
        )}

        {!isLoadingSubjects && subjectError && (
          <Card className="bg-destructive/10 border-destructive text-destructive-foreground p-4">
            <CardHeader><CardTitle>Failed to load subjects</CardTitle></CardHeader>
            <CardContent><p>{subjectError}</p></CardContent>
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
                    <Image
                      src={subject.imgUrl || `https://placehold.co/400x160.png`}
                      alt={subject.name}
                      width={400} height={160}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-200"
                      data-ai-hint={subject.name.toLowerCase().split(" ").slice(0,2).join(" ")}
                      onError={(e) => { e.currentTarget.src = `https://placehold.co/400x160.png`; }}
                    />
                  </div>
                  <CardContent className="p-4 flex-grow flex items-center justify-center">
                    <h3 className="text-md font-semibold text-center text-card-foreground group-hover:text-primary transition-colors">{subject.name}</h3>
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

        {isLoadingExamListings && <Skeleton className="h-10 w-full max-w-sm rounded-md mb-6" />}
        {!isLoadingExamListings && examListingError && (
            <Card className="bg-destructive/10 border-destructive text-destructive-foreground p-4 mb-6">
                <CardHeader><CardTitle>Failed to load exam list</CardTitle></CardHeader>
                <CardContent><p>{examListingError}</p></CardContent>
            </Card>
        )}
        {!isLoadingExamListings && !examListingError && examListings.length > 0 && (
            <Select onValueChange={setSelectedExamId} value={selectedExamId || ""}>
              <SelectTrigger className="w-full max-w-sm mb-6 text-base py-3 h-auto">
                <ChevronsUpDown className="mr-2 h-4 w-4 opacity-50" />
                <SelectValue placeholder="Select an Exam" />
              </SelectTrigger>
              <SelectContent>
                {examListings.map((exam) => (
                  <SelectItem key={exam.id} value={exam.id} className="text-base py-2">{exam.name}</SelectItem>
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

        {isLoadingMockQuizzes && selectedExamId && (
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
        {!isLoadingMockQuizzes && mockQuizError && selectedExamId && (
          <Card className="bg-destructive/10 border-destructive text-destructive-foreground p-4">
            <CardHeader><CardTitle>Failed to load mock quizzes</CardTitle></CardHeader>
            <CardContent><p>{mockQuizError}</p></CardContent>
          </Card>
        )}
        {!isLoadingMockQuizzes && !mockQuizError && mockQuizzes.length === 0 && selectedExamId && (
            <Card className="p-6 text-center text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-3 text-primary" />
              <p className="text-lg">No published mock quizzes found for this exam.</p>
            </Card>
        )}
        {!isLoadingMockQuizzes && !mockQuizError && mockQuizzes.length > 0 && selectedExamId && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockQuizzes.map((quiz) => (
                  <Card key={quiz.id} className="group p-4 rounded-lg shadow bg-card hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedQuizForDialog(quiz)}>
                      <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                              <Image
                                  src={quiz.iconUrl || `https://placehold.co/40x40.png`}
                                  alt={quiz.title} width={40} height={40}
                                  className="rounded-full object-cover"
                                  data-ai-hint={quiz.title.toLowerCase().split(" ").slice(0,2).join(" ")}
                                  onError={(e) => { e.currentTarget.src = `https://placehold.co/40x40.png`; }}
                              />
                              <span className="text-sm font-medium text-card-foreground group-hover:text-primary">{quiz.title}</span>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                      </div>
                  </Card>
                ))}
            </div>
        )}
      </section>

      <AlertDialog open={!!selectedQuizForDialog} onOpenChange={(isOpen) => !isOpen && setSelectedQuizForDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Start Mock Test: {selectedQuizForDialog?.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedQuizForDialog?.description || "Are you sure you want to start this mock test? The timer will begin immediately."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, go back</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleStartTest(selectedQuizForDialog!.id)}>
              Yes, start the exam
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
