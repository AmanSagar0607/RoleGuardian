import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const Settings = () => {
  const { userRole } = useAuth();

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Application Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Configure your application preferences.
            </p>
            {userRole === "admin" ? (
              <div className="space-y-2">
                <p>Admin Settings:</p>
                <ul className="list-disc list-inside">
                  <li>System configuration</li>
                  <li>Security settings</li>
                  <li>Role management</li>
                </ul>
              </div>
            ) : (
              <div className="space-y-2">
                <p>User Settings:</p>
                <ul className="list-disc list-inside">
                  <li>Profile settings</li>
                  <li>Notification preferences</li>
                  <li>Privacy settings</li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;