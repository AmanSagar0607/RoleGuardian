import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { AlertCircle } from "lucide-react";

interface LocationState {
  message?: string;
  requiredRoles?: string[];
  missingPermissions?: string[];
}

const Unauthorized = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userRole } = useAuth();
  const state = location.state as LocationState;

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="max-w-md w-full mx-auto p-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <h1 className="text-2xl font-bold">Access Denied</h1>
          
          <p className="text-muted-foreground">
            {state?.message || "You don't have permission to access this page."}
          </p>

          {state?.requiredRoles && (
            <div className="text-sm">
              <p className="font-medium">Required Roles:</p>
              <p className="text-muted-foreground">
                {state.requiredRoles.join(", ")}
              </p>
              <p className="mt-2">Your current role: {userRole || "none"}</p>
            </div>
          )}

          {state?.missingPermissions && (
            <div className="text-sm">
              <p className="font-medium">Missing Permissions:</p>
              <p className="text-muted-foreground">
                {state.missingPermissions.join(", ")}
              </p>
            </div>
          )}

          <div className="flex gap-4">
            <Button onClick={() => navigate(-1)}>
              Go Back
            </Button>
            <Button variant="outline" onClick={() => navigate("/dashboard")}>
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;