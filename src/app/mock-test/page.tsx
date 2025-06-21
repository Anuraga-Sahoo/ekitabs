
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/LoadingSpinner';
import TestInProgress from '@/components/TestInProgress';
import TestResultsDisplay from '@/components/TestResultsDisplay';
import type { AppQuestion, TestResultItem, TestScore, FullQuizDetails, QuizSectionMongo } from '@/types';
import { saveTestResult, updateTestResult } from '@/lib/testHistoryStorage';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlayCircle } from 'lucide-react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

const transformQuizToAppQuestions = (quizData: FullQuizDetails): AppQuestion[] => {
    if (!quizData || !quizData.sections) return [];

    const allQuestions: AppQuestion[] = [];
    quizData.sections.forEach((section: QuizSectionMongo) => {
        section.questions.forEach(q => {
            const correctAnswer = q.options.find(opt => opt.isCorrect)?.text || "";
            allQuestions.push({
                id: q.id,
                subject: section.name,
                questionText: q.text,
                options: q.options.map(opt => opt.text),
                correctAnswer: correctAnswer,
                explanation: q.explanation
            });
        });
    });
    return allQuestions;
};

export default function MockTestPage() {
    const [testState, setTestState] = useState<'idle' | 'loading' | 'inProgress' | 'completed'>('idle');
    const [questions, setQuestions] = useState<AppQuestion[]>([]);
    const [testResult, setTestResult] = useState<TestResultItem | null>(null);
    const [currentQuizDetails, setCurrentQuizDetails] = useState<FullQuizDetails | null>(null);
    const [currentAttemptToUpdateId, setCurrentAttemptToUpdateId] = useState<string | null>(null);

    const { toast } = useToast();
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const startTest = useCallback(async (quizId: string, attemptIdToUpdate?: string | null) => {
        setTestState('loading');
        if (attemptIdToUpdate) {
            setCurrentAttemptToUpdateId(attemptIdToUpdate);
        } else {
            setCurrentAttemptToUpdateId(null);
        }

        try {
            const response = await fetch(`/api/quiz/${quizId}`);
            if (!response.ok) {
                if (response.status === 504) {
                    throw new Error("The server took too long to respond (Gateway Timeout). This might be a temporary issue. Please try again in a few moments.");
                }
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Failed to fetch test data. Status: ${response.status}`);
            }
            const quizData: FullQuizDetails = await response.json();
            
            const transformedQuestions = transformQuizToAppQuestions(quizData);
            if (transformedQuestions.length === 0) {
                throw new Error("This test has no questions.");
            }

            setQuestions(transformedQuestions);
            setCurrentQuizDetails(quizData);
            setTestState('inProgress');

        } catch (error) {
            console.error("Error starting test:", error);
            const description = error instanceof Error ? error.message : "An unknown error occurred.";
            toast({ title: "Could Not Start Test", description, variant: "destructive" });
            router.replace('/dashboard');
        }
    }, [router, toast]);

    useEffect(() => {
        const quizId = searchParams.get('quizId');
        const attemptIdToUpdate = searchParams.get('attemptToUpdateId'); // For retakes

        if (quizId) {
            startTest(quizId, attemptIdToUpdate);
        } else if (testState !== 'completed') {
            setTestState('idle');
        }
    }, [searchParams, startTest, testState]);

    const handleSubmitTest = async (userAnswers: Record<string, string>, originalQuizId: string, timeTakenSeconds: number) => {
        if (!currentQuizDetails) {
            toast({ title: "Error", description: "Cannot submit test without quiz details.", variant: "destructive" });
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
        let maxScore = 0;
        let totalScore = 0;

        // Find original marks from fetched quiz details
        const questionMarksMap = new Map<string, { marks: number, negativeMarks: number }>();
        currentQuizDetails.sections.forEach(sec => {
            sec.questions.forEach(q => {
                questionMarksMap.set(q.id, { marks: q.marks, negativeMarks: q.negativeMarks });
                maxScore += q.marks;
            });
        });

        answeredQuestions.forEach(q => {
            const marksInfo = questionMarksMap.get(q.id);
            if (!marksInfo) return;

            if (!q.userAnswer || q.userAnswer.trim() === "") {
                unanswered++;
            } else if (q.userAnswer.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()) {
                correct++;
                totalScore += marksInfo.marks;
            } else {
                incorrect++;
                totalScore -= marksInfo.negativeMarks;
            }
        });

        const score: TestScore = { correct, incorrect, unanswered, totalScore, maxScore };
        const resultData: TestResultItem = {
            testAttemptId: isUpdate ? currentAttemptToUpdateId! : `mock-attempt-${Date.now()}`,
            originalQuizId: currentQuizDetails._id,
            testType: 'mock',
            testTitle: currentQuizDetails.title,
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
            toast({ title: "Submission Error", description: `Could not ${isUpdate ? 'update' : 'save'} your test result.`, variant: "destructive" });
            setTestResult(resultData);
            setTestState('completed');
        }
    };

    if (testState === 'loading') {
        return <div className="flex items-center justify-center h-screen"><LoadingSpinner text="Preparing your mock test, please wait..." /></div>;
    }

    if (testState === 'inProgress' && currentQuizDetails) {
        return (
            <TestInProgress
                questions={questions}
                durationMinutes={currentQuizDetails.timerMinutes || 180}
                onTestSubmit={handleSubmitTest}
                testType="mock"
                originalQuizId={currentQuizDetails._id}
            />
        );
    }

    if (testState === 'completed' && testResult) {
        return <TestResultsDisplay result={testResult} />;
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <Card className="w-full max-w-lg text-center shadow-xl">
                <CardHeader>
                    <CardTitle className="text-3xl font-bold">Mock Test</CardTitle>
                    <CardDescription className="text-lg">
                        Please select a mock test from the dashboard to begin.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="mb-6 text-muted-foreground">
                        Ready to test your knowledge? Head over to the dashboard to find available mock tests.
                    </p>
                </CardContent>
                <CardFooter>
                    <Button onClick={() => router.push('/dashboard')} size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                        <PlayCircle className="mr-2 h-5 w-5" /> Go to Dashboard
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
