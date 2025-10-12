import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  rolesService,
  type CreateRoleDto,
  type UpdateRoleDto,
} from "../services/rolesService";

// Query keys for consistent cache management
export const roleKeys = {
  all: ["roles"] as const,
  lists: () => [...roleKeys.all, "list"] as const,
  list: (tenantId: string) => [...roleKeys.lists(), tenantId] as const,
  details: () => [...roleKeys.all, "detail"] as const,
  detail: (id: string) => [...roleKeys.details(), id] as const,
  byIds: (ids: string[]) => [...roleKeys.all, "by-ids", ids] as const,
  byTenant: (tenantId: string) =>
    [...roleKeys.all, "by-tenant", tenantId] as const,
};

// Hook for fetching all roles
export function useRoles(tenantId: string) {
  return useQuery({
    queryKey: roleKeys.list(tenantId),
    queryFn: () => rolesService.getAllRoles(),
    enabled: !!tenantId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook for fetching roles by IDs
export function useRolesByIds(roleIds: string[]) {
  return useQuery({
    queryKey: roleKeys.byIds(roleIds),
    queryFn: () => rolesService.getRolesByIds(roleIds),
    enabled: roleIds.length > 0,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook for fetching roles by tenant
export function useRolesByTenant(tenantId: string) {
  return useQuery({
    queryKey: roleKeys.byTenant(tenantId),
    queryFn: () => rolesService.getRolesByTenant(tenantId),
    enabled: !!tenantId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook for creating a role
export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roleData: CreateRoleDto) => rolesService.createRole(roleData),
    onSuccess: () => {
      // Invalidate all roles queries
      queryClient.invalidateQueries({ queryKey: roleKeys.all });
    },
  });
}

// Hook for updating a role
export function useUpdateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, roleData }: { id: string; roleData: UpdateRoleDto }) =>
      rolesService.updateRole(id, roleData),
    onSuccess: () => {
      // Invalidate all roles queries
      queryClient.invalidateQueries({ queryKey: roleKeys.all });
    },
  });
}

// Hook for deleting a role
export function useDeleteRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => rolesService.deleteRole(id),
    onSuccess: () => {
      // Invalidate all roles queries
      queryClient.invalidateQueries({ queryKey: roleKeys.all });
    },
  });
}
