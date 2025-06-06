
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, LibraryBig, Presentation, RadioTower, BarChart3, Languages } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import TestimonialCarousel from '@/components/TestimonialCarousel';
import { cn } from '@/lib/utils';

// Updated testimonial data for NEET
const testimonialsData = [
  {
    id: 1,
    name: "Priya Sharma",
    role: "NEET Aspirant",
    feedback: "TestPrep AI's NEET mock tests are incredibly realistic, covering Physics, Chemistry, and Biology just like the actual exam. The AI-generated questions helped me identify weak topics and significantly boosted my confidence and scores!",
    avatar: "https://placehold.co/80x80.png",
    dataAiHint: "NEET student"
  },
  {
    id: 2,
    name: "Arjun Kumar",
    role: "Medical Entrance Candidate",
    feedback: "The practice test feature for specific NEET chapters is a lifesaver! I can focus on difficult concepts in Biology or challenging Physics problems. The AI MCQs are top-notch for targeted NEET prep.",
    avatar: "https://placehold.co/80x80.png",
    dataAiHint: "focused medical student"
  },
  {
    id: 3,
    name: "Dr. Rina Mehta",
    role: "NEET Biology Coach",
    feedback: "As an educator specializing in NEET, I'm impressed by TestPrep AI's ability to create diverse and relevant question sets for Physics, Chemistry, and Biology. It's an invaluable tool for students aiming for top scores in the NEET exam.",
    avatar: "https://placehold.co/80x80.png",
    dataAiHint: "biology teacher"
  },
  {
    id: 4,
    name: "Sameer Patel",
    role: "Aspiring Doctor (NEET)",
    feedback: "The AI mock tests simulate the NEET environment perfectly. Analyzing my performance on questions from all three subjects helps me understand where I need to improve for the actual medical entrance exam. Highly recommended!",
    avatar: "https://placehold.co/80x80.png",
    dataAiHint: "determined student"
  }
];

const featureCardsData = [
  {
    icon: Presentation,
    iconColor: "text-green-600 dark:text-green-400",
    iconBgColor: "bg-green-100 dark:bg-green-500/20",
    cardBgColor: "bg-green-50 dark:bg-green-900/10",
    title: "Learn from the Best",
    description: "Learn from the masters of the subject, in the most engaging yet simplified ways.",
  },
  {
    icon: RadioTower,
    iconColor: "text-pink-600 dark:text-pink-400",
    iconBgColor: "bg-pink-100 dark:bg-pink-500/20",
    cardBgColor: "bg-pink-50 dark:bg-pink-900/10",
    title: "Live Tests for Real Exam Experience",
    description: "Feel the thrill of a real exam. Improve your time & pressure management skills.",
  },
  {
    icon: BarChart3,
    iconColor: "text-yellow-600 dark:text-yellow-400",
    iconBgColor: "bg-yellow-100 dark:bg-yellow-500/20",
    cardBgColor: "bg-yellow-50 dark:bg-yellow-900/10",
    title: "Detailed Score Analysis",
    description: "Get a detailed breakdown of your strengths & weaknesses and discover insights to improve your score.",
  },
  {
    icon: Languages,
    iconColor: "text-purple-600 dark:text-purple-400",
    iconBgColor: "bg-purple-100 dark:bg-purple-500/20",
    cardBgColor: "bg-purple-50 dark:bg-purple-900/10",
    title: "Multilingual Support",
    description: "Learn in the language you are most comfortable with. Platform designed for diverse users.",
  },
];


