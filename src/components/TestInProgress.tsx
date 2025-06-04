
"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { AppQuestion, PracticeTestConfig } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useTestTimer } from '@/hooks/useTestTimer';
import { ArrowLeft, ArrowRight, CheckCircle, X, Flag } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ScrollArea } from '@/components/ui/scroll-area';
import TestInProgressHeader from './TestInProgressHeader';
import TestInProgressSidebar from './TestInProgressSidebar';
import LoadingSpinner from './LoadingSpinner'; 

interface TestInProgressProps {
  questions: AppQuestion[];
  durationMinutes: number;
  onTestSubmit: (answers: Record<string, string>, originalQuizId: string, timeTakenSeconds: number) => void;
  testType: 'mock' | 'practice';
  originalQuizId: string; 
  practiceTestConfig?: { subject: string; chapter: string; };
}

interface SubjectSection {
  name: string;
  startIndex: number;
  endIndex: number;
  count: number;
}

export type QuestionStatus = 'answered' | 'notAnswered' | 'markedForReview' | 'markedAndAnswered' | 'notVisited';

const getQuestionStatusForSummary = (
  questionId: string,
  userAnswers: Record<string, string>,
  markedForReview: Set<string>,
  visitedQuestions: Set<string>
): QuestionStatus => {
  const isAnswered = !!userAnswers[questionId] && userAnswers[questionId] !== '';
  const isMarked = markedForReview.has(questionId);
  const isVisited = visitedQuestions.has(questionId);

  if (isAnswered && isMarked) return 'markedAndAnswered';
  if (isAnswered) return 'answered';
  if (isMarked) return 'markedForReview';
  if (isVisited) return 'notAnswered'; 
  return 'notVisited'; 
};


