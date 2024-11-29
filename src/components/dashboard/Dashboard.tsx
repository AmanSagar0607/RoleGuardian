import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const Dashboard = () => {
  const { user, userRole, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-6 text-3xl font-bold">Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Welcome, {user?.email}</CardTitle>
            <CardDescription>Role: {userRole}</CardDescription>
          </CardHeader>
          <CardContent>
            <p>You are successfully logged in!</p>
          </CardContent>
        </Card>

        {userRole === 'admin' && (
          <Card>
            <CardHeader>
              <CardTitle>Admin Controls</CardTitle>
              <CardDescription>Manage users and roles</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                User Management
              </Button>
            </CardContent>
          </Card>
        )}

        {(userRole === 'admin' || userRole === 'moderator') && (
          <Card>
            <CardHeader>
              <CardTitle>Moderation Tools</CardTitle>
              <CardDescription>Moderate content and users</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                View Reports
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;