// Define Role type to match database roles
export type Role = 'admin' | 'moderator' | 'user';

// Define Permission type based on role permissions
export type Permission = 
  | 'read:users'
  | 'write:users'
  | 'delete:users'
  | 'manage:roles'
  | 'read:content'
  | 'write:content'
  | 'delete:content'
  | 'moderate:content'
  | 'manage:settings'
  | 'view:dashboard'
  | 'view:reports';

// Database user role interface matching the SQL table
export interface UserRole {
  id: string;
  user_id: string;
  role: Role;
  created_at: string;
  updated_at: string;
}

// User metadata interface
export interface UserMetadata {
  full_name?: string;
  avatar_url?: string;
  role?: Role;
  website?: string;
}

// User interface
export interface User {
  id: string;
  email: string;
  role: Role;
  permissions: Permission[];
  user_metadata: UserMetadata;
}

// Role update payload type
export type RoleUpdatePayload = {
  user_id: string;
  role: Role;
};
