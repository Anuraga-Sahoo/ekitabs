
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PencilRuler, BookOpenText, History, ArrowRight } from 'lucide-react';
import Image from 'next/image';

const features = [
  {
    title: 'Mock Test',
    description: 'Take a full-length mock test simulating exam conditions, covering all key subjects.',
    href: '/mock-test',
    icon: PencilRuler,
    image: 'https://placehold.co/600x400.png',
    imageHint: 'study exam',
  },
  {
    title: 'Practice Mode',
    description: 'Generate custom practice tests by subject, chapter, and difficulty to focus your learning.',
    href: '/practice-test',
    icon: BookOpenText,
    image: 'https://placehold.co/600x400.png',
    imageHint: 'books library',
  },
  {
    title: 'Test History',
    description: 'Review your past performances, scores, and detailed analytics to track your progress.',
    href: '/test-history',
    icon: History,
    image: 'https://placehold.co/600x400.png',
    imageHint: 'charts analytics',
  },
];

export default function Home() {
  return (
    <div className="flex flex-col items-center space-y-12 md:space-y-20">
      <section className="w-full py-12 md:py-20 lg:py-28 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-lg shadow-xl">
        <div className="container px-4 md:px-6 text-center">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl drop-shadow-md">
            Welcome to TestPrep AI
          </h1>
          <p className="mt-4 max-w-[700px] mx-auto text-lg md:text-xl lg:text-2xl text-primary-foreground/90 drop-shadow-sm">
            Your ultimate platform for AI-powered mock tests and personalized practice. Prepare smarter, not harder.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6">
            <Button 
              size="lg" 
              asChild 
              className="bg-background text-foreground hover:bg-background/90 w-full sm:w-auto transition-transform duration-200 ease-in-out hover:-translate-y-0.5"
            >
              <Link href="/mock-test">Start Mock Test <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              asChild 
              className="border-primary-foreground/50 text-primary-foreground hover:bg-primary-foreground/10 w-full sm:w-auto transition-transform duration-200 ease-in-out hover:-translate-y-0.5"
            >
              <Link href="/practice-test">Create Practice Test <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="w-full container px-4 md:px-6">
        <div className="text-center mb-10 md:mb-12 lg:mb-16">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-primary">
            Unlock Your Potential
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-lg text-muted-foreground">
            Discover the tools designed to help you ace your exams and achieve your academic goals.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <Card 
              key={feature.title} 
              className="transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-1 flex flex-col bg-card"
            >
              <CardHeader className="items-center text-center pt-6 pb-4">
                <feature.icon className="h-12 w-12 text-primary mb-3" />
                <CardTitle className="text-2xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col text-center p-6 pt-0">
                <div className="mb-4">
                  <Image 
                    src={feature.image} 
                    alt={feature.title} 
                    width={600} 
                    height={400} 
                    className="rounded-lg aspect-[3/2] object-cover"
                    data-ai-hint={feature.imageHint}
                  />
                </div>
                <CardDescription className="text-base mb-6 flex-grow">{feature.description}</CardDescription>
                <Button asChild variant="default" className="mt-auto bg-accent hover:bg-accent/90 text-accent-foreground w-full">
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
