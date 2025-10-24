import { rolesService } from "@/services/rolesService";
import type {
  CreateRoleDto,
  RolesFilterDto,
  UpdateRoleDto,
} from "@/types/role";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const roleKeys = {
  all: ["roles"] as const,
  lists: () => [...roleKeys.all, "list"] as const,
  list: (filters?: RolesFilterDto) => [...roleKeys.lists(), filters] as const,
  details: () => [...roleKeys.all, "detail"] as const,
  detail: (id: string) => [...roleKeys.details(), id] as const,
  byIds: (ids: string[]) => [...roleKeys.all, "by-ids", ids] as const,
  byTenant: (tenantId: string) =>
    [...roleKeys.all, "by-tenant", tenantId] as const,
  filters: {
    modules: () => [...roleKeys.all, "filters", "modules"] as const,
    tipoAcciones: () => [...roleKeys.all, "filters", "tipo-acciones"] as const,
  },
};

export function useRoles(filters?: RolesFilterDto) {
  return useQuery({
    queryKey: roleKeys.list(filters),
    queryFn: () => rolesService.getAllRoles(filters),
    staleTime: 5 * 60 * 1000,
  });
}

export function useAvailableModules() {
  return useQuery({
    queryKey: roleKeys.filters.modules(),
    queryFn: () => rolesService.getAvailableModules(),
    staleTime: 10 * 60 * 1000,
  });
}

export function useAvailableTipoAcciones() {
  return useQuery({
    queryKey: roleKeys.filters.tipoAcciones(),
    queryFn: () => rolesService.getAvailableTipoAcciones(),
    staleTime: 10 * 60 * 1000,
  });
}

export function useRolesByTenant(tenantId: string) {
  return useQuery({
    queryKey: roleKeys.byTenant(tenantId),
    queryFn: () => rolesService.getRolesByTenant(),
    enabled: !!tenantId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useRolesByIds(roleIds: string[]) {
  return useQuery({
    queryKey: roleKeys.byIds(roleIds),
    queryFn: () => rolesService.getRolesByIds(roleIds),
    enabled: roleIds.length > 0,
    staleTime: 10 * 60 * 1000,
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roleData: CreateRoleDto) => rolesService.createRole(roleData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.all });
    },
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, roleData }: { id: string; roleData: UpdateRoleDto }) =>
      rolesService.updateRole(id, roleData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.all });
    },
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => rolesService.deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.all });
    },
  });
}
