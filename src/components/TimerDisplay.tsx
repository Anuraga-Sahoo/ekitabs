
import { Timer } from 'lucide-react';

interface TimerDisplayProps {
  minutes: number;
  seconds: number;
  isActive: boolean;
}

export default function TimerDisplay({ minutes, seconds, isActive }: TimerDisplayProps) {
  const displayHours = Math.floor(minutes / 60);
  const displayMinutes = minutes % 60;

  return (
    <div className="flex items-center space-x-2 p-3 bg-card border border-border rounded-lg shadow-sm">
      <Timer className={`h-6 w-6 ${isActive ? 'text-accent' : 'text-muted-foreground'}`} />
      <span className="text-xl font-mono font-semibold text-foreground">
        {String(displayHours).padStart(2, '0')}:{String(displayMinutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
      {!isActive && totalSecondsLeft === 0 && <span className="text-destructive-foreground bg-destructive px-2 py-1 rounded text-sm">Time's up!</span>}
    </div>
  );
}

// Add this helper to useTestTimer or make totalSecondsLeft prop
// For simplicity, assuming totalSecondsLeft is available in scope or TimerDisplay is modified to accept it
// For now, I'll modify to take totalSecondsLeft as a prop for clarity if it was intended to be passed.
// The current component only needs minutes and seconds, isActive for styling.
// Let's keep it simple as per its props, the Time's up message can be handled by parent.
// Removing the Time's up! line from here to simplify, parent can show status.
