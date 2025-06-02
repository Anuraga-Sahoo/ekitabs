
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AboutUsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="max-w-3xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary text-center">About Us</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-lg">
          <p>
            Welcome to TestPrep AI, your ultimate partner in exam preparation. Our mission is to empower students 
            with cutting-edge AI tools to excel in their academic and competitive examinations.
          </p>
          <p>
            Founded by a team of passionate educators and technologists, TestPrep AI aims to revolutionize the way 
            students learn and practice. We believe in personalized learning experiences that cater to individual 
            needs and learning paces.
          </p>
          <p>
            Our platform offers AI-generated mock tests, tailored practice sessions, and detailed performance 
            analytics to help you identify your strengths and weaknesses. We are committed to providing high-quality, 
            accessible, and affordable preparation resources for everyone.
          </p>
          <p>
            Join us on this journey to make learning more effective, engaging, and successful.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
