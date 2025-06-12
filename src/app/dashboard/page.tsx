
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart2, Settings, UserCircle, Sparkles as ExploreIcon } from 'lucide-react'; // Renamed Sparkles to ExploreIcon to avoid conflict
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  return (
    // The container and overall padding will be handled by DashboardLayout
    // No need for mx-auto or explicit py-12 here if layout handles it.
    <div className="w-full"> 
      <Card className="shadow-lg"> {/* max-w-4xl mx-auto removed, layout can control width if needed */}
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
                <Settings className="mx-auto h-12 w-12 text-secondary-foreground" /> {/* Corrected class name for icon color */}
                <CardTitle className="text-xl mt-2">Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">Manage your account settings.</p>
                <Button variant="outline" disabled>Account Settings (Soon)</Button>
              </CardContent>
            </Card>
          </div>
           <div className="text-center mt-10">
              <Button size="lg" asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Link href="/ai-tests"> <ExploreIcon className="mr-2 h-5 w-5" /> Explore AI Tests</Link>
              </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
