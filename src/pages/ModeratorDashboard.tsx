import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const ModeratorDashboard = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Moderator Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Content Moderation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Review and moderate user-generated content.
            </p>
            <Button>Review Content</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Handle user reports and complaints.
            </p>
            <Button>View Reports</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activity Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Monitor moderation activities and user behavior.
            </p>
            <Button variant="secondary">View Logs</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ModeratorDashboard;