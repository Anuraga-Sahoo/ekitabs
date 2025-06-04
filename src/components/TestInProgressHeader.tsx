
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
    <div className="flex items-center justify-between p-2 border-b bg-card sticky top-0 z-10"> {/* Reduced padding from p-3 to p-2 */}
      {/* Left Group: Title and Legend */}
      <div className="flex items-center space-x-3"> {/* Reduced space-x-4 to space-x-3 */}
        <h1 className="text-sm sm:text-base font-semibold text-primary capitalize truncate" title={testTitle}>{testTitle}</h1> {/* Reduced font size */}
        
        <TooltipProvider delayDuration={100}>
          <div className="hidden md:flex items-center space-x-2"> {/* Reduced space-x-3 to space-x-2 */}
            {legendConfig.map(item => {
              const count = statusCounts[item.key];
              if (count === 0 && item.key !== 'notVisited') return null;

              const IconComponent = item.icon;
              return (
                <Tooltip key={item.key}>
                  <TooltipTrigger asChild>
                    <div className="flex items-center space-x-1 cursor-default">
                      {item.showCombinedIcon && count > 0 ? (
                        <div className="relative">
                           <IconComponent className={cn("h-3.5 w-3.5", item.iconClass)} /> {/* Ensured icon size is small */}
                           <CheckCircle className={cn("h-2 w-2 absolute -bottom-0.5 -right-0.5", item.combinedIconClass)} />
                        </div>
                      ) : (
                        <IconComponent className={cn("h-3.5 w-3.5", item.iconClass)} /> 
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
