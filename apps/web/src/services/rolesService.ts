import type { Rol } from "../types/auth";

class RolesService {
  private baseUrl = "/api/roles";

  async getRolesByIds(roleIds: string[]): Promise<Rol[]> {
    try {
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
}

export const rolesService = new RolesService();
