
"use client";

import type { TestResultItem, AppQuestion } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, MinusCircle, Download, RotateCcw, HomeIcon, BookOpen, TrendingUp, TrendingDown, BarChart3, Clock } from 'lucide-react';
import { generateTestPdf } from '@/lib/pdfGenerator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { Separator } from '@/components/ui/separator';

interface TestResultsDisplayProps {
  result: TestResultItem;
  onNavigateHome?: () => void;
}

const getMark = (question: AppQuestion): number => {
    if (!question.userAnswer || question.userAnswer.trim() === "") return 0; // Unanswered
    if (question.userAnswer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase()) return 4; // Correct
    return -1; // Incorrect
};

interface SubjectPerformance {
  subject: string;
  totalQuestions: number;
  correct: number;
  incorrect: number;
  unanswered: number;
  marksObtained: number;
  maxMarks: number;
  percentage: number;
}

export default function TestResultsDisplay({ result, onNavigateHome }: TestResultsDisplayProps) {
  const { score, questions, testType, originalQuizId, testTitle } = result;
  const router = useRouter();

  const handleRetakeTest = () => {
    if (originalQuizId) {
      const path = testType === 'mock' ? '/mock-test' : '/practice-test';
      router.push(`${path}?retakeQuizId=${originalQuizId}`);
    } else {
      console.error("OriginalQuizId not found, cannot retake.");
      if (onNavigateHome) onNavigateHome();
    }
  };

  const attemptedQuestions = score.correct + score.incorrect;
  const totalQuestions = questions.length;

  const subjectPerformance: SubjectPerformance[] = [];
  if (questions.length > 0) {
    const performanceBySubject: Record<string, { total: number; correct: number; incorrect: number; unanswered: number; marksObtained: number; maxMarks: number }> = {};

    questions.forEach(q => {
      if (!performanceBySubject[q.subject]) {
        performanceBySubject[q.subject] = { total: 0, correct: 0, incorrect: 0, unanswered: 0, marksObtained: 0, maxMarks: 0 };
      }
      performanceBySubject[q.subject].total++;
      performanceBySubject[q.subject].maxMarks += 4;

      const mark = getMark(q);
      if (mark === 4) {
        performanceBySubject[q.subject].correct++;
        performanceBySubject[q.subject].marksObtained += 4;
      } else if (mark === -1) {
        performanceBySubject[q.subject].incorrect++;
        performanceBySubject[q.subject].marksObtained -= 1;
      } else {
        performanceBySubject[q.subject].unanswered++;
      }
    });

    for (const subjectName in performanceBySubject) {
      const data = performanceBySubject[subjectName];
      const percentage = data.maxMarks > 0 ? Math.max(0, parseFloat(((data.marksObtained / data.maxMarks) * 100).toFixed(2))) : 0;
      subjectPerformance.push({
        subject: subjectName,
        totalQuestions: data.total,
        correct: data.correct,
        incorrect: data.incorrect,
        unanswered: data.unanswered,
        marksObtained: data.marksObtained,
        maxMarks: data.maxMarks,
        percentage,
      });
    }
    subjectPerformance.sort((a, b) => b.percentage - a.percentage);
  }

  const strongestSubject = subjectPerformance.length > 0 ? subjectPerformance[0] : null;
  const weakestSubject = subjectPerformance.length > 0 && subjectPerformance.length > 1 && subjectPerformance[0].percentage !== subjectPerformance[subjectPerformance.length - 1].percentage 
    ? subjectPerformance[subjectPerformance.length - 1] 
    : (subjectPerformance.length === 1 ? null : subjectPerformance[subjectPerformance.length - 1]);


  return (
    <Card className="w-full max-w-5xl mx-auto shadow-2xl my-4 md:my-8">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-3xl md:text-4xl font-bold text-primary">Test Results</CardTitle>
        <CardDescription className="text-lg md:text-xl">
          Here's how you performed in your {testTitle || testType} test.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 md:space-y-8 px-4 md:px-6">
        
        <Card className="bg-card border shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl flex items-center"><BookOpen className="mr-2 h-5 w-5 text-primary" />Overall Summary</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-base">
            <div className="flex items-center space-x-2 p-2 bg-secondary/30 rounded-md">
              <span className="font-semibold">Total Questions:</span>
              <span>{totalQuestions}</span>
            </div>
            <div className="flex items-center space-x-2 p-2 bg-secondary/30 rounded-md">
              <span className="font-semibold">Attempted:</span>
              <span>{attemptedQuestions}</span>
            </div>
             <div className="flex items-center space-x-2 p-2 bg-secondary/30 rounded-md">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-semibold">Correct:</span>
              <span>{score.correct}</span>
            </div>
            <div className="flex items-center space-x-2 p-2 bg-secondary/30 rounded-md">
              <XCircle className="h-5 w-5 text-red-600" />
              <span className="font-semibold">Incorrect:</span>
              <span>{score.incorrect}</span>
            </div>
            <div className="flex items-center space-x-2 p-2 bg-secondary/30 rounded-md">
              <MinusCircle className="h-5 w-5 text-yellow-500" />
              <span className="font-semibold">Unanswered:</span>
              <span>{score.unanswered}</span>
            </div>
             <div className="flex items-center space-x-2 p-2 bg-secondary/30 rounded-md">
                <Clock className="h-5 w-5 text-blue-500" />
                <span className="font-semibold">Time Taken:</span>
                <span>N/A</span> {/* Placeholder */}
            </div>
            <div className="font-bold text-lg col-span-full text-center pt-3 text-primary">
              Total Score: {score.totalScore} / {score.maxScore}
            </div>
          </CardContent>
           <CardFooter className="text-xs text-muted-foreground pt-2">
            Time Taken is a planned feature. Data for it is not yet recorded.
          </CardFooter>
        </Card>

        {subjectPerformance.length > 0 && (
          <Card className="bg-card border shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl flex items-center"><BarChart3 className="mr-2 h-5 w-5 text-primary" />Subject-wise Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {subjectPerformance.map((subPerf) => (
                <div key={subPerf.subject} className="p-3 border rounded-md bg-secondary/30">
                  <h4 className="font-semibold text-lg text-primary">{subPerf.subject}</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm mt-2">
                    <p>Total: {subPerf.totalQuestions}</p>
                    <p className="text-green-600">Correct: {subPerf.correct}</p>
                    <p className="text-red-600">Incorrect: {subPerf.incorrect}</p>
                    <p className="text-yellow-500">Unanswered: {subPerf.unanswered}</p>
                    <p className="font-medium col-span-full sm:col-span-1">Score: {subPerf.marksObtained} / {subPerf.maxMarks}</p>
                    <p className="font-bold col-span-full sm:col-span-1">Percentage: {subPerf.percentage}%</p>
                  </div>
                </div>
              ))}
              <Separator className="my-4" />
              <div className="text-sm space-y-1">
                {strongestSubject && (
                  <div className="flex items-center">
                    <TrendingUp className="h-5 w-5 text-green-500 mr-2" /> 
                    <span className="font-semibold">Strongest Area:</span> {strongestSubject.subject} ({strongestSubject.percentage}%)
                  </div>
                )}
                {weakestSubject && strongestSubject?.subject !== weakestSubject.subject && (
                  <div className="flex items-center">
                     <TrendingDown className="h-5 w-5 text-red-500 mr-2" /> 
                     <span className="font-semibold">Needs More Focus:</span> {weakestSubject.subject} ({weakestSubject.percentage}%)
                  </div>
                )}
                 {weakestSubject && strongestSubject?.subject === weakestSubject.subject && subjectPerformance.length > 1 && (
                   <p className="text-muted-foreground">Performance is consistent across subjects.</p>
                 )}
              </div>
            </CardContent>
          </Card>
        )}

        <div>
          <h3 className="text-xl font-semibold mb-3 text-center text-primary">Detailed Answers</h3>
          <ScrollArea className="h-[450px] w-full rounded-md border p-4 bg-background shadow-inner">
            <div className="space-y-4">
              {questions.map((q, index) => {
                const mark = getMark(q);
                let badgeVariant: "default" | "destructive" | "secondary" = "secondary";
                if (mark === 4) badgeVariant = "default"; 
                if (mark === -1) badgeVariant = "destructive"; 
                
                return (
                <div key={q.id || `q-${index}`} className="p-4 border rounded-lg bg-card shadow-sm">
                  <div className="flex justify-between items-start">
                    <p className="font-semibold text-base mb-2">Q{index + 1}: {q.questionText}</p>
                    <Badge variant={badgeVariant} className={`whitespace-nowrap ml-2 ${mark === 4 ? 'bg-green-500 hover:bg-green-600 text-white' : mark === -1 ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-yellow-400 hover:bg-yellow-500 text-black'}`}>
                      {mark === 4 ? '+4 Marks' : mark === -1 ? '-1 Mark' : '0 Marks'}
                    </Badge>
                  </div>
                  {q.subject && <p className="text-xs text-muted-foreground mb-2">Subject: {q.subject}</p>}
                  <div className="ml-2 my-2 space-y-1.5 text-sm">
                    {q.options.map((option, optIndex) => {
                      const isCorrectOption = option.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
                      const isUserChoice = q.userAnswer && option.trim().toLowerCase() === q.userAnswer.trim().toLowerCase();
                      
                      return (
                        <div 
                          key={`${q.id || index}-opt-${optIndex}`} 
                          className={cn(
                            "p-2 rounded-md flex items-center justify-between text-left",
                            "transition-colors duration-150 ease-in-out",
                            isCorrectOption && "bg-green-100 dark:bg-green-800/30 border border-green-400 dark:border-green-600",
                            isUserChoice && !isCorrectOption && "bg-red-100 dark:bg-red-800/30 border border-red-400 dark:border-red-600",
                            isUserChoice && isCorrectOption && "ring-2 ring-offset-1 ring-offset-card ring-green-500 dark:ring-green-500",
                            !isUserChoice && !isCorrectOption && "border border-muted/50 hover:bg-muted/20"
                          )}
                        >
                          <span>{String.fromCharCode(65 + optIndex)}. {option}</span>
                          {isCorrectOption && <CheckCircle className="h-4 w-4 text-green-600 ml-2 flex-shrink-0" />}
                          {isUserChoice && !isCorrectOption && <XCircle className="h-4 w-4 text-red-600 ml-2 flex-shrink-0" />}
                        </div>
                      );
                    })}
                  </div>
                  {!q.userAnswer && <p className="text-xs text-yellow-600 dark:text-yellow-400 ml-2 mb-1">You did not answer this question.</p>}
                   {q.userAnswer && q.userAnswer.trim().toLowerCase() !== q.correctAnswer.trim().toLowerCase() && (
                     <p className="text-xs text-green-700 dark:text-green-400 ml-2 mt-1">Correct Answer: {q.correctAnswer}</p>
                   )}
                </div>
              )})}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-center items-center gap-3 pt-6 pb-6 sm:gap-4 border-t mt-6">
        <Button onClick={handleRetakeTest} variant="secondary" size="lg" className="w-full sm:w-auto">
          <RotateCcw className="mr-2 h-5 w-5" /> Retake This Test
        </Button>
        <Button onClick={() => generateTestPdf(result)} variant="outline" size="lg" className="w-full sm:w-auto">
          <Download className="mr-2 h-5 w-5" /> Download PDF Report
        </Button>
         {onNavigateHome && (
          <Button onClick={onNavigateHome} variant="default" size="lg" className="w-full sm:w-auto">
            <HomeIcon className="mr-2 h-5 w-5" /> Back to Home
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

