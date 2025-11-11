import { apiClient } from "../lib/api-client";
import { useAuthStore } from "../store/authStore";
import type {
  CreateRoleDto,
  PaginatedRolesResponse,
  Rol,
  RolesFilterDto,
  UpdateRoleDto,
} from "../types/role";
import { API_BASE } from "./apiConfig";

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
    try {
      const response = await apiClient.post(`${this.baseUrl}/by-ids`, {
        roleIds,
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error("🔧 API Error response:", errorText);
        throw new Error(
          `Failed to fetch roles: ${response.statusText} - ${errorText}`
        );
      }
      const roles = await response.json();
      return roles;
    } catch (error) {
      console.error("🔧 Error in getRolesByIds:", error);
      throw error;
    }
  }

  async getRolesByTenant(): Promise<Rol[]> {
    const response = await this.getAllRoles();
    return response.roles;
  }

  async getRolesByCodes(roleCodes: string[]): Promise<Rol[]> {
    try {
      console.log("🔧 [getRolesByCodes] Fetching roles by codes:", roleCodes);

      // Since we don't have a bulk by-codes endpoint, we'll fetch one by one
      const rolesPromises = roleCodes.map((code) => this.getRoleByCode(code));

      const rolesResults = await Promise.all(rolesPromises);

      // Filter out null results (roles not found)
      const roles = rolesResults.filter((role) => role !== null) as Rol[];

      console.log("🔧 [getRolesByCodes] Fetched roles:", roles);
      return roles;
    } catch (error) {
      console.error("🔧 [getRolesByCodes] Error:", error);
      throw error;
    }
  }

  // And update the existing getRoleByCode to use the correct endpoint
  async getRoleByCode(codigo: string): Promise<Rol | null> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/by-code/${codigo}`);

      if (!response.ok) {
        if (response.status === 404) {
          console.warn(`Role with code '${codigo}' not found`);
          return null;
        }
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch role by code: ${response.statusText} - ${errorText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error(`🔧 Error fetching role by code ${codigo}:`, error);
      return null;
    }
  }

  async getAllRoles(filters?: RolesFilterDto): Promise<PaginatedRolesResponse> {
    const queryParams = new URLSearchParams();

    if (filters?.search) {
      queryParams.append("search", filters.search);
    }
    if (filters?.modulo) {
      queryParams.append("modulo", filters.modulo);
    }
    if (filters?.tipo_accion) {
      queryParams.append("tipo_accion", filters.tipo_accion);
    }
    if (filters?.activo !== undefined) {
      queryParams.append("activo", filters.activo.toString());
    }
    if (filters?.page) {
      queryParams.append("page", filters.page.toString());
    }
    if (filters?.limit) {
      queryParams.append("limit", filters.limit.toString());
    }

    const queryString = queryParams.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;

    const response = await apiClient.get(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch roles: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      roles: data.roles,
      total: Number(data.total),
      page: Number(data.page),
      limit: Number(data.limit),
    };
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

  async getAvailableModules(): Promise<string[]> {
    const response = await apiClient.get(`${this.baseUrl}/filters/modules`);

    if (!response.ok) {
      throw new Error(`Failed to fetch modules: ${response.statusText}`);
    }

    return await response.json();
  }

  async getAvailableTipoAcciones(): Promise<string[]> {
    const response = await apiClient.get(
      `${this.baseUrl}/filters/tipo-acciones`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch tipo acciones: ${response.statusText}`);
    }

    return await response.json();
  }
}

export const rolesService = new RolesService();