export default function Home() {
  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] py-12 bg-background text-center">
        <section className="w-full container px-4 md:px-6">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            One Destination for <span className="text-primary">Complete Exam</span> Preparation
          </h1>
          <div className="mt-6 flex justify-center items-center space-x-2 sm:space-x-4 text-base sm:text-lg text-muted-foreground">
            <span>Learn</span> <span className="text-muted-foreground/50">&bull;</span>
            <span>Practice</span> <span className="text-muted-foreground/50">&bull;</span>
            <span>Improve</span> <span className="text-muted-foreground/50">&bull;</span>
            <span>Succeed</span>
          </div>
          <div className="mt-12 flex justify-center">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-10 py-7 text-lg w-full sm:w-auto"
              asChild
            >
              <Link href="/ai-tests">
                <Sparkles className="mr-3 h-6 w-6" />
                AI Powered Tests
              </Link>
            </Button>
          </div>
        </section>
      </div>

      <section className="py-16 bg-secondary/50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Exam Categories</h2>
            <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
              TestPrep AI provides various test categories to boost your preparation and help you achieve your goals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Previous Year Test Card */}
            <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
              <CardContent className="p-6 flex flex-col h-full">
                <div className="flex-grow flex items-start">
                  <div className="flex-1 pr-4">
                    <h3 className="text-xl font-semibold text-foreground mb-2">Previous Year Tests</h3>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      <Badge variant="outline">Past Papers</Badge>
                      <Badge variant="outline">Exam Insights</Badge>
                    </div>
                  </div>
                  <div className="relative w-20 h-20 flex-shrink-0 self-start mt-1">
                    <div className="absolute inset-0 bg-blue-500/10 rounded-full -z-10 scale-125 opacity-70 blur-sm"></div>
                    <Image src="https://placehold.co/80x80.png" alt="Previous Year Tests" width={80} height={80} className="object-contain" data-ai-hint="archive exam paper" />
                  </div>
                </div>
                <div className="mt-auto pt-4 border-t border-border/50">
                  <Link href="/previous-year-tests" className="font-medium text-sm text-primary hover:text-primary/80 flex items-center">
                    Explore Category <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Practice Test Card */}
            <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
              <CardContent className="p-6 flex flex-col h-full">
                <div className="flex-grow flex items-start">
                  <div className="flex-1 pr-4">
                    <h3 className="text-xl font-semibold text-foreground mb-2">Practice Tests</h3>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      <Badge variant="outline">Topic Specific</Badge>
                      <Badge variant="outline">Custom Difficulty</Badge>
                      <Badge variant="outline">Skill Building</Badge>
                    </div>
                  </div>
                  <div className="relative w-20 h-20 flex-shrink-0 self-start mt-1">
                    <div className="absolute inset-0 bg-primary/10 rounded-full -z-10 scale-125 opacity-70 blur-sm"></div>
                    <Image src="https://placehold.co/80x80.png" alt="Practice Tests" width={80} height={80} className="object-contain" data-ai-hint="study tools target" />
                  </div>
                </div>
                <div className="mt-auto pt-4 border-t border-border/50">
                  <Link href="/practice-test" className="font-medium text-sm text-primary hover:text-primary/80 flex items-center">
                    Explore Category <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Mock Test Card */}
            <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
              <CardContent className="p-6 flex flex-col h-full">
                <div className="flex-grow flex items-start">
                  <div className="flex-1 pr-4">
                    <h3 className="text-xl font-semibold text-foreground mb-2">Mock Tests (NEET)</h3>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      <Badge variant="outline">Full Syllabus</Badge>
                      <Badge variant="outline">Real Exam Feel</Badge>
                      <Badge variant="outline">Rank Analysis</Badge>
                    </div>
                  </div>
                  <div className="relative w-20 h-20 flex-shrink-0 self-start mt-1">
                    <div className="absolute inset-0 bg-pink-500/10 rounded-full -z-10 scale-125 opacity-70 blur-sm"></div>
                    <Image src="https://placehold.co/80x80.png" alt="Mock Tests" width={80} height={80} className="object-contain" data-ai-hint="medical exam simulation" />
                  </div>
                </div>
                <div className="mt-auto pt-4 border-t border-border/50">
                  <Link href="/mock-test" className="font-medium text-sm text-primary hover:text-primary/80 flex items-center">
                    Explore Category <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* New "Why TestPrep AI?" Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-12 xl:gap-20 items-center">
            {/* Left Column */}
            <div className="space-y-7 text-center lg:text-left">
              <div className="flex justify-center lg:justify-start">
                <div className="inline-block p-2 bg-primary/10 rounded-xl mb-3">
                  <LibraryBig className="w-10 h-10 text-primary" />
                </div>
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-[2.8rem] lg:leading-tight">
                Why TestPrep AI?
              </h2>
              <p className="text-lg text-muted-foreground max-w-lg mx-auto lg:mx-0">
                With 1.8+ Crore Students and one of the best selection rates in India amongst online learning platforms, you can surely rely on us to excel.
              </p>
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-3 text-base sm:text-lg w-full sm:w-auto" 
                asChild
              >
                <Link href="/ai-tests">
                  Get Started For Free
                </Link>
              </Button>
            </div>

            {/* Right Column - Feature Cards Grid */}
            <div className="grid sm:grid-cols-2 gap-5">
              {featureCardsData.map((card, index) => {
                const IconComponent = card.icon;
                return (
                  <Card key={index} className={cn("shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl overflow-hidden", card.cardBgColor)}>
                    <CardContent className="p-6 flex flex-col items-start space-y-3">
                      <div className={cn("p-3.5 rounded-lg inline-flex items-center justify-center mb-2", card.iconBgColor)}>
                        <IconComponent className={cn("h-7 w-7", card.iconColor)} />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground leading-snug">{card.title}</h3>
                      <p className="text-[0.9rem] text-muted-foreground leading-relaxed">
                        {card.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-secondary/50"> {/* Changed from bg-background to bg-secondary/50 */}
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              What Our Users Say
            </h2>
            <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
              Hear from students and educators who have benefited from TestPrep AI.
            </p>
          </div>
          <TestimonialCarousel testimonials={testimonialsData} />
        </div>
      </section>
    </>
  );
}

