
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { AppQuestion } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'; // Keep Card for question box
import { useTestTimer } from '@/hooks/useTestTimer';
import { ArrowLeft, ArrowRight, CheckCircle, RotateCcw, X, Flag } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ScrollArea } from '@/components/ui/scroll-area';
import TestInProgressHeader from './TestInProgressHeader';
import TestInProgressSidebar from './TestInProgressSidebar';
import { cn } from '@/lib/utils';


interface TestInProgressProps {
  questions: AppQuestion[];
  durationMinutes: number;
  onTestSubmit: (answers: Record<string, string>) => void;
  testType: 'mock' | 'practice';
  practiceTestConfig?: { subject: string; chapter: string; }; // For practice test header
}

export default function TestInProgress({ 
  questions, 
  durationMinutes, 
  onTestSubmit, 
  testType,
  practiceTestConfig
}: TestInProgressProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(new Set());
  const [visitedQuestions, setVisitedQuestions] = useState<Set<string>>(new Set());
  
  const handleTimerEnd = useCallback(() => {
    onTestSubmit(userAnswers);
  }, [onTestSubmit, userAnswers]);

  const { minutes, seconds, isActive, startTimer, stopTimer, totalSecondsLeft } = useTestTimer(durationMinutes, handleTimerEnd);

  useEffect(() => {
    startTimer();
    return () => stopTimer();
  }, [startTimer, stopTimer]);

  useEffect(() => {
    if (questions.length > 0 && questions[currentQuestionIndex]) {
      setVisitedQuestions(prev => new Set(prev).add(questions[currentQuestionIndex].id));
    }
  }, [currentQuestionIndex, questions]);

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerChange = (questionId: string, answer: string) => {
    setUserAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  
  const handleSelectQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const handleSubmitTest = () => {
    stopTimer();
    onTestSubmit(userAnswers);
  };

  const handleMarkForReviewAndNext = () => {
    setMarkedForReview(prev => {
      const newSet = new Set(prev);
      // Toggle mark for review for current question. Image implies "Mark for Review & Next" always marks.
      // If you want toggle behavior:
      // if (newSet.has(currentQuestion.id)) {
      //   newSet.delete(currentQuestion.id);
      // } else {
      //   newSet.add(currentQuestion.id);
      // }
      // For now, it always marks and moves next:
      newSet.add(currentQuestion.id);
      return newSet;
    });
    if (currentQuestionIndex < questions.length - 1) {
      goToNextQuestion();
    } else {
      // If it's the last question, and they mark for review & next, perhaps don't auto-submit.
      // Or maybe they should be prompted. For now, it will just stay on the last question.
    }
  };

  const handleClearResponse = () => {
    setUserAnswers(prev => {
      const newAnswers = { ...prev };
      delete newAnswers[currentQuestion.id];
      return newAnswers;
    });
  };
  
  if (!currentQuestion) {
    // This case should ideally be handled by the parent page if questions array is empty.
    return <p className="text-center py-10">Loading questions or no questions available...</p>;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-var(--header-height,80px))]"> {/* Adjust 80px based on actual root header height */}
      <TestInProgressHeader 
        testType={testType}
        subject={practiceTestConfig?.subject}
        chapter={practiceTestConfig?.chapter}
        minutes={minutes}
        seconds={seconds}
        isActive={isActive}
      />
      <div className="flex flex-1 overflow-hidden">
        <ScrollArea className="flex-1 p-4 md:p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold">Question No. {currentQuestionIndex + 1}</h2>
                {/* Placeholder for Marks, Time spent on Q, Report - Omitted for now */}
            </div>
            <Card className="shadow-md">
              <CardHeader>
                {currentQuestion.subject && <CardDescription className="text-sm">Subject: {currentQuestion.subject}</CardDescription>}
              </CardHeader>
              <CardContent>
                <p className="text-base md:text-lg font-medium leading-relaxed py-2 min-h-[50px]">{currentQuestion.questionText}</p>
                <RadioGroup
                  value={userAnswers[currentQuestion.id] || ''}
                  onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                  className="space-y-2 mt-4"
                >
                  {currentQuestion.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 border rounded-md hover:bg-muted/50 transition-colors">
                      <RadioGroupItem value={option} id={`${currentQuestion.id}-option-${index}`} />
                      <Label htmlFor={`${currentQuestion.id}-option-${index}`} className="flex-1 cursor-pointer text-sm md:text-base">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>

            {totalSecondsLeft <= 60 && totalSecondsLeft > 0 && isActive && (
              <p className="text-center text-destructive font-semibold">
                {totalSecondsLeft} seconds remaining!
              </p>
            )}
            {totalSecondsLeft === 0 && !isActive && (
              <p className="text-center text-destructive font-bold text-lg p-4 bg-destructive/10 rounded-md">
                Time's up! Your test has been submitted.
              </p>
            )}
          </div>
        </ScrollArea>
        
        <TestInProgressSidebar
          questions={questions}
          currentQuestionId={currentQuestion.id}
          userAnswers={userAnswers}
          markedForReview={markedForReview}
          visitedQuestions={visitedQuestions}
          onQuestionSelect={handleSelectQuestion}
          onSubmitTest={handleSubmitTest}
        />
      </div>
      <div className="flex items-center justify-between p-3 border-t bg-card sticky bottom-0 z-10">
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleMarkForReviewAndNext}>
              <Flag className="mr-2 h-4 w-4" /> Mark for Review & Next
            </Button>
            <Button variant="outline" onClick={handleClearResponse}>
              <X className="mr-2 h-4 w-4" /> Clear Response
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={goToPreviousQuestion} disabled={currentQuestionIndex === 0}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Previous
            </Button>
            
            {currentQuestionIndex < questions.length - 1 ? (
              <Button onClick={goToNextQuestion} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                Save & Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmitTest} className="bg-green-600 hover:bg-green-700 text-white">
                <CheckCircle className="mr-2 h-4 w-4" /> Submit Test
              </Button>
            )}
          </div>
        </div>
    </div>
  );
}

