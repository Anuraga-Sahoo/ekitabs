
"use client";

import { useState, useEffect } from 'react';
import { getTestHistory, clearTestHistory, deleteTestResult } from '@/lib/testHistoryStorage';
import type { TestResultItem } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Trash2, Inbox, RotateCcw, Loader2 } from 'lucide-react';
import { generateTestPdf } from '@/lib/pdfGenerator';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';

export default function TestHistoryPage() {
  const [history, setHistory] = useState<TestResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClearing, setIsClearing] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    async function fetchHistory() {
      setIsLoading(true);
      try {
        const fetchedHistory = await getTestHistory();
        setHistory(fetchedHistory);
      } catch (error) {
        console.error("Failed to fetch test history:", error);
        toast({
          title: "Error Fetching History",
          description: "Could not load test history from the database. Please try again later.",
          variant: "destructive",
        });
        setHistory([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchHistory();
  }, [toast]);

  const handleClearAllHistory = async () => {
    setIsClearing(true);
    try {
      await clearTestHistory();
      setHistory([]);
      toast({ title: "History Cleared", description: "All test history has been deleted." });
    } catch (error) {
      console.error("Failed to clear test history:", error);
      toast({
        title: "Error Clearing History",
        description: "Could not clear test history. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsClearing(false);
    }
  };

  const handleDeleteSingleTest = async (testAttemptId: string) => {
    setIsDeleting(testAttemptId);
    try {
      await deleteTestResult(testAttemptId);
      setHistory(prevHistory => prevHistory.filter(item => item.testAttemptId !== testAttemptId));
      toast({ title: "Test Deleted", description: "The selected test has been removed from your history." });
    } catch (error) {
      console.error(`Failed to delete test ${testAttemptId}:`, error);
      toast({
        title: "Error Deleting Test",
        description: "Could not delete the selected test. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const handleRetakeTest = (item: TestResultItem) => {
    if (!item.testAttemptId) {
       toast({ title: "Error", description: "Cannot retake test without an attempt ID.", variant: "destructive" });
       return;
    }
  
    if (item.testType === 'practice' && item.config) {
      const { subject, chapter, numberOfQuestions, complexityLevel } = item.config;
      const params = new URLSearchParams({
        subject,
        chapter,
        numberOfQuestions: String(numberOfQuestions),
        complexityLevel,
        attemptToUpdateId: item.testAttemptId, // Pass the ID of the attempt to update
      });
      router.push(`/practice-test?${params.toString()}`);
    } else if (item.testType === 'mock' && item.originalQuizId) {
      router.push(`/mock-test?quizId=${item.originalQuizId}&attemptToUpdateId=${item.testAttemptId}`);
    } else {
      toast({ title: "Error", description: "Could not find the necessary data to retake this test.", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Loading test history...</p>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-xl my-8">
      <CardHeader>
        <CardTitle className="text-3xl font-bold text-primary">Test History</CardTitle>
        <CardDescription>Review your past test performances, download reports, retake tests, or delete specific entries.</CardDescription>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <Inbox className="mx-auto h-16 w-16 mb-4" />
            <p className="text-xl">No test history found.</p>
            <p>Complete some tests to see your progress here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Test Title</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((item) => (
                  <TableRow key={item.testAttemptId}>
                    <TableCell>{format(new Date(item.dateCompleted), 'PPp')}</TableCell>
                    <TableCell className="font-medium">{item.testTitle || item.testType}</TableCell>
                    <TableCell>{item.score.totalScore} / {item.score.maxScore}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => handleRetakeTest(item)} title="Retake Test" disabled={isDeleting === item.testAttemptId || isClearing}>
                        <RotateCcw className="h-4 w-4 text-primary" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => generateTestPdf(item)} title="Download PDF" disabled={isDeleting === item.testAttemptId || isClearing}>
                        <Download className="h-4 w-4 text-accent" />
                      </Button>
                       <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" title="Delete Test" disabled={isDeleting === item.testAttemptId || isClearing}>
                            {isDeleting === item.testAttemptId ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-destructive" />}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action will permanently delete this test result. This cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteSingleTest(item.testAttemptId)}
                              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                            >
                              Yes, delete test
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      {history.length > 0 && (
        <CardFooter className="justify-end">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isClearing || !!isDeleting}>
                {isClearing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />} 
                {isClearing ? "Clearing..." : "Clear All History"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete ALL your test history.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearAllHistory} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                  Yes, delete all history
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      )}
    </Card>
  );
}
