import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Role, Permission } from '@/types/auth';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: Role[];
  requiredPermissions?: Permission[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles = [],
  requiredPermissions = [],
}) => {
  const { user, isLoading, hasAnyRole, hasPermission } = useAuth();
  const location = useLocation();
  const [isCheckingRoles, setIsCheckingRoles] = useState(false);
  const [hasRequiredRole, setHasRequiredRole] = useState(true);

  useEffect(() => {
    const checkRoles = async () => {
      if (user && requiredRoles.length > 0) {
        setIsCheckingRoles(true);
        const hasRole = await hasAnyRole(requiredRoles);
        setHasRequiredRole(hasRole);
        setIsCheckingRoles(false);
      }
    };

    checkRoles();
  }, [user, requiredRoles, hasAnyRole]);

  if (isLoading || isCheckingRoles) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check roles if specified
  if (requiredRoles.length > 0 && !hasRequiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check permissions if specified
  if (requiredPermissions.length > 0 && 
      !requiredPermissions.every(permission => hasPermission(permission))) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;