
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { BookOpen, Download } from 'lucide-react';

export default function PreviousYearTestsPage() {
  const samplePapers = [
    { year: 2023, examName: "NEET UG", subject: "Physics, Chemistry, Biology", downloadLink: "#" },
    { year: 2022, examName: "JEE Main - Paper 1", subject: "Physics, Chemistry, Maths", downloadLink: "#" },
    { year: 2023, examName: "Class 12 Board Exam", subject: "Sample Paper - Science", downloadLink: "#" },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-primary flex items-center justify-center">
          <BookOpen className="mr-3 h-10 w-10" /> Previous Year Question Papers
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          Access past exam papers to understand patterns and practice effectively.
        </p>
      </header>

      {samplePapers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {samplePapers.map((paper, index) => (
            <Card key={index} className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-xl text-foreground">{paper.examName} - {paper.year}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">{paper.subject}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-muted-foreground text-sm">
                  This section will provide access to the actual question paper for {paper.examName} {paper.year}. 
                  Practicing with previous year papers is a key strategy for exam success.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Link href={paper.downloadLink}>
                    <Download className="mr-2 h-5 w-5" /> Download Paper (Coming Soon)
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="max-w-2xl mx-auto shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-primary text-center">Content Coming Soon</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4 text-lg">
            <p>
              We are working hard to bring you a comprehensive collection of previous year question papers. 
              This section will be updated soon with downloadable PDFs and interactive practice options.
            </p>
            <p className="text-muted-foreground">
              In the meantime, please explore our AI-powered Mock Tests and Practice Tests to boost your preparation!
            </p>
            <Button asChild size="lg">
              <Link href="/ai-tests">Explore AI Tests</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
