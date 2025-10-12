// src/services/rolesService.ts
import { apiClient } from "../lib/api-client";
import { useAuthStore } from "../store/authStore";
import type { Rol } from "../types/auth";
import { API_BASE } from "./apiConfig";

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

  private getCurrentTenantId(): string {
    const { tenant } = useAuthStore.getState();
    if (!tenant) {
      throw new Error("No tenant found in auth store");
    }
    return tenant.id;
  }

  async getRolesByIds(roleIds: string[]): Promise<Rol[]> {
    const response = await apiClient.post(`${this.baseUrl}/by-ids`, {
      roleIds,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch roles: ${response.statusText}`);
    }

    return await response.json();
  }

  async getRolesByTenant(tenantId: string): Promise<Rol[]> {
    const response = await apiClient.get(
      `${this.baseUrl}/by-tenant/${tenantId}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch tenant roles: ${response.statusText}`);
    }

    return await response.json();
  }

  async getAllRoles(): Promise<Rol[]> {
    const tenantId = this.getCurrentTenantId();
    return await this.getRolesByTenant(tenantId);
  }

  async createRole(roleData: CreateRoleDto): Promise<Rol> {
    const tenantId = this.getCurrentTenantId();
    const response = await apiClient.post(this.baseUrl, {
      ...roleData,
      tenantId: tenantId,
    });

    if (!response.ok) {
      throw new Error(`Failed to create role: ${response.statusText}`);
    }

    return await response.json();
  }

  async updateRole(id: string, roleData: UpdateRoleDto): Promise<Rol> {
    const response = await apiClient.put(`${this.baseUrl}/${id}`, roleData);

    if (!response.ok) {
      throw new Error(`Failed to update role: ${response.statusText}`);
    }

    return await response.json();
  }

  async deleteRole(id: string): Promise<void> {
    const response = await apiClient.delete(`${this.baseUrl}/${id}`);

    if (!response.ok) {
      throw new Error(`Failed to delete role: ${response.statusText}`);
    }
  }
}

export const rolesService = new RolesService();
