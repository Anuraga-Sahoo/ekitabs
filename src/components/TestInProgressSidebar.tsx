
"use client";

import type { AppQuestion } from '@/types';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { UserCircle, Circle, CheckCircle, XCircle, AlertCircle, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMemo, useState, useEffect } from 'react';

export type QuestionStatus = 'answered' | 'notAnswered' | 'markedForReview' | 'markedAndAnswered' | 'notVisited';

interface QuestionPaletteState {
  status: QuestionStatus;
  isCurrent: boolean;
}

interface SubjectSectionData {
  name: string;
  startIndex: number;
  endIndex: number;
  count: number;
}

interface TestInProgressSidebarProps {
  questions: AppQuestion[];
  subjectSections: SubjectSectionData[];
  currentQuestionId: string;
  currentQuestionIndex: number; 
  userAnswers: Record<string, string>;
  markedForReview: Set<string>;
  visitedQuestions: Set<string>;
  onQuestionSelect: (index: number) => void;
  onSubmitTest: () => void;
  studentName?: string;
}

export default function TestInProgressSidebar({
  questions,
  subjectSections,
  currentQuestionId,
  currentQuestionIndex,
  userAnswers,
  markedForReview,
  visitedQuestions,
  onQuestionSelect,
  onSubmitTest,
  studentName = "Test Taker"
}: TestInProgressSidebarProps) {
  const [activeAccordionItem, setActiveAccordionItem] = useState<string | undefined>(undefined);

  useEffect(() => {
    // Automatically open the accordion section for the current question
    const currentSection = subjectSections.find(
      section => currentQuestionIndex >= section.startIndex && currentQuestionIndex <= section.endIndex
    );
    if (currentSection) {
      setActiveAccordionItem(currentSection.name);
    } else if (subjectSections.length > 0) {
      // Fallback to the first section if current question is not in any known section (should not happen)
      // or if currentQuestionIndex is 0 and first section exists.
      setActiveAccordionItem(subjectSections[0].name);
    }
  }, [currentQuestionIndex, subjectSections]);

  const getQuestionState = (questionId: string, questionIndex: number): QuestionPaletteState => {
    const isCurrent = questionIndex === currentQuestionIndex; // Use index for current check
    const isAnswered = !!userAnswers[questionId] && userAnswers[questionId] !== '';
    const isMarked = markedForReview.has(questionId);
    const isVisited = visitedQuestions.has(questionId);

    let status: QuestionStatus;
    if (isAnswered && isMarked) status = 'markedAndAnswered';
    else if (isAnswered) status = 'answered'; 
    else if (isMarked) status = 'markedForReview'; 
    else if (isVisited) status = 'notAnswered'; 
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
    questions.forEach((q, index) => { // Pass index here
      const { status } = getQuestionState(q.id, index); // Pass index here
      counts[status]++;
    });
    return counts;
  }, [questions, userAnswers, markedForReview, visitedQuestions, currentQuestionIndex]); // Add currentQuestionIndex dependency

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
        <div className="mb-2 flex-shrink-0">
          <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-1">Question Status</h3>
          <div className="grid grid-cols-1 gap-y-0.5 text-xs">
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
        
        <div className="flex flex-col flex-grow mt-2 overflow-hidden">
          <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-1 flex-shrink-0">Question Palette</h3>
          <ScrollArea className="flex-1 border rounded-md min-h-0">
            <Accordion 
              type="single" 
              collapsible 
              className="w-full"
              value={activeAccordionItem}
              onValueChange={setActiveAccordionItem}
            >
              {subjectSections.map((section) => (
                <AccordionItem value={section.name} key={section.name}>
                  <AccordionTrigger className="px-2 py-1.5 text-xs hover:no-underline hover:bg-muted/50 rounded-sm">
                    {section.name} ({section.count})
                  </AccordionTrigger>
                  <AccordionContent className="pb-1 pt-0">
                    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-4 lg:grid-cols-5 gap-1.5 p-2">
                      {questions.slice(section.startIndex, section.endIndex + 1).map((q, localIndex) => {
                        const globalIndex = section.startIndex + localIndex;
                        const { status, isCurrent } = getQuestionState(q.id, globalIndex);
                        let buttonClass = "bg-slate-200 hover:bg-slate-300 text-slate-700"; // Not Visited
                        if (status === 'answered') buttonClass = "bg-green-500 hover:bg-green-600 text-white";
                        else if (status === 'notAnswered') buttonClass = "bg-red-500 hover:bg-red-600 text-white"; 
                        else if (status === 'markedForReview') buttonClass = "bg-purple-500 hover:bg-purple-600 text-white"; 
                        else if (status === 'markedAndAnswered') buttonClass = "bg-purple-500 hover:bg-purple-600 text-white ring-1 ring-green-400 ring-offset-0"; 

                        return (
                          <Button
                            key={q.id}
                            variant="outline"
                            size="sm"
                            className={cn(
                              "h-8 w-full text-xs p-0 font-medium", 
                              buttonClass,
                              isCurrent && "ring-2 ring-primary ring-offset-1 dark:ring-offset-card" 
                            )}
                            onClick={() => onQuestionSelect(globalIndex)}
                            title={`Question ${globalIndex + 1} - Status: ${status.replace(/([A-Z])/g, ' $1').trim()}`}
                          >
                            {globalIndex + 1}
                          </Button>
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
               {subjectSections.length === 0 && questions.length > 0 && (
                 // Fallback for single section tests or if sections somehow not processed
                 <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-4 lg:grid-cols-5 gap-1.5 p-2">
                    {questions.map((q, index) => {
                        const { status, isCurrent } = getQuestionState(q.id, index);
                        let buttonClass = "bg-slate-200 hover:bg-slate-300 text-slate-700";
                        if (status === 'answered') buttonClass = "bg-green-500 hover:bg-green-600 text-white";
                        else if (status === 'notAnswered') buttonClass = "bg-red-500 hover:bg-red-600 text-white";
                        else if (status === 'markedForReview') buttonClass = "bg-purple-500 hover:bg-purple-600 text-white";
                        else if (status === 'markedAndAnswered') buttonClass = "bg-purple-500 hover:bg-purple-600 text-white ring-1 ring-green-400 ring-offset-0";

                        return (
                        <Button
                            key={q.id}
                            variant="outline"
                            size="sm"
                            className={cn("h-8 w-full text-xs p-0 font-medium", buttonClass, isCurrent && "ring-2 ring-primary ring-offset-1 dark:ring-offset-card")}
                            onClick={() => onQuestionSelect(index)}
                            title={`Question ${index + 1} - Status: ${status.replace(/([A-Z])/g, ' $1').trim()}`}
                        >
                            {index + 1}
                        </Button>
                        );
                    })}
                 </div>
               )}
            </Accordion>
          </ScrollArea>
        </div>
      </CardContent>

      <div className="p-3 border-t mt-auto">
        <Button onClick={onSubmitTest} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
          Submit Test
        </Button>
      </div>
    </div>
  );
}