export default function TestInProgress({ 
  questions, 
  durationMinutes, 
  onTestSubmit, 
  testType,
  originalQuizId,
  practiceTestConfig
}: TestInProgressProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(new Set());
  const [visitedQuestions, setVisitedQuestions] = useState<Set<string>>(new Set());
  const [subjectSections, setSubjectSections] = useState<SubjectSection[]>([]);
  
  const onTimerExpiredSubmit = useCallback(() => {
    const timeTaken = durationMinutes * 60; 
    onTestSubmit(userAnswers, originalQuizId, timeTaken);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onTestSubmit, userAnswers, originalQuizId, durationMinutes]);

  const { minutes, seconds, isActive, startTimer, stopTimer, totalSecondsLeft } = useTestTimer(durationMinutes, onTimerExpiredSubmit);

  useEffect(() => {
    startTimer();
    setUserAnswers({});
    setMarkedForReview(new Set());
    setVisitedQuestions(new Set());
    setCurrentQuestionIndex(0);
    if (questions.length > 0 && questions[0]) {
      setVisitedQuestions(prev => new Set(prev).add(questions[0].id));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions]); 

  useEffect(() => {
    if (questions.length > 0) {
      const sections: SubjectSection[] = [];
      if (questions.length === 0) {
        setSubjectSections([]);
        return;
      }

      let currentSubjectName = questions[0].subject;
      let currentStartIndex = 0;
      for (let i = 1; i < questions.length; i++) {
        if (questions[i].subject !== currentSubjectName) {
          sections.push({
            name: currentSubjectName,
            startIndex: currentStartIndex,
            endIndex: i - 1,
            count: i - currentStartIndex,
          });
          currentSubjectName = questions[i].subject;
          currentStartIndex = i;
        }
      }
      sections.push({
        name: currentSubjectName,
        startIndex: currentStartIndex,
        endIndex: questions.length - 1,
        count: questions.length - currentStartIndex,
      });
      setSubjectSections(sections);
    } else {
      setSubjectSections([]);
    }
  }, [questions]);

  useEffect(() => {
    return () => stopTimer(); 
  }, [stopTimer]);

  useEffect(() => {
    if (questions.length > 0 && questions[currentQuestionIndex]) {
      setVisitedQuestions(prev => new Set(prev).add(questions[currentQuestionIndex].id));
    }
  }, [currentQuestionIndex, questions]);

  const currentQuestion = questions[currentQuestionIndex];

  const statusCounts = useMemo(() => {
    const counts: Record<QuestionStatus, number> = {
      answered: 0,
      notAnswered: 0,
      markedForReview: 0,
      markedAndAnswered: 0,
      notVisited: 0,
    };
    questions.forEach((q) => {
      const status = getQuestionStatusForSummary(q.id, userAnswers, markedForReview, visitedQuestions);
      counts[status]++;
    });
    return counts;
  }, [questions, userAnswers, markedForReview, visitedQuestions]);

  const handleAnswerChange = (questionId: string, answer: string) => {
    setUserAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const advanceQuestionLogic = (markCurrentFirst: boolean) => {
    if (!currentQuestion) return;

    if (markCurrentFirst) {
      setMarkedForReview(prev => {
        const newSet = new Set(prev);
        if (newSet.has(currentQuestion.id)) newSet.delete(currentQuestion.id);
        else newSet.add(currentQuestion.id);
        return newSet;
      });
    }

    if (currentQuestionIndex >= questions.length - 1) {
      return; 
    }

    if (subjectSections.length > 1) {
        const currentSection = subjectSections.find(
        s => currentQuestionIndex >= s.startIndex && currentQuestionIndex <= s.endIndex
      );

      if (currentSection && currentQuestionIndex === currentSection.endIndex) {
        const currentSectionGlobalIndex = subjectSections.findIndex(s => s.startIndex === currentSection.startIndex);
        if (currentSectionGlobalIndex < subjectSections.length - 1) {
          setCurrentQuestionIndex(subjectSections[currentSectionGlobalIndex + 1].startIndex);
          return;
        }
      }
    }
    setCurrentQuestionIndex(currentQuestionIndex + 1);
  };
  
  const handleSaveAndNext = () => {
    advanceQuestionLogic(false);
  };

  const handleMarkForReviewAndNext = () => {
    advanceQuestionLogic(true);
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
    const elapsedSeconds = (durationMinutes * 60) - totalSecondsLeft;
    onTestSubmit(userAnswers, originalQuizId, elapsedSeconds);
  };

  const handleClearResponse = () => {
    if(!currentQuestion) return;
    setUserAnswers(prev => {
      const newAnswers = { ...prev };
      delete newAnswers[currentQuestion.id];
      return newAnswers;
    });
  };
  
  if (!currentQuestion) {
    return <div className="flex items-center justify-center h-full"><LoadingSpinner text="Loading questions..." /></div>;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-var(--header-height,60px))]">
      <TestInProgressHeader 
        testType={testType}
        subject={practiceTestConfig?.subject}
        chapter={practiceTestConfig?.chapter}
        minutes={minutes}
        seconds={seconds}
        isActive={isActive}
        statusCounts={statusCounts}
      />
      <div className="flex flex-1 overflow-hidden"> 
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden p-4 md:p-6">
          
          {/* Question Number Display */}
          <div className="flex justify-between items-center mb-2 flex-shrink-0">
            <h2 className="text-lg font-semibold">Question No. {currentQuestionIndex + 1}</h2>
          </div>

          {/* Question Card - This will grow and its content will scroll if needed */}
          <Card className="shadow-md flex-grow overflow-hidden flex flex-col mb-4">
            {currentQuestion.subject && (
              <CardHeader className="py-3 px-4 border-b flex-shrink-0 sticky top-0 bg-card z-10">
                <CardDescription className="text-sm">Subject: {currentQuestion.subject}</CardDescription>
              </CardHeader>
            )}
            <ScrollArea className="flex-grow"> 
              <CardContent className="p-4 md:p-6"> 
                <p className="text-base md:text-lg font-medium leading-relaxed">{currentQuestion.questionText}</p>
                <RadioGroup
                  value={userAnswers[currentQuestion.id] || ''}
                  onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                  className="space-y-2 mt-3"
                >
                  {currentQuestion.options.map((option, index) => (
                    <div key={`${currentQuestion.id}-opt-${index}`} className="flex items-center space-x-2 p-2.5 border rounded-md hover:bg-muted/50 transition-colors">
                      <RadioGroupItem value={option} id={`${currentQuestion.id}-option-${index}`} />
                      <Label htmlFor={`${currentQuestion.id}-option-${index}`} className="flex-1 cursor-pointer text-sm md:text-base">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </ScrollArea>
          </Card>

          {/* Action buttons - Should always be visible */}
          <div className="flex-shrink-0 mt-auto flex flex-col sm:flex-row justify-between items-center gap-2 py-3">
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={goToPreviousQuestion} disabled={currentQuestionIndex === 0} size="sm">
                <ArrowLeft className="mr-1.5 h-4 w-4" /> Previous
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 justify-end">
              <Button variant="outline" onClick={handleClearResponse} size="sm">
                <X className="mr-1.5 h-4 w-4" /> Clear Response
              </Button>
              <Button variant="outline" onClick={handleMarkForReviewAndNext} title={markedForReview.has(currentQuestion.id) ? "Unmark for Review & Next" : "Mark for Review & Next"} size="sm">
                <Flag className="mr-1.5 h-4 w-4" /> {markedForReview.has(currentQuestion.id) ? "Unmark & Next" : "Mark & Next"}
              </Button>
              
              {currentQuestionIndex < questions.length - 1 ? (
                <Button onClick={handleSaveAndNext} className="bg-primary hover:bg-primary/90 text-primary-foreground" size="sm">
                  Save & Next <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleSubmitTest} className="bg-primary hover:bg-primary/90 text-primary-foreground" size="sm">
                  <CheckCircle className="mr-1.5 h-4 w-4" /> Submit Test
                </Button>
              )}
            </div>
          </div>

          {/* Timer Alerts - Should also be visible */}
          <div className="flex-shrink-0 text-center py-1">
            {totalSecondsLeft <= 60 && totalSecondsLeft > 0 && isActive && (
              <p className="text-sm text-destructive font-semibold">
                {totalSecondsLeft} seconds remaining!
              </p>
            )}
             {totalSecondsLeft === 0 && ( 
              <p className="text-sm text-destructive font-bold p-2 bg-destructive/10 rounded-md">
                Time's up!
              </p>
            )}
          </div>
        </div>
        
        <TestInProgressSidebar
          questions={questions}
          subjectSections={subjectSections}
          currentQuestionId={currentQuestion.id}
          currentQuestionIndex={currentQuestionIndex}
          userAnswers={userAnswers}
          markedForReview={markedForReview}
          visitedQuestions={visitedQuestions}
          onQuestionSelect={handleSelectQuestion}
          onSubmitTest={handleSubmitTest}
        />
      </div>
    </div>
  );
}
    