
"use client";

import { useState, useEffect, useCallback } from 'react';
import PracticeTestSetupForm from '@/components/PracticeTestSetupForm';
import LoadingSpinner from '@/components/LoadingSpinner';
import TestInProgress from '@/components/TestInProgress';
import TestResultsDisplay from '@/components/TestResultsDisplay';
import { generatePracticeQuestions, type GeneratePracticeQuestionsOutput } from '@/ai/flows/generate-practice-questions';
import type { AppQuestion, PracticeTestConfig, TestResultItem, TestScore, StoredQuiz } from '@/types';
import { saveTestResult, updateTestResult } from '@/lib/testHistoryStorage';
import { saveGeneratedQuiz, getGeneratedQuiz } from '@/lib/quizStorage';
import { generateQuizId } from '@/lib/quizUtils';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

const PRACTICE_TEST_MINUTES_PER_QUESTION = 2;

export default function PracticeTestPage() {
  const [testState, setTestState] = useState<'setup' | 'loading' | 'inProgress' | 'completed'>('setup');
  const [questions, setQuestions] = useState<AppQuestion[]>([]);
  const [currentTestConfig, setCurrentTestConfig] = useState<PracticeTestConfig | null>(null);
  const [currentOriginalQuizId, setCurrentOriginalQuizId] = useState<string | null>(null);
  const [currentAttemptToUpdateId, setCurrentAttemptToUpdateId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<TestResultItem | null>(null);
  const [durationMinutes, setDurationMinutes] = useState(0);

  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const getPracticeTestTitle = (config: PracticeTestConfig): string => {
    return `Practice: ${config.subject} - ${config.chapter} (${config.complexityLevel}, ${config.numberOfQuestions}Q)`;
  };

  const transformAiQuestions = (aiOutput: GeneratePracticeQuestionsOutput, config: PracticeTestConfig): AppQuestion[] => {
    return aiOutput.generatedMcqs.map((mcq, index) => ({
      id: `practice-q-${config.subject}-${config.chapter.replace(/\s+/g, '-')}-${Date.now()}-${index + 1}`,
      subject: config.subject,
      questionText: mcq.questionText,
      options: mcq.options,
      correctAnswer: mcq.correctAnswer,
    }));
  };

  const handleSetupSubmit = useCallback(async (config: PracticeTestConfig) => {
    setTestState('loading');
    setCurrentTestConfig(config);
    setCurrentAttemptToUpdateId(null); // Ensure it's a new test, not an update
    try {
      const aiOutput = await generatePracticeQuestions(config);
      if (aiOutput && aiOutput.generatedMcqs.length > 0) {
        const transformedQuestions = transformAiQuestions(aiOutput, config);
        const newOriginalQuizId = generateQuizId('practice', config.subject, config.chapter);
        const testTitle = getPracticeTestTitle(config);

        const quizToStore: StoredQuiz = {
          id: newOriginalQuizId,
          testType: 'practice',
          questions: transformedQuestions,
          config: config,
          createdAt: new Date().toISOString(),
          title: testTitle,
        };
        await saveGeneratedQuiz(quizToStore);

        setQuestions(transformedQuestions);
        setCurrentOriginalQuizId(newOriginalQuizId);
        setDurationMinutes(config.numberOfQuestions * PRACTICE_TEST_MINUTES_PER_QUESTION);
        setTestState('inProgress');
      } else {
        toast({ title: "Error Generating Test", description: "Failed to generate practice MCQs. The AI model might have returned an empty or invalid response.", variant: "destructive" });
        setTestState('setup');
      }
    } catch (error) {
      console.error("Error generating practice test:", error);
      let description = "An error occurred while generating the practice test.";
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
      toast({ 
        title: "Practice Test Generation Failed", 
        description: description, 
        variant: "destructive" 
      });
      setTestState('setup');
    }
  }, [toast]);
  
  const startRetakeTest = useCallback(async (quizId: string, attemptIdToUpdate?: string | null) => {
    setTestState('loading');
    if (attemptIdToUpdate) {
      setCurrentAttemptToUpdateId(attemptIdToUpdate);
    } else {
      setCurrentAttemptToUpdateId(null);
    }
    try {
      const storedQuiz = await getGeneratedQuiz(quizId);
      if (storedQuiz && storedQuiz.testType === 'practice' && storedQuiz.config) {
        const questionsForRetake = storedQuiz.questions.map(q => ({ ...q, userAnswer: undefined }));
        setQuestions(questionsForRetake);
        setCurrentTestConfig(storedQuiz.config);
        setCurrentOriginalQuizId(storedQuiz.id);
        setDurationMinutes(storedQuiz.config.numberOfQuestions * PRACTICE_TEST_MINUTES_PER_QUESTION);
        setTestState('inProgress');
      } else {
        toast({ title: "Error", description: "Could not find the practice test to retake or its configuration is missing.", variant: "destructive" });
        router.replace('/practice-test'); 
        setTestState('setup');
      }
    } catch (error) {
       console.error("Error retaking practice test:", error);
       let description = "Failed to load the test for retake.";
       if (error instanceof Error && error.message.toLowerCase().includes("failed to retrieve quiz from database")){
           description = "Could not load the test questions from the database. Please try again.";
       } else if (error instanceof Error) {
           description = `Details: ${error.message}`;
       }
       toast({ title: "Error Retaking Test", description: description, variant: "destructive" });
       router.replace('/practice-test');
       setTestState('setup');
    }
  }, [router, toast]);

  useEffect(() => {
    const retakeQuizId = searchParams.get('retakeQuizId');
    const attemptIdToUpdate = searchParams.get('attemptToUpdateId');
    if (retakeQuizId && testState === 'setup') { 
        startRetakeTest(retakeQuizId, attemptIdToUpdate);
    }
  }, [searchParams, startRetakeTest, testState]);


  const handleSubmitTest = async (userAnswers: Record<string, string>, originalQuizIdFromComponent: string, timeTakenSeconds: number) => {
    if (!currentTestConfig || !currentOriginalQuizId) {
        toast({ title: "Error Submitting Test", description: "Test configuration or ID is missing. Cannot submit.", variant: "destructive" });
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
    const testTitle = getPracticeTestTitle(currentTestConfig);

    const score: TestScore = { correct, incorrect, unanswered, totalScore, maxScore };
    const resultData: TestResultItem = {
      testAttemptId: isUpdate ? currentAttemptToUpdateId! : `practice-attempt-${Date.now()}-${Math.random().toString(36).substring(2,7)}`,
      originalQuizId: currentOriginalQuizId, 
      testType: 'practice',
      testTitle: testTitle,
      dateCompleted: new Date().toISOString(),
      score,
      questions: answeredQuestions,
      config: currentTestConfig,
      timeTakenSeconds,
    };
    
    try {
      if (isUpdate) {
        await updateTestResult(currentAttemptToUpdateId!, resultData);
        toast({ title: "Test Retake Submitted!", description: "Your practice test history has been updated." });
      } else {
        await saveTestResult(resultData);
        toast({ title: "Practice Test Submitted!", description: "Your results are ready." });
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
       console.error(`Error ${isUpdate ? 'updating' : 'saving'} practice test result:`, error);
       let toastTitle = isUpdate ? "Update Failed" : "Error Saving Result";
       let toastDescription = `Could not ${isUpdate ? 'update' : 'save'} your practice test result.`;
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
         setTestState('setup');
         router.push('/practice-test');
       }
    }
  };

  const handleNavigateToSetup = () => {
    setTestState('setup');
    setQuestions([]);
    setCurrentTestConfig(null);
    setCurrentOriginalQuizId(null);
    setCurrentAttemptToUpdateId(null);
    setTestResult(null);
    router.replace('/practice-test'); 
  };

  if (testState === 'loading') {
    return <div className="flex items-center justify-center h-screen"><LoadingSpinner text="Preparing your practice test..." /></div>;
  }

  if (testState === 'inProgress' && currentTestConfig && currentOriginalQuizId) {
    return (
      <TestInProgress
        questions={questions}
        durationMinutes={durationMinutes}
        onTestSubmit={handleSubmitTest}
        testType="practice"
        practiceTestConfig={{subject: currentTestConfig.subject, chapter: currentTestConfig.chapter }}
        originalQuizId={currentOriginalQuizId}
      />
    );
  }

  if (testState === 'completed' && testResult) {
     return <TestResultsDisplay result={testResult} onNavigateHome={() => router.push('/')} />;
  }

  // Default to setup form
  return (
    <div className="w-full max-w-2xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-center mb-8 text-primary">Create Practice MCQs</h1>
      <PracticeTestSetupForm onSubmit={handleSetupSubmit} isLoading={testState === 'loading'} />
    </div>
  );
}

    
