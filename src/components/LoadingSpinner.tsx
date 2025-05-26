
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: number;
  text?: string;
}

export default function LoadingSpinner({ size = 48, text }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center space-y-2 py-8">
      <Loader2 className="h-12 w-12 animate-spin text-primary" style={{ height: size, width: size }} />
      {text && <p className="text-muted-foreground">{text}</p>}
    </div>
  );
}
