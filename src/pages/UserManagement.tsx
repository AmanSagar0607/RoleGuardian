import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const UserManagement = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">User Management</h1>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User List</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              View and manage all user accounts.
            </p>
            <div className="space-y-2">
              <p>Feature coming soon:</p>
              <ul className="list-disc list-inside">
                <li>User list with search and filter</li>
                <li>Role assignment</li>
                <li>Account status management</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserManagement;