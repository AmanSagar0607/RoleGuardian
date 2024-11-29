import { createContext, useContext, useEffect, useState } from "react";
import { User as SupabaseUser, AuthError } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { Role, Permission, User } from "@/types/auth";
import { toast } from "sonner";

// Role-based permission mapping
const rolePermissions: Record<Role, Permission[]> = {
  admin: [
    'read:users',
    'write:users',
    'delete:users',
    'manage:roles',
    'read:content',
    'write:content',
    'delete:content',
    'moderate:content',
    'manage:settings',
    'view:dashboard',
    'view:reports'
  ],
  moderator: [
    'read:users',
    'moderate:content',
    'read:content',
    'write:content',
    'view:dashboard',
    'view:reports'
  ],
  user: [
    'read:content',
    'view:dashboard'
  ]
};

interface AuthContextType {
  user: User | null;
  userRole: Role | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role?: Role) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  hasPermission: (permission: Permission) => boolean;
  hasRole: (role: Role) => Promise<boolean>;
  hasAnyRole: (roles: Role[]) => Promise<boolean>;
  getCurrentRole: () => Promise<Role | null>;
  updateUserRole: (userId: string, newRole: Role) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cache for user roles
  const roleCache = new Map<string, Role>();

  const fetchUserRole = async (userId: string): Promise<Role | null> => {
    try {
      // Check cache first
      if (roleCache.has(userId)) {
        return roleCache.get(userId) || null;
      }

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching user role:', error);
        return null;
      }

      // Cache the role
      if (data?.role) {
        roleCache.set(userId, data.role);
      }

      return data?.role || null;
    } catch (error) {
      console.error('Error in fetchUserRole:', error);
      return null;
    }
  };

  const updateUserState = async (supabaseUser: SupabaseUser | null) => {
    try {
      if (!supabaseUser) {
        setUser(null);
        setUserRole(null);
        roleCache.clear(); // Clear cache on logout
        return;
      }

      const role = await fetchUserRole(supabaseUser.id);
      
      if (!role) {
        console.warn('No role found for user:', supabaseUser.id);
        setUser(null);
        setUserRole(null);
        return;
      }

      const userData = {
        id: supabaseUser.id,
        email: supabaseUser.email!,
        role,
        permissions: rolePermissions[role],
        user_metadata: supabaseUser.user_metadata
      };

      // Update state in one batch
      setUserRole(role);
      setUser(userData);

      // Store in localStorage for faster initial load
      localStorage.setItem('userRole', role);
      localStorage.setItem('userData', JSON.stringify(userData));
    } catch (error) {
      console.error('Error in updateUserState:', error);
      setUser(null);
      setUserRole(null);
    }
  };

  // Initialize state from localStorage
  useEffect(() => {
    const storedRole = localStorage.getItem('userRole');
    const storedUserData = localStorage.getItem('userData');

    if (storedRole && storedUserData) {
      try {
        const userData = JSON.parse(storedUserData);
        setUserRole(storedRole as Role);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
      }
    }
  }, []);

  const refreshSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      await updateUserState(session?.user || null);
    } catch (error) {
      console.error('Error refreshing session:', error);
      setUser(null);
      setUserRole(null);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setIsLoading(true);
      await updateUserState(session?.user || null);
      setIsLoading(false);
    });

    // Initial session check
    refreshSession().finally(() => setIsLoading(false));

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data: { user: supabaseUser }, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      if (!supabaseUser) throw new Error('Login failed');

      // Pre-fetch role while signing in
      const role = await fetchUserRole(supabaseUser.id);
      if (role) {
        roleCache.set(supabaseUser.id, role);
      }

      await updateUserState(supabaseUser);
      toast.success('Logged in successfully');
    } catch (error) {
      const e = error as AuthError;
      toast.error(e.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, role: Role = 'user'): Promise<void> => {
    setIsLoading(true);
    try {
      console.log('Starting signup process...');
      
      // Step 1: Sign up the user
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { role }
        }
      });

      if (signUpError) {
        console.error('Signup error:', signUpError);
        throw signUpError;
      }

      if (!data.user) {
        console.error('No user returned from signup');
        throw new Error('Registration failed - no user returned');
      }

      console.log('User created successfully:', data.user.id);

      // Step 2: Auto verify using RPC function
      const { error: verifyError } = await supabase.rpc('auto_verify_email', {
        user_id: data.user.id
      });

      if (verifyError) {
        console.error('Verification error:', verifyError);
        // Continue anyway as the user might still be able to sign in
      }

      // Step 3: Sign in immediately
      console.log('Attempting sign in...');
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) {
        console.error('Sign in error:', signInError);
        throw signInError;
      }

      // Step 4: Update user state
      const newUser = {
        id: data.user.id,
        email: data.user.email!,
        role,
        permissions: rolePermissions[role],
        user_metadata: data.user.user_metadata
      };

      setUserRole(role);
      setUser(newUser);
      localStorage.setItem('userRole', role);
      localStorage.setItem('userData', JSON.stringify(newUser));
      
      toast.success('Registration successful! You are now logged in.');
    } catch (error: any) {
      console.error('Registration process error:', error);
      toast.error(error.message || 'Registration failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear all cached data
      roleCache.clear();
      localStorage.removeItem('userRole');
      localStorage.removeItem('userData');
      
      setUser(null);
      setUserRole(null);
      toast.success('Logged out successfully');
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  const hasPermission = (permission: Permission) => {
    return user?.permissions.includes(permission) || false;
  };

  const hasRole = async (requiredRole: Role): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('has_role', { required_role: requiredRole });
      if (error) throw error;
      return !!data;
    } catch (error) {
      console.error('Error checking role:', error);
      return false;
    }
  };

  const hasAnyRole = async (roles: Role[]): Promise<boolean> => {
    try {
      if (!user || roles.length === 0) return false;
      
      // Check if user has any of the required roles
      const currentRole = await getCurrentRole();
      if (!currentRole) return false;
      
      return roles.includes(currentRole);
    } catch (error) {
      console.error('Error checking roles:', error);
      return false;
    }
  };

  const getCurrentRole = async (): Promise<Role | null> => {
    try {
      const { data, error } = await supabase.rpc('get_user_role');
      if (error) throw error;
      return data as Role;
    } catch (error) {
      console.error('Error getting current role:', error);
      return null;
    }
  };

  const updateUserRole = async (userId: string, newRole: Role): Promise<void> => {
    try {
      const { error } = await supabase.rpc('update_user_role', {
        target_user_id: userId,
        new_role: newRole
      });
      
      if (error) throw error;
      
      // Refresh the current user's state if their role was updated
      if (user && user.id === userId) {
        await updateUserState(await supabase.auth.getUser().then(res => res.data.user));
      }
      
      toast.success('Role updated successfully');
    } catch (error: any) {
      console.error('Error updating role:', error);
      toast.error(error.message || 'Failed to update role');
      throw error;
    }
  };

  const value = {
    user,
    userRole,
    isLoading,
    signIn,
    signUp,
    signOut,
    refreshSession,
    hasPermission,
    hasRole,
    hasAnyRole,
    getCurrentRole,
    updateUserRole
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};