
"use client";

import { useState } from 'react';
import PracticeTestSetupForm from '@/components/PracticeTestSetupForm';
import LoadingSpinner from '@/components/LoadingSpinner';
import TestInProgress from '@/components/TestInProgress';
import TestResultsDisplay from '@/components/TestResultsDisplay';
import { generatePracticeQuestions, type GeneratePracticeQuestionsOutput } from '@/ai/flows/generate-practice-questions';
import type { AppQuestion, PracticeTestConfig, TestResultItem, TestScore } from '@/types';
import { saveTestResult } from '@/lib/localStorageHelper';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';


// Practice tests are shorter, e.g., 2 minutes per question on average
const PRACTICE_TEST_MINUTES_PER_QUESTION = 2;

export default function PracticeTestPage() {
  const [testState, setTestState] = useState<'setup' | 'loading' | 'inProgress' | 'completed'>('setup');
  const [questions, setQuestions] = useState<AppQuestion[]>([]);
  const [currentTestConfig, setCurrentTestConfig] = useState<PracticeTestConfig | null>(null);
  const [testResult, setTestResult] = useState<TestResultItem | null>(null);
  const [durationMinutes, setDurationMinutes] = useState(0);

  const { toast } = useToast();
  const router = useRouter();

  const transformAiQuestions = (aiOutput: GeneratePracticeQuestionsOutput, config: PracticeTestConfig): AppQuestion[] => {
    return aiOutput.generatedMcqs.map((mcq, index) => ({
      id: `practice-${config.subject}-${config.chapter.replace(/\s+/g, '-')}-${index + 1}`, // make id more unique
      subject: config.subject, // This should come from the config
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
        setQuestions(transformAiQuestions(aiOutput, config));
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

  const handleSubmitTest = (userAnswers: Record<string, string>) => {
    if (!currentTestConfig) return;

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
      testId: `practice-${Date.now()}`,
      testType: 'practice',
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

  const handleRetake = () => {
    setTestState('setup');
    setQuestions([]);
    setCurrentTestConfig(null);
    setTestResult(null);
  };


  if (testState === 'loading') {
    return <div className="flex items-center justify-center h-screen"><LoadingSpinner text="Generating your practice test..." /></div>;
  }

  if (testState === 'inProgress' && currentTestConfig) {
    return (
      <TestInProgress
        questions={questions}
        durationMinutes={durationMinutes}
        onTestSubmit={handleSubmitTest}
        testType="practice"
        practiceTestConfig={{subject: currentTestConfig.subject, chapter: currentTestConfig.chapter }}
      />
    );
  }

  if (testState === 'completed' && testResult) {
    return <TestResultsDisplay result={testResult} onRetake={handleRetake} onNavigateHome={() => router.push('/')} />;
  }

  return (
    <div className="w-full max-w-2xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-center mb-8 text-primary">Create Practice MCQs</h1>
      <PracticeTestSetupForm onSubmit={handleSetupSubmit} isLoading={testState === 'loading'} />
    </div>
  );
}

