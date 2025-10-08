import { useAuthStore } from "../store/authStore";
import type { Rol } from "../types/auth";
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
      const token = localStorage.getItem("access_token");
      //no me gusta este endpoint
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

      return await response.json();
    } catch (error) {
      console.error("Error fetching roles:", error);
      throw error;
    }
  }

  async getRolesByTenant(tenantId: string): Promise<Rol[]> {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${this.baseUrl}/by-tenant/${tenantId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch tenant roles: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching tenant roles:", error);
      throw error;
    }
  }
  async getAllRoles(): Promise<Rol[]> {
    try {
      const tenantId = this.getCurrentTenantId();
      return await this.getRolesByTenant(tenantId);
    } catch (error) {
      console.error("Error fetching all roles:", error);
      throw error;
    }
  }

  async createRole(roleData: Omit<Rol, "id">): Promise<Rol> {
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

      return await response.json();
    } catch (error) {
      console.error("Error creating role:", error);
      throw error;
    }
  }

  async updateRole(id: string, roleData: Partial<Rol>): Promise<Rol> {
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

      return await response.json();
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
    } catch (error) {
      console.error("Error deleting role:", error);
      throw error;
    }
  }
}

export const rolesService = new RolesService();
