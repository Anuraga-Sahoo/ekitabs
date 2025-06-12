
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/LoadingSpinner';
import TestInProgress from '@/components/TestInProgress';
import TestResultsDisplay from '@/components/TestResultsDisplay';
import { generateMockTest, type GenerateMockTestOutput } from '@/ai/flows/generate-mock-test';
import type { AppQuestion, TestResultItem, TestScore, StoredQuiz } from '@/types';
import { saveTestResult, updateTestResult } from '@/lib/testHistoryStorage';
import { saveGeneratedQuiz, getGeneratedQuiz } from '@/lib/quizStorage';
import { generateQuizId } from '@/lib/quizUtils';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlayCircle } from 'lucide-react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

const MOCK_TEST_DURATION_MINUTES = 25; // 50 questions * 0.5 min/question
const MOCK_TEST_NUM_QUESTIONS = 50; 
const MOCK_TEST_TITLE = "Mock Test (50 Questions)";

export default function MockTestPage() {
  const [testState, setTestState] = useState<'idle' | 'loading' | 'inProgress' | 'completed'>('idle');
  const [questions, setQuestions] = useState<AppQuestion[]>([]);
  const [currentOriginalQuizId, setCurrentOriginalQuizId] = useState<string | null>(null);
  const [currentAttemptToUpdateId, setCurrentAttemptToUpdateId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<TestResultItem | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

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
    setCurrentAttemptToUpdateId(null); 
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
        await saveGeneratedQuiz(quizToStore);

        setQuestions(transformedQuestions);
        setCurrentOriginalQuizId(newOriginalQuizId);
        setTestState('inProgress');
      } else {
        toast({ title: "Error Generating Test", description: "Failed to generate mock test questions. The AI model might have returned an empty response. Please try again.", variant: "destructive" });
        setTestState('idle');
      }
    } catch (error) {
      console.error("Error generating mock test:", error);
      let description = "An error occurred while generating the test. Please try again.";
      if (error instanceof Error) {
        if (error.message.includes("503") || error.message.toLowerCase().includes("model is overloaded")) {
          description = "The AI model is currently overloaded. Please try again in a few moments.";
        } else if (error.message.toLowerCase().includes("failed to save quiz to database")) {
           if (error.message.toLowerCase().includes("authentication failed")) {
            description = "Could not save the generated test to the database due to an authentication issue. Please check your MONGODB_URI and database user permissions.";
          } else {
            description = "Could not save the generated test to the database. Please check your connection and try again.";
          }
        } else {
          description = `Details: ${error.message}`;
        }
      }
      toast({ title: "Mock Test Generation Failed", description, variant: "destructive" });
      setTestState('idle');
    }
  };

  const startRetakeTest = useCallback(async (quizId: string, attemptIdToUpdate?: string | null) => {
    setTestState('loading');
    if (attemptIdToUpdate) {
      setCurrentAttemptToUpdateId(attemptIdToUpdate);
    } else {
      setCurrentAttemptToUpdateId(null);
    }
    try {
      const storedQuiz = await getGeneratedQuiz(quizId);
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
    } catch (error) {
      console.error("Error retaking mock test:", error);
      let description = "An error occurred while trying to retake the test.";
       if (error instanceof Error && error.message.toLowerCase().includes("failed to retrieve quiz from database")){
           description = "Could not load the test questions from the database. Please try again.";
       } else if (error instanceof Error) {
           description = `Details: ${error.message}`;
       }
      toast({ title: "Error Retaking Test", description, variant: "destructive" });
      router.replace('/mock-test');
      setTestState('idle');
    }
  }, [router, toast]);

  useEffect(() => {
    const retakeQuizId = searchParams.get('retakeQuizId');
    const attemptIdToUpdate = searchParams.get('attemptToUpdateId');
    if (retakeQuizId && testState === 'idle') {
      startRetakeTest(retakeQuizId, attemptIdToUpdate);
    }
  }, [searchParams, startRetakeTest, testState]);


  const handleSubmitTest = async (userAnswers: Record<string, string>, originalQuizIdFromComponent: string, timeTakenSeconds: number) => {
    if (!currentOriginalQuizId) {
      toast({ title: "Error", description: "Cannot submit test without an original quiz ID.", variant: "destructive" });
      return;
    }
    const isUpdate = !!currentAttemptToUpdateId;

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
      testAttemptId: isUpdate ? currentAttemptToUpdateId! : `mock-attempt-${Date.now()}-${Math.random().toString(36).substring(2,7)}`,
      originalQuizId: currentOriginalQuizId,
      testType: 'mock',
      testTitle: MOCK_TEST_TITLE, 
      dateCompleted: new Date().toISOString(),
      score,
      questions: answeredQuestions,
      timeTakenSeconds,
    };

    try {
      if (isUpdate) {
        await updateTestResult(currentAttemptToUpdateId!, resultData);
        toast({ title: "Test Retake Submitted!", description: "Your mock test history has been updated." });
      } else {
        await saveTestResult(resultData);
        toast({ title: "Test Submitted!", description: "Your mock test results are ready." });
      }
      setTestResult(resultData);
      setTestState('completed');

      if (isUpdate) {
        setCurrentAttemptToUpdateId(null);
        const newSearchParams = new URLSearchParams(searchParams.toString());
        newSearchParams.delete('attemptToUpdateId');
        router.replace(`${pathname}?${newSearchParams.toString()}`, { scroll: false });
      }

    } catch (error) {
      console.error(`Error ${isUpdate ? 'updating' : 'saving'} test result:`, error);
      let toastTitle = isUpdate ? "Update Failed" : "Error Saving Result";
      let toastDescription = `Could not ${isUpdate ? 'update' : 'save'} your test result.`;
      let shouldShowResults = !isUpdate; 

      if (error instanceof Error) {
        toastDescription = error.message;
        if (error.message.startsWith("Test history entry with ID")) {
             toastDescription = "The original test entry to update was not found. It may have been deleted. Your current attempt was not saved.";
             shouldShowResults = false;
        } else if (isUpdate) { 
            shouldShowResults = true;
        }
      }

      toast({ title: toastTitle, description: toastDescription, variant: "destructive" });

      if (shouldShowResults) {
        setTestResult(resultData); 
        setTestState('completed');
      } else {
        setCurrentAttemptToUpdateId(null);
        setTestState('idle');
        router.push('/test-history');
      }
    }
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
    return <TestResultsDisplay result={testResult} />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
      <Card className="w-full max-w-lg text-center shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Mock Test Challenge</CardTitle>
          <CardDescription className="text-lg">
            This is a {MOCK_TEST_NUM_QUESTIONS}-MCQ mock test based on Class 11th &amp; 12th syllabus with a {MOCK_TEST_DURATION_MINUTES}-minute time limit.
            The test includes 12 Physics, 13 Chemistry, and 25 Biology questions.
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
