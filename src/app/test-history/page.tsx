
"use client";

import { useState, useEffect } from 'react';
import { getTestHistory, clearTestHistory } from '@/lib/localStorageHelper';
import type { TestResultItem } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Trash2, Inbox, RotateCcw } from 'lucide-react';
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

export default function TestHistoryPage() {
  const [history, setHistory] = useState<TestResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setHistory(getTestHistory());
    setIsLoading(false);
  }, []);

  const handleClearHistory = () => {
    clearTestHistory();
    setHistory([]);
  };

  const handleRetakeTest = (item: TestResultItem) => {
    if (item.originalQuizId) {
      const path = item.testType === 'mock' ? '/mock-test' : '/practice-test';
      router.push(`${path}?retakeQuizId=${item.originalQuizId}`);
    } else {
      // Handle case where originalQuizId might be missing (should not happen with new saves)
      alert("Could not find original test data to retake.");
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen"><p className="text-center py-10">Loading history...</p></div>;
  }

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-xl my-8">
      <CardHeader>
        <CardTitle className="text-3xl font-bold text-primary">Test History</CardTitle>
        <CardDescription>Review your past test performances, download reports, and retake tests.</CardDescription>
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
                      <Button variant="ghost" size="icon" onClick={() => handleRetakeTest(item)} title="Retake Test">
                        <RotateCcw className="h-4 w-4 text-primary" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => generateTestPdf(item)} title="Download PDF">
                        <Download className="h-4 w-4 text-accent" />
                      </Button>
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
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" /> Clear History
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete all your test history.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearHistory} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                  Yes, delete history
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      )}
    </Card>
  );
}
