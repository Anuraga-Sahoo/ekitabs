
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function DashboardPage() {
  return (
    <div className="w-full"> 
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary text-center">Welcome to Your Dashboard</CardTitle>
          <CardDescription className="text-lg text-center text-muted-foreground">
            Navigate using the sidebar to access all features.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 text-center">
          <p className="text-lg text-muted-foreground">
            You can manage your tests, review history, and update your profile using the links in the sidebar.
          </p>
          <p className="text-lg text-muted-foreground">
            Get started by selecting an option from the navigation menu!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
