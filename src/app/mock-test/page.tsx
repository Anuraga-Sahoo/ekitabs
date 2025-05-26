
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/LoadingSpinner';
import TestInProgress from '@/components/TestInProgress';
import TestResultsDisplay from '@/components/TestResultsDisplay';
import { generateMockTest, type GenerateMockTestOutput } from '@/ai/flows/generate-mock-test';
import type { AppQuestion, TestResultItem, TestScore } from '@/types';
import { saveTestResult } from '@/lib/localStorageHelper';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlayCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';


const MOCK_TEST_DURATION_MINUTES = 180; // 3 hours
const MOCK_TEST_NUM_QUESTIONS = 180; // Updated to 180 questions

export default function MockTestPage() {
  const [testState, setTestState] = useState<'idle' | 'loading' | 'inProgress' | 'completed'>('idle');
  const [questions, setQuestions] = useState<AppQuestion[]>([]);
  const [testResult, setTestResult] = useState<TestResultItem | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const transformAiQuestions = (aiOutput: GenerateMockTestOutput): AppQuestion[] => {
    return aiOutput.questions.map((q, index) => ({
      id: `mock-${index + 1}`,
      subject: q.subject,
      questionText: q.question,
      options: q.options,
      correctAnswer: q.answer,
    }));
  };

  const startTest = async () => {
    setTestState('loading');
    try {
      const aiOutput = await generateMockTest({ numberOfQuestions: MOCK_TEST_NUM_QUESTIONS });
      if (aiOutput && aiOutput.questions.length > 0) {
        setQuestions(transformAiQuestions(aiOutput));
        setTestState('inProgress');
      } else {
        toast({ title: "Error", description: "Failed to generate mock test questions.", variant: "destructive" });
        setTestState('idle');
      }
    } catch (error) {
      console.error("Error generating mock test:", error);
      toast({ title: "Error", description: "An error occurred while generating the test.", variant: "destructive" });
      setTestState('idle');
    }
  };

  const handleSubmitTest = (userAnswers: Record<string, string>) => {
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
      testId: `mock-${Date.now()}`,
      testType: 'mock',
      dateCompleted: new Date().toISOString(),
      score,
      questions: answeredQuestions,
    };
    
    setTestResult(resultData);
    saveTestResult(resultData);
    setTestState('completed');
    toast({ title: "Test Submitted!", description: "Your mock test results are ready." });
  };

  if (testState === 'loading') {
    return <LoadingSpinner text="Generating your mock test, please wait..." />;
  }

  if (testState === 'inProgress') {
    return (
      <TestInProgress
        questions={questions}
        durationMinutes={MOCK_TEST_DURATION_MINUTES}
        onTestSubmit={handleSubmitTest}
        testType="mock"
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
            Ready to test your knowledge? This is a {MOCK_TEST_NUM_QUESTIONS}-MCQ mock test based on Class 11th &amp; 12th syllabus with a {MOCK_TEST_DURATION_MINUTES / 60}-hour time limit.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-6 text-muted-foreground">
            Click the button below to begin. Good luck!
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={startTest} size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
            <PlayCircle className="mr-2 h-5 w-5" /> Start Mock Test
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
