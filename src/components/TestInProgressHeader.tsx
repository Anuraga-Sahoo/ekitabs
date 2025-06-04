
"use client";

import TimerDisplay from './TimerDisplay';
// Removed Test type import as it's not directly used for props here after change

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
      <div className="flex items-center">
        <h1 className="text-lg font-semibold text-primary capitalize">{testTitle}</h1>
      </div>
      <TimerDisplay minutes={minutes} seconds={seconds} isActive={isActive} />
    </div>
  );
}
