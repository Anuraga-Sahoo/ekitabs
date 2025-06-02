
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

const blogPosts = [
  {
    id: 1,
    title: "Mastering MCQs: AI-Powered Strategies for Success",
    date: "October 26, 2023",
    excerpt: "Discover how TestPrep AI can help you tackle multiple-choice questions with confidence and improve your scores significantly.",
    slug: "/blog/mastering-mcqs",
    image: "https://placehold.co/600x400.png?text=AI+Strategies",
    dataAiHint: "AI learning"
  },
  {
    id: 2,
    title: "The Future of Test Preparation: Personalized Learning with AI",
    date: "November 5, 2023",
    excerpt: "Explore the benefits of personalized study plans and how AI is revolutionizing the way students prepare for exams.",
    slug: "/blog/future-of-test-prep",
    image: "https://placehold.co/600x400.png?text=Personalized+Learning",
    dataAiHint: "education technology"
  },
  {
    id: 3,
    title: "Understanding Your Mock Test Results: A Guide to Improvement",
    date: "November 12, 2023",
    excerpt: "Learn how to effectively analyze your mock test performance to identify weak areas and create a focused study approach.",
    slug: "/blog/analyzing-mock-tests",
    image: "https://placehold.co/600x400.png?text=Test+Analysis",
    dataAiHint: "study analytics"
  },
];

export default function BlogPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-primary">TestPrep AI Blog</h1>
        <p className="text-xl text-muted-foreground mt-2">
          Insights, tips, and updates on exam preparation and learning with AI.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogPosts.map((post) => (
          <Card key={post.id} className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="p-0">
              <Image 
                src={post.image} 
                alt={post.title} 
                width={600} 
                height={400} 
                className="object-cover w-full h-48" 
                data-ai-hint={post.dataAiHint}
              />
            </CardHeader>
            <CardContent className="p-6 flex-grow">
              <CardTitle className="text-xl mb-2 hover:text-primary">
                <Link href={post.slug}>{post.title}</Link>
              </CardTitle>
              <p className="text-xs text-muted-foreground mb-3">{post.date}</p>
              <CardDescription className="text-base line-clamp-3">{post.excerpt}</CardDescription>
            </CardContent>
            <CardFooter className="p-6 pt-0">
              <Button asChild variant="link" className="p-0 text-primary">
                <Link href={post.slug}>Read More &rarr;</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      {blogPosts.length === 0 && (
         <div className="text-center py-10">
            <p className="text-xl text-muted-foreground">No blog posts yet. Check back soon!</p>
        </div>
      )}
    </div>
  );
}
