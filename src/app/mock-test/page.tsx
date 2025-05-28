
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/LoadingSpinner';
import TestInProgress from '@/components/TestInProgress';
import TestResultsDisplay from '@/components/TestResultsDisplay';
import { generateMockTest, type GenerateMockTestOutput } from '@/ai/flows/generate-mock-test';
import type { AppQuestion, TestResultItem, TestScore, StoredQuiz } from '@/types';
import { saveTestResult } from '@/lib/localStorageHelper';
import { saveGeneratedQuiz, getGeneratedQuiz, generateQuizId } from '@/lib/quizStorage';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlayCircle } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

const MOCK_TEST_DURATION_MINUTES = 50; 
const MOCK_TEST_NUM_QUESTIONS = 50; 
const MOCK_TEST_TITLE = "Mock Test (50 Questions)";

export default function MockTestPage() {
  const [testState, setTestState] = useState<'idle' | 'loading' | 'inProgress' | 'completed'>('idle');
  const [questions, setQuestions] = useState<AppQuestion[]>([]);
  const [currentOriginalQuizId, setCurrentOriginalQuizId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<TestResultItem | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  const transformAiQuestions = (aiOutput: GenerateMockTestOutput): AppQuestion[] => {
    return aiOutput.questions.map((q, index) => ({
      id: `mock-q-${Date.now()}-${index + 1}`, 
      subject: q.subject,
      questionText: q.question,
      options: q.options,
      correctAnswer: q.answer,
    }));
  };

  const startNewTest = async () => {
    setTestState('loading');
    try {
      const aiOutput = await generateMockTest({ numberOfQuestions: MOCK_TEST_NUM_QUESTIONS });
      if (aiOutput && aiOutput.questions.length > 0) {
        const transformedQuestions = transformAiQuestions(aiOutput);
        const newOriginalQuizId = generateQuizId('mock');
        
        const quizToStore: StoredQuiz = {
          id: newOriginalQuizId,
          testType: 'mock',
          questions: transformedQuestions,
          createdAt: new Date().toISOString(),
          title: MOCK_TEST_TITLE,
        };
        saveGeneratedQuiz(quizToStore); 

        setQuestions(transformedQuestions);
        setCurrentOriginalQuizId(newOriginalQuizId);
        setTestState('inProgress');
      } else {
        toast({ title: "Error", description: "Failed to generate mock test questions. Please try again.", variant: "destructive" });
        setTestState('idle');
      }
    } catch (error) {
      console.error("Error generating mock test:", error);
      toast({ title: "Error", description: "An error occurred while generating the test. Please try again.", variant: "destructive" });
      setTestState('idle');
    }
  };

  const startRetakeTest = useCallback((quizId: string) => {
    setTestState('loading');
    const storedQuiz = getGeneratedQuiz(quizId);
    if (storedQuiz && storedQuiz.testType === 'mock') {
      const questionsForRetake = storedQuiz.questions.map(q => ({ ...q, userAnswer: undefined }));
      setQuestions(questionsForRetake);
      setCurrentOriginalQuizId(storedQuiz.id);
      setTestState('inProgress');
    } else {
      toast({ title: "Error", description: "Could not find the test to retake or it's not a mock test.", variant: "destructive" });
      router.replace('/mock-test'); 
      setTestState('idle');
    }
  }, [router, toast]);

  useEffect(() => {
    const retakeQuizId = searchParams.get('retakeQuizId');
    if (retakeQuizId && testState === 'idle') { 
      startRetakeTest(retakeQuizId);
    }
  }, [searchParams, startRetakeTest, testState]);


  const handleSubmitTest = (userAnswers: Record<string, string>, originalQuizId: string, timeTakenSeconds: number) => {
    if (!currentOriginalQuizId) {
      toast({ title: "Error", description: "Cannot submit test without an original quiz ID.", variant: "destructive" });
      return;
    }

    const answeredQuestions = questions.map(q => ({
      ...q,
      userAnswer: userAnswers[q.id] || '',
    }));

    let correct = 0;
    let incorrect = 0;
    let unanswered = 0;

    answeredQuestions.forEach(q => {
      if (!q.userAnswer || q.userAnswer.trim() === "") {
        unanswered++;
      } else if (q.userAnswer.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()) {
        correct++;
      } else {
        incorrect++;
      }
    });

    const totalScore = (correct * 4) - (incorrect * 1);
    const maxScore = questions.length * 4;

    const score: TestScore = { correct, incorrect, unanswered, totalScore, maxScore };
    const resultData: TestResultItem = {
      testAttemptId: `mock-attempt-${Date.now()}`,
      originalQuizId: currentOriginalQuizId, // Use the state variable currentOriginalQuizId
      testType: 'mock',
      testTitle: MOCK_TEST_TITLE,
      dateCompleted: new Date().toISOString(),
      score,
      questions: answeredQuestions,
      timeTakenSeconds,
    };
    
    setTestResult(resultData);
    saveTestResult(resultData);
    setTestState('completed');
    toast({ title: "Test Submitted!", description: "Your mock test results are ready." });
  };

  if (testState === 'loading') {
     return <div className="flex items-center justify-center h-screen"><LoadingSpinner text="Preparing your mock test, please wait..." /></div>;
  }

  if (testState === 'inProgress' && currentOriginalQuizId) {
    return (
      <TestInProgress
        questions={questions}
        durationMinutes={MOCK_TEST_DURATION_MINUTES}
        onTestSubmit={handleSubmitTest}
        testType="mock"
        originalQuizId={currentOriginalQuizId}
      />
    );
  }

  if (testState === 'completed' && testResult) {
    return <TestResultsDisplay result={testResult} onNavigateHome={() => router.push('/')} />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
      <Card className="w-full max-w-lg text-center shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Mock Test Challenge</CardTitle>
          <CardDescription className="text-lg">
            This is a {MOCK_TEST_NUM_QUESTIONS}-MCQ mock test based on Class 11th &amp; 12th syllabus with a {MOCK_TEST_DURATION_MINUTES}-minute time limit.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-6 text-muted-foreground">
            Click the button below to begin. Good luck!
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={startNewTest} size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
            <PlayCircle className="mr-2 h-5 w-5" /> Start Mock Test
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
