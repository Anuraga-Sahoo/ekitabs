
"use client";

import type { AppQuestion } from '@/types';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCircle, Circle, CheckCircle, XCircle, AlertCircle, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';

export type QuestionStatus = 'answered' | 'notAnswered' | 'markedForReview' | 'markedAndAnswered' | 'notVisited';

interface QuestionPaletteState {
  status: QuestionStatus;
  isCurrent: boolean;
}

interface TestInProgressSidebarProps {
  questions: AppQuestion[];
  currentQuestionId: string;
  userAnswers: Record<string, string>;
  markedForReview: Set<string>;
  visitedQuestions: Set<string>;
  onQuestionSelect: (index: number) => void;
  onSubmitTest: () => void;
  studentName?: string;
}

export default function TestInProgressSidebar({
  questions,
  currentQuestionId,
  userAnswers,
  markedForReview,
  visitedQuestions,
  onQuestionSelect,
  onSubmitTest,
  studentName = "Test Taker"
}: TestInProgressSidebarProps) {

  const getQuestionState = (questionId: string): QuestionPaletteState => {
    const isCurrent = questionId === currentQuestionId;
    const isAnswered = !!userAnswers[questionId] && userAnswers[questionId] !== '';
    const isMarked = markedForReview.has(questionId);
    const isVisited = visitedQuestions.has(questionId);

    let status: QuestionStatus;
    if (isAnswered && isMarked) status = 'markedAndAnswered';
    else if (isAnswered) status = 'answered'; // Answered and not marked
    else if (isMarked) status = 'markedForReview'; // Marked and not answered
    else if (isVisited) status = 'notAnswered'; // Visited, not answered, not marked
    else status = 'notVisited';
    
    return { status, isCurrent };
  };

  const statusCounts = useMemo(() => {
    const counts: Record<QuestionStatus, number> = {
      answered: 0,
      notAnswered: 0,
      markedForReview: 0,
      markedAndAnswered: 0,
      notVisited: 0,
    };
    questions.forEach(q => {
      const { status } = getQuestionState(q.id);
      counts[status]++;
    });
    return counts;
  }, [questions, userAnswers, markedForReview, visitedQuestions, currentQuestionId]);

  const legendItems: { label: string; status: QuestionStatus; color: string; icon?: React.ReactNode }[] = [
    { label: 'Answered', status: 'answered', color: 'bg-green-500', icon: <CheckCircle className="h-3 w-3 text-white" /> },
    { label: 'Not Answered', status: 'notAnswered', color: 'bg-red-500', icon: <XCircle className="h-3 w-3 text-white" /> },
    { label: 'Marked', status: 'markedForReview', color: 'bg-purple-500', icon: <AlertCircle className="h-3 w-3 text-white" /> },
    { label: 'Marked & Answered', status: 'markedAndAnswered', color: 'bg-purple-500', icon: <div className="relative"><AlertCircle className="h-3 w-3 text-white" /><CheckCircle className="h-2 w-2 text-green-300 absolute -bottom-0.5 -right-0.5" /></div> },
    { label: 'Not Visited', status: 'notVisited', color: 'bg-slate-300', icon: <EyeOff className="h-3 w-3 text-slate-700" /> },
  ];

  return (
    <div className="w-full md:w-1/3 lg:w-1/4 xl:w-1/5 h-full flex flex-col border-l bg-card text-card-foreground">
      <CardHeader className="p-3 border-b">
        <div className="flex items-center gap-2">
          <UserCircle className="h-8 w-8 text-primary" />
          <div>
            <CardTitle className="text-sm font-medium">{studentName}</CardTitle>
            <p className="text-xs text-muted-foreground">Candidate</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-3 flex-grow overflow-hidden flex flex-col">
        <div className="mb-3">
          <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Question Status</h3>
          <div className="grid grid-cols-1 gap-y-1 text-xs"> {/* Changed to 1 column for better readability with counts */}
            {legendItems.map(item => (
              <div key={item.label} className="flex items-center gap-1.5">
                <span className={cn("h-3.5 w-3.5 rounded-full flex items-center justify-center shrink-0", item.color)}>
                  {item.icon || <Circle className="h-2 w-2 fill-current" />}
                </span>
                <span>{item.label}: {statusCounts[item.status]}</span>
              </div>
            ))}
          </div>
        </div>
        
        <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-2 mt-2">Question Palette</h3>
        <ScrollArea className="flex-grow border rounded-md">
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-4 lg:grid-cols-5 gap-1.5 p-2">
            {questions.map((q, index) => {
              const { status, isCurrent } = getQuestionState(q.id);
              let buttonClass = "bg-slate-200 hover:bg-slate-300 text-slate-700"; // Not Visited
              if (status === 'answered') buttonClass = "bg-green-500 hover:bg-green-600 text-white";
              else if (status === 'notAnswered') buttonClass = "bg-red-500 hover:bg-red-600 text-white"; // Visited but not answered
              else if (status === 'markedForReview') buttonClass = "bg-purple-500 hover:bg-purple-600 text-white"; // Marked, not answered
              else if (status === 'markedAndAnswered') buttonClass = "bg-purple-500 hover:bg-purple-600 text-white ring-1 ring-green-400 ring-offset-0"; // Marked and answered

              return (
                <Button
                  key={q.id}
                  variant="outline"
                  size="sm"
                  className={cn(
                    "h-8 w-full text-xs p-0 font-medium", // Added font-medium for better readability of numbers
                    buttonClass,
                    isCurrent && "ring-2 ring-primary ring-offset-1 dark:ring-offset-card" // Ensure offset works in dark mode
                  )}
                  onClick={() => onQuestionSelect(index)}
                  title={`Question ${index + 1} - Status: ${status.replace(/([A-Z])/g, ' $1').trim()}`} // Tooltip for status
                >
                  {index + 1}
                </Button>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>

      <div className="p-3 border-t mt-auto">
        <Button onClick={onSubmitTest} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
          Submit Test
        </Button>
      </div>
    </div>
  );
}

