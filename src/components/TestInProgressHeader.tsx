
"use client";

import TimerDisplay from './TimerDisplay';
import { Test } from '@/types'; // Assuming Test type has testType and subject for practice tests

interface TestInProgressHeaderProps {
  testType: 'mock' | 'practice';
  subject?: string; // Only for practice tests
  chapter?: string; // Only for practice tests
  minutes: number;
  seconds: number;
  isActive: boolean;
}

export default function TestInProgressHeader({ 
  testType, 
  subject,
  chapter,
  minutes, 
  seconds, 
  isActive 
}: TestInProgressHeaderProps) {
  const testTitle = testType === 'mock' ? 'Mock Test' : `Practice: ${subject} - ${chapter}`;
  
  return (
    <div className="flex items-center justify-between p-3 border-b bg-card sticky top-0 z-10">
      <div className="flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-primary">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.5 15.08L6 12.58l1.41-1.41L10.5 15.25l6.09-6.09L18 10.58l-7.5 7.5zM12 4c1.93 0 3.5 1.57 3.5 3.5S13.93 11 12 11s-3.5-1.57-3.5-3.5S10.07 4 12 4z"/>
        </svg>
        <div>
          <h1 className="text-lg font-semibold text-primary">TestPrep AI</h1>
          <p className="text-xs text-muted-foreground capitalize">{testTitle}</p>
        </div>
      </div>
      <TimerDisplay minutes={minutes} seconds={seconds} isActive={isActive} />
    </div>
  );
}
