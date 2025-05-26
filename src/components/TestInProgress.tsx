
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { AppQuestion } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import TimerDisplay from './TimerDisplay';
import { useTestTimer } from '@/hooks/useTestTimer';
import { ArrowLeft, ArrowRight, CheckCircle, Save } from 'lucide-react';

interface TestInProgressProps {
  questions: AppQuestion[];
  durationMinutes: number;
  onTestSubmit: (answers: Record<string, string>) => void;
  testType: 'mock' | 'practice';
}

export default function TestInProgress({ questions, durationMinutes, onTestSubmit, testType }: TestInProgressProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  
  const handleTimerEnd = useCallback(() => {
    onTestSubmit(userAnswers);
  }, [onTestSubmit, userAnswers]);

  const { minutes, seconds, isActive, startTimer, stopTimer, totalSecondsLeft } = useTestTimer(durationMinutes, handleTimerEnd);

  useEffect(() => {
    startTimer();
    return () => stopTimer();
  }, [startTimer, stopTimer]);

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

  const handleSubmitTest = () => {
    stopTimer();
    onTestSubmit(userAnswers);
  };
  
  if (!currentQuestion) {
    return <p>No questions available.</p>; // Or a loading/error state
  }

  const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="space-y-6">
      <Card className="shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl">
              {testType === 'mock' ? 'Mock Test' : 'Practice Test'} - Question {currentQuestionIndex + 1} of {questions.length}
            </CardTitle>
            {currentQuestion.subject && <CardDescription>Subject: {currentQuestion.subject}</CardDescription>}
          </div>
          <TimerDisplay minutes={minutes} seconds={seconds} isActive={isActive} />
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={progressPercentage} className="w-full h-2" />
          <p className="text-lg font-semibold leading-relaxed py-4 min-h-[60px]">{currentQuestion.questionText}</p>
          <Textarea
            placeholder="Type your answer here..."
            value={userAnswers[currentQuestion.id] || ''}
            onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
            rows={5}
            className="resize-none text-base"
          />
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <Button variant="outline" onClick={goToPreviousQuestion} disabled={currentQuestionIndex === 0}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          
          {currentQuestionIndex === questions.length - 1 ? (
            <Button onClick={handleSubmitTest} className="bg-green-600 hover:bg-green-700 text-white">
              <CheckCircle className="mr-2 h-4 w-4" /> Submit Test
            </Button>
          ) : (
            <Button onClick={goToNextQuestion} variant="default">
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </CardFooter>
      </Card>
      {totalSecondsLeft <= 60 && isActive && (
         <p className="text-center text-destructive font-semibold">
           {totalSecondsLeft} seconds remaining!
         </p>
      )}
       {totalSecondsLeft === 0 && !isActive && (
         <p className="text-center text-destructive font-bold text-lg p-4 bg-destructive/10 rounded-md">
           Time's up! Your test will be submitted automatically.
         </p>
      )}
    </div>
  );
}
