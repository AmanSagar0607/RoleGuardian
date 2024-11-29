import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Loader2, Plus, Trash2 } from "lucide-react";

interface Permission {
  id: string;
  name: string;
  description: string;
}

interface Role {
  id: string;
  name: string;
  permissions: string[];
}

export default function PermissionSettings() {
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [newRole, setNewRole] = useState({ name: "", permissions: [] as string[] });

  // Fetch roles and permissions
  useEffect(() => {
    fetchRolesAndPermissions();
  }, []);

  const fetchRolesAndPermissions = async () => {
    setLoading(true);
    try {
      // Fetch roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('roles')
        .select('*');

      if (rolesError) throw rolesError;

      // Fetch permissions
      const { data: permissionsData, error: permissionsError } = await supabase
        .from('permissions')
        .select('*');

      if (permissionsError) throw permissionsError;

      setRoles(rolesData || []);
      setPermissions(permissionsData || []);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch roles and permissions");
    } finally {
      setLoading(false);
    }
  };

  const handleAddRole = async () => {
    if (!newRole.name) {
      toast.error("Role name is required");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('roles')
        .insert([
          {
            name: newRole.name,
            permissions: newRole.permissions,
          },
        ]);

      if (error) throw error;

      toast.success("Role added successfully");
      setNewRole({ name: "", permissions: [] });
      fetchRolesAndPermissions();
    } catch (error: any) {
      toast.error(error.message || "Failed to add role");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm("Are you sure you want to delete this role?")) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('roles')
        .delete()
        .eq('id', roleId);

      if (error) throw error;

      toast.success("Role deleted successfully");
      fetchRolesAndPermissions();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete role");
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = (roleId: string, permission: string, checked: boolean) => {
    setRoles((prev) =>
      prev.map((role) => {
        if (role.id === roleId) {
          const updatedPermissions = checked
            ? [...role.permissions, permission]
            : role.permissions.filter((p) => p !== permission);
          return { ...role, permissions: updatedPermissions };
        }
        return role;
      })
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Role</CardTitle>
          <CardDescription>Create a new role with specific permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="roleName">Role Name</Label>
              <Input
                id="roleName"
                value={newRole.name}
                onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                placeholder="Enter role name"
              />
            </div>

            <div className="space-y-2">
              <Label>Permissions</Label>
              <Select
                value={newRole.permissions[0]}
                onValueChange={(value) =>
                  setNewRole({ ...newRole, permissions: [value] })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select permissions" />
                </SelectTrigger>
                <SelectContent>
                  {permissions.map((permission) => (
                    <SelectItem key={permission.id} value={permission.id}>
                      {permission.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleAddRole} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Plus className="mr-2 h-4 w-4" />
              Add Role
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Role Permissions</CardTitle>
          <CardDescription>Manage permissions for each role</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Role</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell className="font-medium">{role.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        {permissions.map((permission) => (
                          <Button
                            key={permission.id}
                            variant={role.permissions.includes(permission.id) ? "default" : "outline"}
                            size="sm"
                            onClick={() =>
                              handlePermissionChange(
                                role.id,
                                permission.id,
                                !role.permissions.includes(permission.id)
                              )
                            }
                          >
                            {permission.name}
                          </Button>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteRole(role.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}