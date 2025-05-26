
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PencilRuler, BookOpenText, History, ArrowRight } from 'lucide-react';
import Image from 'next/image';

const features = [
  {
    title: 'Mock Test',
    description: 'Take a full-length mock test with 360 questions simulating exam conditions.',
    href: '/mock-test',
    icon: PencilRuler,
    image: 'https://placehold.co/600x400.png',
    imageHint: 'study exam',
  },
  {
    title: 'Practice Mode',
    description: 'Generate custom practice tests by subject, chapter, and difficulty.',
    href: '/practice-test',
    icon: BookOpenText,
    image: 'https://placehold.co/600x400.png',
    imageHint: 'books library',
  },
  {
    title: 'Test History',
    description: 'Review your past performances, scores, and track your progress over time.',
    href: '/test-history',
    icon: History,
    image: 'https://placehold.co/600x400.png',
    imageHint: 'charts analytics',
  },
];

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      <section className="w-full py-12 md:py-20 lg:py-28 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-lg shadow-xl mb-12">
        <div className="container px-4 md:px-6 text-center">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl drop-shadow-md">
            Welcome to TestPrep AI
          </h1>
          <p className="mt-4 max-w-[700px] mx-auto text-lg md:text-xl text-primary-foreground/90 drop-shadow-sm">
            Your ultimate platform for AI-powered mock tests and personalized practice. Prepare smarter, not harder.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button size="lg" asChild className="bg-background text-foreground hover:bg-background/90">
              <Link href="/mock-test">Start Mock Test <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-primary-foreground/50 text-primary-foreground hover:bg-primary-foreground/10">
              <Link href="/practice-test">Create Practice Test <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <Card key={feature.title} className="hover:shadow-2xl transition-shadow duration-300 flex flex-col">
              <CardHeader className="items-center text-center">
                <feature.icon className="h-12 w-12 text-primary mb-4" />
                <CardTitle className="text-2xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col text-center">
                <Image 
                  src={feature.image} 
                  alt={feature.title} 
                  width={600} 
                  height={400} 
                  className="rounded-md mb-4 aspect-[3/2] object-cover"
                  data-ai-hint={feature.imageHint}
                />
                <CardDescription className="text-base mb-6 flex-grow">{feature.description}</CardDescription>
                <Button asChild variant="default" className="mt-auto bg-primary hover:bg-primary/90 text-primary-foreground w-full">
                  <Link href={feature.href}>
                    Go to {feature.title} <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
