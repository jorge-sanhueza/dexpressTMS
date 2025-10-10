import { useAuthStore } from "../store/authStore";
import type { Rol } from "../types/auth";
import { API_BASE } from "./apiConfig";
import { cacheService } from "./cacheService";

export interface CreateRoleDto {
  codigo: string;
  nombre: string;
  modulo: string;
  tipo_accion: string;
  descripcion?: string;
  orden?: number;
  activo?: boolean;
  tenantId?: string;
}

export interface UpdateRoleDto {
  codigo?: string;
  nombre?: string;
  modulo?: string;
  tipo_accion?: string;
  descripcion?: string;
  orden?: number;
  activo?: boolean;
}

class RolesService {
  private baseUrl = `${API_BASE}/api/roles`;
  private readonly CACHE_KEYS = {
    ALL_ROLES: (tenantId: string) => `roles:all:${tenantId}`,
    ROLES_BY_TENANT: (tenantId: string) => `roles:tenant:${tenantId}`,
    ROLES_BY_IDS: (roleIds: string[]) =>
      `roles:ids:${roleIds.sort().join(",")}`,
  };

  private getCurrentTenantId(): string {
    const { tenant } = useAuthStore.getState();
    if (!tenant) {
      throw new Error("No tenant found in auth store");
    }
    return tenant.id;
  }

  private clearRolesCache(): void {
    const tenantId = this.getCurrentTenantId();
    cacheService.delete(this.CACHE_KEYS.ALL_ROLES(tenantId));
    cacheService.delete(this.CACHE_KEYS.ROLES_BY_TENANT(tenantId));
    cacheService.clearByPrefix("roles:ids:");
    cacheService.clearByPrefix("roles:");
  }

  async getRolesByIds(roleIds: string[]): Promise<Rol[]> {
    try {
      const cacheKey = this.CACHE_KEYS.ROLES_BY_IDS(roleIds);

      const cached = cacheService.get(cacheKey);
      if (cached) {
        console.log("📦 Returning roles by IDs from cache");
        return cached;
      }

      const token = localStorage.getItem("access_token");
      const response = await fetch(`${this.baseUrl}/by-ids`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ roleIds }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch roles: ${response.statusText}`);
      }

      const roles = await response.json();

      cacheService.set(cacheKey, roles);
      console.log("💾 Cached roles by IDs");

      return roles;
    } catch (error) {
      console.error("Error fetching roles:", error);
      throw error;
    }
  }

  async getRolesByTenant(tenantId: string): Promise<Rol[]> {
    try {
      const cacheKey = this.CACHE_KEYS.ROLES_BY_TENANT(tenantId);

      const cached = cacheService.get(cacheKey);
      if (cached) {
        console.log("📦 Returning tenant roles from cache");
        return cached;
      }

      const token = localStorage.getItem("access_token");
      const response = await fetch(`${this.baseUrl}/by-tenant/${tenantId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch tenant roles: ${response.statusText}`);
      }

      const roles = await response.json();

      cacheService.set(cacheKey, roles);
      console.log("💾 Cached tenant roles");

      return roles;
    } catch (error) {
      console.error("Error fetching tenant roles:", error);
      throw error;
    }
  }

  async getAllRoles(): Promise<Rol[]> {
    try {
      const tenantId = this.getCurrentTenantId();
      const cacheKey = this.CACHE_KEYS.ALL_ROLES(tenantId);

      const cached = cacheService.get(cacheKey);
      if (cached) {
        console.log("📦 Returning all roles from cache");
        return cached;
      }

      const roles = await this.getRolesByTenant(tenantId);

      cacheService.set(cacheKey, roles);
      console.log("💾 Cached all roles");

      return roles;
    } catch (error) {
      console.error("Error fetching all roles:", error);
      throw error;
    }
  }

  async createRole(roleData: CreateRoleDto): Promise<Rol> {
    try {
      const tenantId = this.getCurrentTenantId();
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${this.baseUrl}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...roleData,
          tenantId: tenantId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create role: ${response.statusText}`);
      }

      const newRole = await response.json();

      this.clearRolesCache();
      console.log("🗑️ Cleared roles cache after creating role");

      return newRole;
    } catch (error) {
      console.error("Error creating role:", error);
      throw error;
    }
  }

  async updateRole(id: string, roleData: UpdateRoleDto): Promise<Rol> {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(roleData),
      });

      if (!response.ok) {
        throw new Error(`Failed to update role: ${response.statusText}`);
      }

      const updatedRole = await response.json();
      this.clearRolesCache();
      console.log("🗑️ Cleared roles cache after updating role");

      return updatedRole;
    } catch (error) {
      console.error("Error updating role:", error);
      throw error;
    }
  }

  async deleteRole(id: string): Promise<void> {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete role: ${response.statusText}`);
      }

      this.clearRolesCache();
      console.log("🗑️ Cleared roles cache after deleting role");
    } catch (error) {
      console.error("Error deleting role:", error);
      throw error;
    }
  }

  clearCache(): void {
    this.clearRolesCache();
    console.log("🗑️ Manually cleared all roles cache");
  }

  async refreshRoles(): Promise<Rol[]> {
    this.clearRolesCache();
    console.log("🔄 Force refreshing roles...");
    return await this.getAllRoles();
  }
}

export const rolesService = new RolesService();
