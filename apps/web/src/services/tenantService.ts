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

const API_BASE = import.meta.env.DEV ? "http://localhost:3000" : "";

export const tenantService = {
  async getTenantById(tenantId: string): Promise<Tenant> {
    const token = localStorage.getItem("access_token");

    console.log("🔐 Token being sent:", token);
    console.log("🔐 Token length:", token?.length);
    console.log("🔐 Token starts with:", token?.substring(0, 20) + "...");

    const response = await fetch(`${API_BASE}/api/tenants/${tenantId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log("🔐 Response status:", response.status);

    if (!response.ok) {
      throw new Error(`Failed to fetch tenant data: ${response.statusText}`);
    }

    return response.json();
  },

  async getCurrentUserTenant(): Promise<Tenant> {
    const token = localStorage.getItem("access_token");
    const response = await fetch(`${API_BASE}/api/tenants/current`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch current tenant data: ${response.statusText}`
      );
    }

    return response.json();
  },
};
