
"use client";

import type { TestResultItem, AppQuestion } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, MinusCircle, Download, RotateCcw, HomeIcon, BookOpen, TrendingUp, TrendingDown, BarChart3, Clock, Award, Eye } from 'lucide-react';
import { generateTestPdf } from '@/lib/pdfGenerator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { Separator } from '@/components/ui/separator';

interface TestResultsDisplayProps {
  result: TestResultItem;
}

const getMark = (question: AppQuestion): number => {
    if (!question.userAnswer || question.userAnswer.trim() === "") return 0; // Unanswered
    if (question.userAnswer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase()) return 4; // Correct
    return -1; // Incorrect
};

const formatTimeTaken = (seconds?: number): string => {
  if (seconds === undefined || seconds < 0) return 'N/A';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  if (h > 0) {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
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

export default function TestResultsDisplay({ result }: TestResultsDisplayProps) {
  const { score, questions, testType, originalQuizId, testTitle, timeTakenSeconds, config } = result;
  const router = useRouter();

  const handleRetakeTest = () => {
    if (originalQuizId) {
      const path = testType === 'mock' ? '/mock-test' : '/practice-test';
      router.push(`${path}?retakeQuizId=${originalQuizId}`);
    } else {
      console.error("OriginalQuizId not found, cannot retake.");
      router.push('/'); // Fallback to home
    }
  };
  
  const handleStartNextQuiz = () => {
    if (testType === 'mock') {
      router.push('/mock-test'); // This will start a new mock test
    } else if (testType === 'practice' && config) {
      // Navigate to practice test page with config to auto-start a new test on the same topic
      const queryParams = new URLSearchParams({
        subject: config.subject,
        chapter: config.chapter,
        numberOfQuestions: String(config.numberOfQuestions),
        complexityLevel: config.complexityLevel,
        autoStartNew: 'true',
      });
      router.push(`/practice-test?${queryParams.toString()}`);
    } else {
      // Fallback for practice test if config is missing (should not happen ideally)
      router.push('/practice-test');
    }
  };

  const handleViewSolution = () => {
    document.getElementById('detailed-answers-section')?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleScrollToQuestion = (questionId: string) => {
    document.getElementById(`detail-q-${questionId}`)?.scrollIntoView({ behavior: 'smooth' });
  };


  const attemptedQuestions = score.correct + score.incorrect;
  const totalQuestions = questions.length;

  const subjectPerformance: SubjectPerformance[] = [];
  if (questions.length > 0) {
    const performanceBySubject: Record<string, { total: number; correct: number; incorrect: number; unanswered: number; marksObtained: number; maxMarks: number }> = {};

    questions.forEach(q => {
      const subjectKey = q.subject || "Uncategorized"; 
      if (!performanceBySubject[subjectKey]) {
        performanceBySubject[subjectKey] = { total: 0, correct: 0, incorrect: 0, unanswered: 0, marksObtained: 0, maxMarks: 0 };
      }
      performanceBySubject[subjectKey].total++;
      performanceBySubject[subjectKey].maxMarks += 4;

      const mark = getMark(q);
      if (mark === 4) {
        performanceBySubject[subjectKey].correct++;
        performanceBySubject[subjectKey].marksObtained += 4;
      } else if (mark === -1) {
        performanceBySubject[subjectKey].incorrect++;
        performanceBySubject[subjectKey].marksObtained -= 1;
      } else {
        performanceBySubject[subjectKey].unanswered++;
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

  const allScoresSame = subjectPerformance.length > 1 && subjectPerformance.every(s => s.percentage === subjectPerformance[0].percentage);
  const strongestSubject = !allScoresSame && subjectPerformance.length > 0 ? subjectPerformance[0] : null;
  const weakestSubject = !allScoresSame && subjectPerformance.length > 1 && subjectPerformance[0].percentage !== subjectPerformance[subjectPerformance.length - 1].percentage 
    ? subjectPerformance[subjectPerformance.length - 1] 
    : null;


  return (
    <div className="min-h-screen bg-background">
      {/* Top Banner */}
      <div className="bg-[hsl(var(--brand-blue))] text-white py-6 md:py-8 text-center shadow-md">
        <h1 className="text-3xl md:text-4xl font-bold">Good Try!</h1>
        <p className="text-lg md:text-xl mt-1">Keep Practicing, Keep Improving.</p>
      </div>

      {/* Main Dashboard Content */}
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Left Column: Score & Stats */}
          <div className="md:col-span-1 bg-card p-6 rounded-lg shadow-lg flex flex-col items-center text-center">
            <Award className="h-16 w-16 text-yellow-500 mb-3" />
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">YOUR SCORE</h2>
            <p className="text-4xl font-bold text-primary my-1">{score.totalScore} / {score.maxScore}</p>
            <Separator className="my-4 w-3/4" />
            <div className="grid grid-cols-2 gap-4 w-full text-center mt-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase">Correct</p>
                <p className="text-2xl font-semibold text-green-600">{score.correct}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase">Incorrect</p>
                <p className="text-2xl font-semibold text-red-600">{score.incorrect}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase">Unanswered</p>
                <p className="text-2xl font-semibold text-yellow-500">{score.unanswered}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase">Time Taken</p>
                <p className="text-2xl font-semibold">{formatTimeTaken(timeTakenSeconds)}</p>
              </div>
            </div>
          </div>

          {/* Right Column: Your Answers Grid & Actions */}
          <div className="md:col-span-2 bg-card p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold text-foreground mb-4">YOUR ANSWERS</h2>
            <ScrollArea className="h-[180px] pr-3 mb-6">
              <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
                {questions.map((q, index) => {
                  const mark = getMark(q);
                  let bgColor = 'bg-muted hover:bg-muted/80'; // Unanswered
                  if (mark === 4) bgColor = 'bg-[hsl(var(--brand-green))] hover:bg-[hsl(var(--brand-green))]/90 text-white'; // Correct
                  else if (mark === -1) bgColor = 'bg-red-500 hover:bg-red-600 text-white'; // Incorrect
                  
                  return (
                    <Button
                      key={q.id}
                      variant="outline"
                      className={cn(
                        "h-10 w-10 p-0 rounded-full flex items-center justify-center text-sm font-medium border",
                        bgColor,
                        "border-transparent" 
                      )}
                      onClick={() => handleScrollToQuestion(q.id)}
                    >
                      {index + 1}
                    </Button>
                  );
                })}
              </div>
            </ScrollArea>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button onClick={handleViewSolution} variant="outline" size="lg" className="w-full">
                <Eye className="mr-2 h-5 w-5" /> View Solution
              </Button>
              <Button onClick={handleStartNextQuiz} size="lg" className="w-full bg-[hsl(var(--brand-green))] hover:bg-[hsl(var(--brand-green))]/90 text-primary-foreground">
                Start Next Quiz
              </Button>
              <Button onClick={handleRetakeTest} variant="outline" size="lg" className="w-full">
                <RotateCcw className="mr-2 h-5 w-5" /> Retake This Test
              </Button>
              <Button onClick={() => generateTestPdf(result)} variant="outline" size="lg" className="w-full">
                <Download className="mr-2 h-5 w-5" /> Download PDF Report
              </Button>
            </div>
          </div>
        </div>
      
        {/* Existing Detailed Sections - Preserved */}
        {subjectPerformance.length > 0 && (
          <Card className="bg-card border shadow-sm mb-6">
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
                {allScoresSame && subjectPerformance.length > 0 && (
                    <p className="text-muted-foreground">Performance is consistent across subjects ({subjectPerformance[0].percentage}%).</p>
                )}
                {!allScoresSame && strongestSubject && (
                  <div className="flex items-center">
                    <TrendingUp className="h-5 w-5 text-green-500 mr-2" /> 
                    <span className="font-semibold">Strongest Area:</span> {strongestSubject.subject} ({strongestSubject.percentage}%)
                  </div>
                )}
                {!allScoresSame && weakestSubject && (
                  <div className="flex items-center">
                     <TrendingDown className="h-5 w-5 text-red-500 mr-2" /> 
                     <span className="font-semibold">Needs More Focus:</span> {weakestSubject.subject} ({weakestSubject.percentage}%)
                  </div>
                )}
                 {!allScoresSame && subjectPerformance.length === 1 && strongestSubject && (
                    <p className="text-muted-foreground">Performance in {strongestSubject.subject}: {strongestSubject.percentage}%</p>
                 )}
              </div>
            </CardContent>
          </Card>
        )}

        <div id="detailed-answers-section">
          <h3 className="text-2xl font-semibold mb-4 text-center text-primary">Detailed Answers</h3>
          <ScrollArea className="h-[600px] w-full rounded-md border p-4 bg-background shadow-inner">
            <div className="space-y-4">
              {questions.map((q, index) => {
                const mark = getMark(q);
                let badgeVariant: "default" | "destructive" | "secondary" = "secondary";
                if (mark === 4) badgeVariant = "default"; 
                if (mark === -1) badgeVariant = "destructive"; 
                
                return (
                <div key={q.id || `q-${index}`} id={`detail-q-${q.id}`} className="p-4 border rounded-lg bg-card shadow-sm scroll-mt-20"> {/* Added scroll-mt-20 for better scroll targetting */}
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
      </div>
    </div>
  );
}
