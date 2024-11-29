import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { Loader2, Users, Shield, Settings, Key } from 'lucide-react';
import { toast } from 'sonner';

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  pendingVerifications: number;
}

export default function Dashboard() {
  const { user, userRole } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      if (userRole !== 'admin') {
        setLoading(false);
        return;
      }

      const { data: users, error: usersError } = await supabase
        .from('user_roles')
        .select('*');

      if (usersError) throw usersError;

      const { data: pendingUsers, error: pendingError } = await supabase
        .from('users')
        .select('*')
        .eq('email_confirmed_at', null);

      if (pendingError) throw pendingError;

      setStats({
        totalUsers: users?.length || 0,
        activeUsers: (users?.length || 0) - (pendingUsers?.length || 0),
        pendingVerifications: pendingUsers?.length || 0,
      });
    } catch (error: any) {
      toast.error('Failed to fetch statistics');
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* User Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Role:</strong> {userRole}</p>
              <p><strong>Status:</strong> Active</p>
            </div>
          </CardContent>
        </Card>

        {/* Role Permissions Card */}
        <Card>
          <CardHeader>
            <CardTitle>Role Permissions</CardTitle>
            <CardDescription>Your current access level</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {userRole === 'admin' && (
                <>
                  <p>✓ Full system access</p>
                  <p>✓ User management</p>
                  <p>✓ Role assignment</p>
                  <p>✓ System settings</p>
                </>
              )}
              {userRole === 'moderator' && (
                <>
                  <p>✓ Content management</p>
                  <p>✓ User monitoring</p>
                  <p>✓ Report generation</p>
                </>
              )}
              {userRole === 'user' && (
                <>
                  <p>✓ View dashboard</p>
                  <p>✓ Update profile</p>
                  <p>✓ Basic features</p>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Admin Stats Card */}
        {userRole === 'admin' && stats && (
          <Card>
            <CardHeader>
              <CardTitle>System Statistics</CardTitle>
              <CardDescription>Overview of system usage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Total Users:</strong> {stats.totalUsers}</p>
                <p><strong>Active Users:</strong> {stats.activeUsers}</p>
                <p><strong>Pending Verifications:</strong> {stats.pendingVerifications}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {userRole === 'admin' && (
            <>
              <Button variant="outline" className="h-24">
                <Users className="mr-2 h-5 w-5" />
                Manage Users
              </Button>
              <Button variant="outline" className="h-24">
                <Shield className="mr-2 h-5 w-5" />
                Security Settings
              </Button>
            </>
          )}
          <Button variant="outline" className="h-24">
            <Settings className="mr-2 h-5 w-5" />
            Account Settings
          </Button>
          <Button variant="outline" className="h-24">
            <Key className="mr-2 h-5 w-5" />
            Change Password
          </Button>
        </div>
      </div>
    </div>
  );
}