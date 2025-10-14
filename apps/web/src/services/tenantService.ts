import { API_BASE } from "./apiConfig";

export interface Tenant {
  id: string;
  nombre: string;
  contacto: string;
  rut: string;
  activo: boolean;
  logo_url?: string;
  tipo_tenant_id?: string;
  estado_id?: string;
  created_at?: string;
  updated_at?: string;
}

export const tenantService = {
  async getTenantById(tenantId: string): Promise<Tenant> {
    console.log("🏢 tenantService.getTenantById called with ID:", tenantId);

    const token = localStorage.getItem("access_token");
    console.log("🔑 Token available:", !!token);

    const url = `${API_BASE}/api/tenants/${tenantId}`;
    console.log("🌐 Making request to:", url);

    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("📡 Response status:", response.status);
      console.log("📡 Response ok:", response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ API Error response:", errorText);
        throw new Error(
          `Failed to fetch tenant data: ${response.status} - ${response.statusText} - ${errorText}`
        );
      }

      const tenantData = await response.json();
      console.log("✅ Tenant data received:", tenantData);
      return tenantData;
    } catch (error) {
      console.error("❌ Error in tenantService.getTenantById:");

      // Proper error handling
      if (error instanceof Error) {
        console.error("Error message:", error.message);
        console.error("Error name:", error.name);
      } else {
        console.error("Unknown error type:", error);
      }

      throw error;
    }
  },

  async getCurrentUserTenant(): Promise<Tenant> {
    const token = localStorage.getItem("access_token");

    try {
      const response = await fetch(`${API_BASE}/api/tenants/current`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch current tenant data: ${response.status} - ${response.statusText} - ${errorText}`
        );
      }

      return response.json();
    } catch (error) {
      console.error("❌ Error in getCurrentUserTenant:");

      if (error instanceof Error) {
        console.error("Error message:", error.message);
      } else {
        console.error("Unknown error type:", error);
      }

      throw error;
    }
  },
};
