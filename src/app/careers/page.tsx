
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';

export default function CareersPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="max-w-3xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary text-center">Careers at TestPrep AI</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-lg">
          <p>
            Join TestPrep AI and be part of a dynamic team that's shaping the future of education technology. 
            We are always looking for talented individuals who are passionate about making a difference in 
            students' lives.
          </p>
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">Why Work With Us?</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Innovate with cutting-edge AI and educational tools.</li>
              <li>Collaborate with a passionate and diverse team.</li>
              <li>Make a tangible impact on students' success.</li>
              <li>Enjoy a flexible and supportive work environment.</li>
              <li>Opportunities for growth and professional development.</li>
            </ul>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3">Current Openings</h2>
            <p className="text-muted-foreground">
              We do not have any open positions at the moment. However, we are always interested in hearing 
              from talented individuals. Please feel free to send us your resume, and we'll keep it on file 
              for future opportunities.
            </p>
          </section>
          <div className="text-center pt-4">
            <Button asChild size="lg">
              <a href="mailto:careers@testprepai.example.com">
                <Mail className="mr-2 h-5 w-5" />
                Submit Your Resume
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
