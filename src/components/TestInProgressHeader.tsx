
"use client";

import TimerDisplay from './TimerDisplay';
import type { QuestionStatus } from './TestInProgress'; // Import QuestionStatus type
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CheckCircle, XCircle, AlertCircle, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatusCounts {
  answered: number;
  notAnswered: number;
  markedForReview: number;
  markedAndAnswered: number;
  notVisited: number;
}

interface TestInProgressHeaderProps {
  testType: 'mock' | 'practice';
  subject?: string; 
  chapter?: string; 
  minutes: number;
  seconds: number;
  isActive: boolean;
  statusCounts: StatusCounts;
}

interface LegendItemConfig {
  key: QuestionStatus;
  label: string;
  icon: React.ElementType;
  iconClass: string;
  showCombinedIcon?: boolean; // For markedAndAnswered
  combinedIconClass?: string;
}

const legendConfig: LegendItemConfig[] = [
  { key: 'answered', label: 'Answered', icon: CheckCircle, iconClass: 'text-green-500' },
  { key: 'markedAndAnswered', label: 'Marked & Answered', icon: AlertCircle, iconClass: 'text-purple-500', showCombinedIcon: true, combinedIconClass: 'text-green-400' },
  { key: 'notAnswered', label: 'Not Answered (Visited)', icon: XCircle, iconClass: 'text-red-500' },
  { key: 'markedForReview', label: 'Marked for Review', icon: AlertCircle, iconClass: 'text-purple-500' },
  { key: 'notVisited', label: 'Not Visited', icon: EyeOff, iconClass: 'text-slate-500' },
];

export default function TestInProgressHeader({ 
  testType, 
  subject,
  chapter,
  minutes, 
  seconds, 
  isActive,
  statusCounts
}: TestInProgressHeaderProps) {
  const testTitle = testType === 'mock' ? 'Mock Test' : `Practice: ${subject} - ${chapter}`;
  
  return (
    <div className="flex items-center justify-between p-3 border-b bg-card sticky top-0 z-10">
      {/* Left Group: Title and Legend */}
      <div className="flex items-center space-x-4">
        <h1 className="text-base sm:text-lg font-semibold text-primary capitalize truncate" title={testTitle}>{testTitle}</h1>
        
        <TooltipProvider delayDuration={100}>
          <div className="hidden md:flex items-center space-x-3">
            {legendConfig.map(item => {
              const count = statusCounts[item.key];
              if (count === 0 && item.key !== 'notVisited') return null; // Optionally hide if count is 0, except for 'Not Visited' if desired

              const IconComponent = item.icon;
              return (
                <Tooltip key={item.key}>
                  <TooltipTrigger asChild>
                    <div className="flex items-center space-x-1 cursor-default">
                      {item.showCombinedIcon && count > 0 ? (
                        <div className="relative">
                           <IconComponent className={cn("h-4 w-4", item.iconClass)} />
                           <CheckCircle className={cn("h-2.5 w-2.5 absolute -bottom-0.5 -right-0.5", item.combinedIconClass)} />
                        </div>
                      ) : (
                        <IconComponent className={cn("h-4 w-4", item.iconClass)} />
                      )}
                      <span className="text-xs font-medium text-muted-foreground">{count}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>{item.label}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </TooltipProvider>
      </div>
      
      {/* Right Group: Timer */}
      <TimerDisplay minutes={minutes} seconds={seconds} isActive={isActive} />
    </div>
  );
}

    