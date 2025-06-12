
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PencilRuler } from 'lucide-react';

export default function NewMockTestPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader className="text-center">
          <PencilRuler className="mx-auto h-12 w-12 text-primary mb-2" />
          <CardTitle className="text-3xl font-bold text-primary">Mock Test</CardTitle>
          <CardDescription className="text-lg text-muted-foreground mt-2">
            Prepare for your exams with a full-length mock test.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            This is where the mock test interface will be displayed. 
            Questions will be fetched from the backend and presented here for you to answer.
          </p>
          <p className="font-semibold text-accent">
            Mock Test UI Coming Soon!
          </p>
          {/* Placeholder for where the test component would go */}
          <div className="border-2 border-dashed border-border rounded-md p-8 h-64 flex items-center justify-center">
            <p className="text-muted-foreground text-lg">Test Area Placeholder</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
