
"use client";

import type { TestResultItem, AppQuestion } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, MinusCircle, Download, RotateCcw, HomeIcon } from 'lucide-react';
import { generateTestPdf } from '@/lib/pdfGenerator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface TestResultsDisplayProps {
  result: TestResultItem;
  onNavigateHome?: () => void;
}

const getMark = (question: AppQuestion): number => {
    if (!question.userAnswer || question.userAnswer.trim() === "") return 0; // Unanswered
    if (question.userAnswer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase()) return 4; // Correct
    return -1; // Incorrect
};

export default function TestResultsDisplay({ result, onNavigateHome }: TestResultsDisplayProps) {
  const { score, questions, testType, originalQuizId, config } = result;
  const router = useRouter();

  const handleRetakeTest = () => {
    if (originalQuizId) {
      const path = testType === 'mock' ? '/mock-test' : '/practice-test';
      router.push(`${path}?retakeQuizId=${originalQuizId}`);
    } else {
      // Fallback or error, though originalQuizId should always be present
      console.error("OriginalQuizId not found, cannot retake.");
      if (onNavigateHome) onNavigateHome(); // Or navigate to a safe page
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-2xl my-8">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold text-primary">Test Results</CardTitle>
        <CardDescription className="text-lg">
          Here's how you performed in your {result.testTitle || testType} test.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Card className="bg-secondary/50">
          <CardHeader>
            <CardTitle className="text-xl">Score Summary</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-base">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>Correct: {score.correct}</span>
            </div>
            <div className="flex items-center space-x-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <span>Incorrect: {score.incorrect}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MinusCircle className="h-5 w-5 text-yellow-500" />
              <span>Unanswered: {score.unanswered}</span>
            </div>
            <div className="font-bold text-lg col-span-2 text-center pt-2">
              Total Score: {score.totalScore} / {score.maxScore}
            </div>
          </CardContent>
        </Card>

        <div>
          <h3 className="text-xl font-semibold mb-2 text-center">Detailed Answers</h3>
          <ScrollArea className="h-[400px] w-full rounded-md border p-4 bg-background">
            <div className="space-y-4">
              {questions.map((q, index) => {
                const mark = getMark(q);
                let badgeVariant: "default" | "destructive" | "secondary" = "secondary";
                if (mark === 4) badgeVariant = "default"; // Correct
                if (mark === -1) badgeVariant = "destructive"; // Incorrect
                
                return (
                <div key={q.id || `q-${index}`} className="p-3 border rounded-md bg-card">
                  <p className="font-semibold mb-2">Q{index + 1}: {q.questionText}</p>
                  <div className="ml-2 my-2 space-y-1 text-sm">
                    {q.options.map((option, optIndex) => {
                      const isCorrectOption = option.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
                      const isUserChoice = q.userAnswer && option.trim().toLowerCase() === q.userAnswer.trim().toLowerCase();
                      
                      return (
                        <div 
                          key={`${q.id || index}-opt-${optIndex}`} 
                          className={cn(
                            "p-1.5 rounded-md flex items-center justify-between",
                            isCorrectOption && "bg-green-100 dark:bg-green-800/30 border border-green-500",
                            isUserChoice && !isCorrectOption && "bg-red-100 dark:bg-red-800/30 border border-red-500",
                            isUserChoice && isCorrectOption && "ring-2 ring-offset-1 ring-offset-card ring-green-600 dark:ring-green-500",
                            !isUserChoice && !isCorrectOption && "border border-transparent"
                          )}
                        >
                          <span>{String.fromCharCode(65 + optIndex)}. {option}</span>
                          {isCorrectOption && <CheckCircle className="h-4 w-4 text-green-600 ml-2 flex-shrink-0" />}
                          {isUserChoice && !isCorrectOption && <XCircle className="h-4 w-4 text-red-600 ml-2 flex-shrink-0" />}
                        </div>
                      );
                    })}
                  </div>
                  {!q.userAnswer && <p className="text-xs text-yellow-600 dark:text-yellow-400 ml-2 mb-1">Not Answered</p>}
                  <Badge variant={badgeVariant} className={`mt-1 ${mark === 4 ? 'bg-green-500 hover:bg-green-600 text-white' : mark === -1 ? 'bg-red-500 hover:bg-red-600 text-white' : ''}`}>
                    {mark === 4 ? '+4 Marks' : mark === -1 ? '-1 Mark' : '0 Marks'}
                  </Badge>
                </div>
              )})}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-center gap-3 pt-6 sm:gap-4">
        <Button onClick={handleRetakeTest} variant="secondary">
          <RotateCcw className="mr-2 h-4 w-4" /> Retake This Test
        </Button>
        <Button onClick={() => generateTestPdf(result)} variant="outline">
          <Download className="mr-2 h-4 w-4" /> Download PDF
        </Button>
         {onNavigateHome && (
          <Button onClick={onNavigateHome} variant="default">
            <HomeIcon className="mr-2 h-4 w-4" /> Back to Home
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
