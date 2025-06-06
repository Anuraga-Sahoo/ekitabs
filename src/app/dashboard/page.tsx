
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart2, Settings, UserCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="max-w-4xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary text-center">Welcome to Your Dashboard</CardTitle>
          <CardDescription className="text-lg text-center text-muted-foreground">
            Here's an overview of your activity and quick access to features.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 text-center">
            <Card className="hover:shadow-xl transition-shadow">
              <CardHeader>
                <UserCircle className="mx-auto h-12 w-12 text-primary" />
                <CardTitle className="text-xl mt-2">Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">View and update your profile information.</p>
                <Button asChild>
                  <Link href="/profile">View Profile</Link>
                </Button>
              </CardContent>
            </Card>
            <Card className="hover:shadow-xl transition-shadow">
              <CardHeader>
                <BarChart2 className="mx-auto h-12 w-12 text-accent" />
                <CardTitle className="text-xl mt-2">Test History</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">Review your past test performance.</p>
                <Button asChild>
                  <Link href="/test-history">View History</Link>
                </Button>
              </CardContent>
            </Card>
            <Card className="hover:shadow-xl transition-shadow">
              <CardHeader>
                <Settings className="mx-auto h-12 w-12 text-secondary-foreground" />
                <CardTitle className="text-xl mt-2">Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">Manage your account settings.</p>
                <Button variant="outline" disabled>Account Settings (Soon)</Button>
              </CardContent>
            </Card>
          </div>
           <div className="text-center mt-10">
              <Button size="lg" asChild>
                  <Link href="/ai-tests">Explore AI Tests</Link>
              </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
