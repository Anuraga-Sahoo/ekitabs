
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PencilRuler, BookOpenText } from 'lucide-react';

const PlayIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-muted-foreground">
    <path d="M6 4l12 8-12 8z"/>
  </svg>
);

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] py-12 bg-background text-center">
      <section className="w-full container px-4 md:px-6">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
          One Destination for <span className="text-[hsl(var(--brand-green))]">Complete Exam</span> Preparation
        </h1>
        <div className="mt-6 flex justify-center items-center space-x-2 sm:space-x-4 text-base sm:text-lg text-muted-foreground">
          <span>Learn</span> <PlayIcon />
          <span>Practice</span> <PlayIcon />
          <span>Improve</span> <PlayIcon />
          <span>Succeed</span>
        </div>
        <div className="mt-12 flex flex-col sm:flex-row justify-center items-center gap-6">
          <Button
            size="lg"
            className="bg-[hsl(var(--brand-green))] hover:bg-[hsl(var(--brand-green))]/90 text-white font-semibold px-10 py-7 text-lg w-full sm:w-auto"
            asChild
          >
            <Link href="/mock-test">
              <PencilRuler className="mr-3 h-6 w-6" />
              Take a Mock Test
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-[hsl(var(--brand-green))] text-[hsl(var(--brand-green))] hover:bg-[hsl(var(--brand-green))]/10 hover:text-[hsl(var(--brand-green))] font-semibold px-10 py-7 text-lg w-full sm:w-auto"
            asChild
          >
            <Link href="/practice-test">
              <BookOpenText className="mr-3 h-6 w-6" />
              Create a Practice Test
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
