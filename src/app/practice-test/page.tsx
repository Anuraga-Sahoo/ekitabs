
"use client";

import { useState, useEffect, useCallback } from 'react';
import PracticeTestSetupForm from '@/components/PracticeTestSetupForm';
import LoadingSpinner from '@/components/LoadingSpinner';
import TestInProgress from '@/components/TestInProgress';
import TestResultsDisplay from '@/components/TestResultsDisplay';
import { generatePracticeQuestions, type GeneratePracticeQuestionsOutput } from '@/ai/flows/generate-practice-questions';
import type { AppQuestion, PracticeTestConfig, TestResultItem, TestScore, StoredQuiz } from '@/types';
import { saveTestResult } from '@/lib/localStorageHelper';
import { saveGeneratedQuiz, getGeneratedQuiz, generateQuizId } from '@/lib/quizStorage';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useSearchParams } from 'next/navigation';

const PRACTICE_TEST_MINUTES_PER_QUESTION = 2;

export default function PracticeTestPage() {
  const [testState, setTestState] = useState<'setup' | 'loading' | 'inProgress' | 'completed'>('setup');
  const [questions, setQuestions] = useState<AppQuestion[]>([]);
  const [currentTestConfig, setCurrentTestConfig] = useState<PracticeTestConfig | null>(null);
  const [currentOriginalQuizId, setCurrentOriginalQuizId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<TestResultItem | null>(null);
  const [durationMinutes, setDurationMinutes] = useState(0);

  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

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

  const handleSetupSubmit = async (config: PracticeTestConfig) => {
    setTestState('loading');
    setCurrentTestConfig(config);
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
        saveGeneratedQuiz(quizToStore);

        setQuestions(transformedQuestions);
        setCurrentOriginalQuizId(newOriginalQuizId);
        setDurationMinutes(config.numberOfQuestions * PRACTICE_TEST_MINUTES_PER_QUESTION);
        setTestState('inProgress');
      } else {
        toast({ title: "Error", description: "Failed to generate practice MCQs.", variant: "destructive" });
        setTestState('setup');
      }
    } catch (error) {
      console.error("Error generating practice test:", error);
      toast({ title: "Error", description: "An error occurred while generating the practice test.", variant: "destructive" });
      setTestState('setup');
    }
  };
  
  const startRetakeTest = useCallback((quizId: string) => {
    setTestState('loading');
    const storedQuiz = getGeneratedQuiz(quizId);
    if (storedQuiz && storedQuiz.testType === 'practice' && storedQuiz.config) {
      const questionsForRetake = storedQuiz.questions.map(q => ({ ...q, userAnswer: undefined }));
      setQuestions(questionsForRetake);
      setCurrentTestConfig(storedQuiz.config);
      setCurrentOriginalQuizId(storedQuiz.id);
      setDurationMinutes(storedQuiz.config.numberOfQuestions * PRACTICE_TEST_MINUTES_PER_QUESTION);
      setTestState('inProgress');
    } else {
      toast({ title: "Error", description: "Could not find the practice test to retake or its configuration is missing.", variant: "destructive" });
      router.replace('/practice-test'); // Clear query params
      setTestState('setup');
    }
  }, [router, toast]);

  useEffect(() => {
    const retakeQuizId = searchParams.get('retakeQuizId');
    if (retakeQuizId && testState === 'setup') { // Only process if in setup state
        startRetakeTest(retakeQuizId);
    }
  }, [searchParams, startRetakeTest, testState]);

  const handleSubmitTest = (userAnswers: Record<string, string>) => {
    if (!currentTestConfig || !currentOriginalQuizId) {
        toast({ title: "Error", description: "Test configuration or ID is missing.", variant: "destructive" });
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
    const testTitle = getPracticeTestTitle(currentTestConfig);

    const score: TestScore = { correct, incorrect, unanswered, totalScore, maxScore };
    const resultData: TestResultItem = {
      testAttemptId: `practice-attempt-${Date.now()}`,
      originalQuizId: currentOriginalQuizId,
      testType: 'practice',
      testTitle: testTitle,
      dateCompleted: new Date().toISOString(),
      score,
      questions: answeredQuestions,
      config: currentTestConfig,
    };
    
    setTestResult(resultData);
    saveTestResult(resultData);
    setTestState('completed');
    toast({ title: "Practice Test Submitted!", description: "Your results are ready." });
  };

  const handleNavigateToSetup = () => {
    setTestState('setup');
    setQuestions([]);
    setCurrentTestConfig(null);
    setCurrentOriginalQuizId(null);
    setTestResult(null);
    router.replace('/practice-test'); // Clear query params
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
