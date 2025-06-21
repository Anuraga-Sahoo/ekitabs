"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { BookOpen, Download, ChevronsUpDown } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Exam } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function PreviousYearTestsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoadingExams, setIsLoadingExams] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchExams() {
      setIsLoadingExams(true);
      setError(null);
      try {
        // Re-using the API that fetches exam listings {id, name}
        const response = await fetch('/api/exam-categories');
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Failed to fetch exams list' }));
          throw new Error(errorData.message || `Error: ${response.statusText}`);
        }
        const data = await response.json();
        setExams(data.categories || []);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
        console.error("Failed to fetch exams:", err);
        setError(errorMessage);
        toast({
          title: "Error Loading Exams",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsLoadingExams(false);
      }
    }
    fetchExams();
  }, [toast]);
  
  const selectedExam = exams.find(e => e.id === selectedExamId);

  // Placeholder data - this would be fetched based on selectedExamId in a real scenario
  const samplePapers = [
    { year: 2023, examName: selectedExam?.name || "Exam", subject: "Physics, Chemistry, Biology", downloadLink: "#" },
    { year: 2022, examName: selectedExam?.name || "Exam", subject: "Physics, Chemistry, Maths", downloadLink: "#" },
    { year: 2023, examName: selectedExam?.name || "Exam", subject: "Sample Paper - Science", downloadLink: "#" },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-primary flex items-center justify-center">
          <BookOpen className="mr-3 h-10 w-10" /> Previous Year Question Papers
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          Select an exam to access past papers, understand patterns, and practice effectively.
        </p>
      </header>
      
      <div className="flex justify-center mb-12">
        {isLoadingExams ? (
          <Skeleton className="h-12 w-full max-w-lg" />
        ) : error ? (
           <Card className="w-full max-w-lg bg-destructive/10 border-destructive text-destructive-foreground p-4">
              <CardHeader className="p-2">
                <CardTitle className="text-lg">Failed to load exams</CardTitle>
                <CardDescription className="text-destructive-foreground/80">{error}</CardDescription>
              </CardHeader>
            </Card>
        ) : (
          <Select 
            onValueChange={(value) => setSelectedExamId(value)} 
            value={selectedExamId || ""}
          >
            <SelectTrigger className="w-full max-w-lg text-lg py-6 h-auto">
              <ChevronsUpDown className="mr-3 h-5 w-5 opacity-60" />
              <SelectValue placeholder="Select an Exam..." />
            </SelectTrigger>
            <SelectContent>
              {exams.length > 0 ? exams.map((exam) => (
                <SelectItem key={exam.id} value={exam.id} className="text-base py-2">
                  {exam.name}
                </SelectItem>
              )) : (
                <div className="p-4 text-center text-sm text-muted-foreground">No exams found.</div>
              )}
            </SelectContent>
          </Select>
        )}
      </div>

      {selectedExamId ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {samplePapers.map((paper, index) => (
            <Card key={index} className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-xl text-foreground">{paper.examName} - {paper.year}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">{paper.subject}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-muted-foreground text-sm">
                  This section will provide access to the actual question paper for {paper.examName} {paper.year}. 
                  Practicing with previous year papers is a key strategy for exam success.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Link href={paper.downloadLink}>
                    <Download className="mr-2 h-5 w-5" /> Download Paper (Coming Soon)
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="max-w-2xl mx-auto shadow-lg text-center">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-primary">Please Select an Exam</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-lg">
            <p className="text-muted-foreground">
              Choose an exam from the dropdown above to view available past papers.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
